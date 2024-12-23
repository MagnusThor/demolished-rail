import axios from 'axios';
import { solarizedDark } from 'cm6-theme-solarized-dark';
import { basicSetup } from 'codemirror';

import {
  defaultKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { rust } from '@codemirror/lang-rust';
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
} from '@codemirror/view';

import {
  defaultMainShader,
  defaultWglslVertex,
  Geometry,
  IMaterialShader,
  initWebGPU,
  Material,
  rectGeometry,
  WGSLShaderRenderer,
} from '../../../src';
import { CameraHelper } from '../../../src/Engine/Helpers/CameraHelper';
import { computeShader } from '../../assets/shaders/wgsl-compute/computeShader';
import { defaultComputeShader } from './defaultComputeShader';
import { DOMUtils } from './DOMUtis';
import {
  clearAllDecorations,
  decorationField,
  setTitleForLine,
} from './errorDecorator';
import {
  getShadeTypeName,
  IDocumentData,
  StoredShader,
  TypeOfShader,
} from './models/StoredShader';
import { plasmaShader } from './plasmaShader';
import {
  IOfflineGraph,
  OfflineStorage,
} from './store/OfflineStorage';

const randomStr = () => (Math.random() + 1).toString(36).substring(2);

export interface IError {
    name: string,
    documentIndex: number,
    errors: GPUCompilationInfo,

}
export class Editor {

    renderer!: WGSLShaderRenderer;
    storage!: OfflineStorage<StoredShader>;
    state!: EditorState;
    editorView!: EditorView;
    currentShader!: StoredShader;
    isRunning!: boolean;

    sourceIndex: number = 0;
    cameraState!: CameraHelper;

    async tryCompile(sources: IDocumentData[]): Promise<IError[]> {
        const results = await Promise.all(sources.map(async (document, index) => {
            const source = document.source;
            const shaderModule = this.renderer.device.createShaderModule({
                code: source
            });
            const compileError: IError = {
                documentIndex: index,
                name: document.name,
                errors: await shaderModule.getCompilationInfo(),
            }
            return compileError
        }));
        return results;
    }


    async tryAddShaders(documents: IDocumentData[]): Promise<void> {
        this.renderer.renderPassBacklog.clear();
        const rectangle = new Geometry(this.renderer.device, rectGeometry);
        await Promise.all(documents.map(async (document, index) => {
            const source = document.source;
            if (document.type === TypeOfShader.Frag) {
                const material = new Material(this.renderer.device, {
                    fragment: source,
                    vertex: defaultWglslVertex                    
                });
                this.renderer.addRenderPass(`RENDERPASS${index - 1}`, material, rectangle, []);                
            }else if (document.type === TypeOfShader.Compute){

                this.renderer.addComputeRenderPass(`RENDERPASS${index - 1}`,
                    source);

                

            }
            return true
        }));
        
        defaultMainShader.fragment = documents[0].source; 
        this.updateMainRenderPass(defaultMainShader);
        return;
    }

    updateMainRenderPass(material: IMaterialShader) {
        this.renderer.addMainRenderPass(material);
    }

    async onCompile(view: EditorView): Promise<boolean> {
        this.renderer.clear();
       
        this.currentShader.documents[this.sourceIndex].source = view.state.doc.toString();
        if (this.isRunning) {
            this.renderer.pause();
            this.isRunning = false;
        }
        const pa = DOMUtils.get("#btn-run-shader i");
        if (pa.classList.contains("bi-stop-fill")) {
            pa.classList.remove("bi-stop-fill");
            pa.classList.add("bi-play-btn-fill");
        }

        this.tryCompile(this.currentShader.documents).then(compileInfo => {

            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
            clearAllDecorations(view);
            const resultEl = DOMUtils.get("#compiler-result");
            DOMUtils.removeChilds(resultEl);
            const hasErrors = compileInfo.some(ci => ci.errors.messages.length > 0);

            if (hasErrors) {

                this.updateImmediate(`Shader compilation failed.`);

                resultEl.classList.remove("d-none");
                const firstCorruptShader = compileInfo.filter(pre => {
                    return pre.errors.messages.length > 0
                })[0];

                DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = true;

                if (firstCorruptShader.documentIndex != this.sourceIndex) {

                    DOMUtils.get<HTMLSelectElement>("#select-source").selectedIndex = firstCorruptShader.documentIndex;

                    const transaction = this.editorView.state.update({
                        changes: {
                            from: 0, to: this.editorView.state.doc.length, insert:
                                this.currentShader.documents[firstCorruptShader.documentIndex].source
                        }
                    });
                    // Dispatch the transaction to the editor view
                    this.editorView.dispatch(transaction);
                    this.sourceIndex = firstCorruptShader.documentIndex;
                }

                firstCorruptShader.errors.messages.forEach(error => {
                    resultEl.append(DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                    setTitleForLine(view, error.lineNum, error.message);
                });

            } else {
                resultEl.classList.add("d-none");
                DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
                this.updateImmediate(`Successfully compiled shader.`);
            }

        }).catch(err => {          
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = true;
        });
        return true;
    }

    toggleCanvasFullScreen(): void {
        const canvas = DOMUtils.get<HTMLCanvasElement>("canvas");
        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }


    async setupEditor(shader: StoredShader) {    
        const canvas = document.querySelector("canvas")!;
        const {device,adapter,context} = await initWebGPU(canvas);
        this.renderer = new WGSLShaderRenderer(canvas,
            device,context!);

        this.cameraState = new CameraHelper(canvas)




        DOMUtils.on("click","#btn-compile",async () => {
            this.onCompile(this.editorView).then(result => {  
               // do på                      
            }).catch(err => {
                console.log(err);
            });
        });

            // btn-compile
        const customKeyMap = [
            {
                key: "Mod-Shift-b", run: (view: EditorView) => {
                
                    this.onCompile(view).then(result => {                       
                    }).catch(err => {
                        console.log(err);
                    });
                    return true;
                }
            },
            {
                key: "Mod-s", run: () => {
                    this.saveCurrentShader();
                    return true;
                }
            }
            , {
                key: "Mod-Shift-f", run: (view: EditorView) => {
                    return true;
                },
            }
        ];



        const state = EditorState.create({
            doc: shader.documents[this.sourceIndex].source,
            extensions: [
                solarizedDark,
                indentOnInput(),
                basicSetup, rust(), keymap.of([
                    ...defaultKeymap, ...customKeyMap, indentWithTab
                ]),
                syntaxHighlighting(defaultHighlightStyle),
                bracketMatching(),
                decorationField,
                EditorView.lineWrapping,
                EditorView.domEventHandlers({
                    los: () => {
                    }
                })
            ],
        });
        this.editorView = new EditorView({
            state,
            parent: DOMUtils.get("#editor")
        });
        this.state = state;
        this.isRunning = false;
    }

     updateImmediate(text:string):void {
        DOMUtils.get("#immediate").textContent = text;
     }

    setupUI(): void {



        const isSplashShown = localStorage.getItem("showSplash")

        if(!isSplashShown){
         
            localStorage.setItem("showSplash",Date.now().toString())
            
        }else{
            DOMUtils.get("#splash").classList.add("d-none");
        }

        DOMUtils.get<HTMLButtonElement>("#btn-run-shader").addEventListener("click", (e) => {
            this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();
            DOMUtils.get("#btn-run-shader i").classList.toggle("bi-play-btn-fill")
            DOMUtils.get("#btn-run-shader i").classList.toggle("bi-stop-fill")
           
            if (this.isRunning) {

                this.renderer.isPaused = true;

            } else {
                this.renderer.isPaused = false;
            }
        
            const gpuStats = DOMUtils.get("#stats-gpu");
            const fpsStats = DOMUtils.get("#stats-fps");
            this.tryAddShaders(this.currentShader.documents).then(p => {
                this.updateImmediate("Running shader...");
                this.renderer.start(0, 2000, (frame,fps) => {  
                    if (document.fullscreenElement === this.renderer.canvas) {
                        const cameraState = this.cameraState.updateAndGetCameraState();                                      
                        this.renderer.uniforms.setUniforms(new Float32Array(cameraState.origin),4);
                        
                        this.renderer.uniforms.updateUniformBuffer();
                    }                    
                    if(this.renderer.gpuTimer.supportsTimeStampQuery){                            
                        gpuStats.textContent = `${this.renderer.gpuAverage!.get().toFixed(0)}µs`;
                      }
                      fpsStats.textContent = `${fps}`
                });
            });
            this.isRunning = !this.isRunning;
        });

        DOMUtils.on("click", "#btn-save", () => {
        
            this.saveCurrentShader();
        });

        DOMUtils.on("click", "#btn-new", () => {            

            const item = new StoredShader(`Shader ${randomStr()}`, "N/A",1);

            const shaderTypeToCreate =  parseInt(
            DOMUtils.get<HTMLInputElement>("#shader-type")!.value);

            // Cretae a default main fragment shader
            item.addDocument(randomStr(), defaultMainShader.fragment, TypeOfShader.MainFrag);

            if(shaderTypeToCreate == TypeOfShader.Frag) {
                item.addDocument(randomStr(), plasmaShader.fragment, TypeOfShader.Frag);         
            }else if(shaderTypeToCreate == TypeOfShader.Compute){
                item.addDocument(randomStr(), computeShader, TypeOfShader.Compute);   
            }
            
            this.storage.insert(item);
            this.setCurrentShader(item);
            this.storage.save();

            this.updateImmediate(`Shader ${item.name} created...`)


        });

        DOMUtils.on("click", "#btn-delete", () => {
            this.updateImmediate(`Shader ${this.currentShader.name} deleted...`)
            this.storage.delete(this.currentShader);
           // get the firstShader from the storage,
            let firstShader = this.storage.all()[0];
            this.setCurrentShader(firstShader);
            this.storage.save();
        });

        DOMUtils.on("click", "#btn-canvas-fullscreen", this.toggleCanvasFullScreen)

        DOMUtils.on("click", "#btn-clone", () => {
            const clone = new StoredShader(`Copy of ${this.currentShader.name}`,
                this.currentShader.description,1);
            clone.documents = this.currentShader.documents;
            this.storage.insert(clone);
            this.currentShader = clone;
            this.updateImmediate(`Shader forked, new shader is  ${clone.name} `)
        });

        //

        const btnAddRenderPasses = DOMUtils.getAll("button.add-renderpass")

        btnAddRenderPasses.forEach ( btn  => {
                const el = btn as HTMLButtonElement;
                el.addEventListener("click",() => {
                    const shadertype  = parseInt(el.dataset.typeofpass!);
                    const renderpass: IDocumentData = {
                        type: shadertype,
                        name: randomStr(),
                        source: shadertype === TypeOfShader.Frag ? plasmaShader.fragment : defaultComputeShader
                    }
                    this.currentShader.documents.push(renderpass);
                    this.renderSourceList(this.currentShader.documents);
                    this.saveCurrentShader();
                    this.updateImmediate(`New render pass added to the shader... `)
                })
        });

      
        DOMUtils.on("click", "#btn-remove-renderpass", () => {
            this.currentShader.documents.splice(this.sourceIndex, 1);
            const transaction = this.editorView.state.update({
                changes: {
                    from: 0, to: this.editorView.state.doc.length, insert:
                        this.currentShader.documents[0].source
                }
            })
            this.editorView.dispatch(transaction);
            this.sourceIndex = 0;
            this.renderSourceList(this.currentShader.documents);
            this.updateImmediate(`Render pass deleted...`);
        });

        DOMUtils.on("click", "#btn-export", () => {

            const blob = new Blob([this.storage.deSerialize()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = DOMUtils.create<HTMLAnchorElement>("a");
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);

            this.updateImmediate(`Shaders exported...`);

        });

        DOMUtils.on<HTMLInputElement>("change", "#upload-json", (evt, fileInput) => {
            if (!fileInput || fileInput.files?.length === 0) {
                return;
            } 
            const file = fileInput.files![0];            
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const content = event.target?.result as string;
                try {
                    const data = JSON.parse(content) as IOfflineGraph<StoredShader>;
                    data.collection.forEach(shader => {
                        const clone = new StoredShader(`${shader.name}`,
                            shader.description,1);
                        clone.documents = shader.documents;
                        this.storage.insert(clone);
                    });
                    this.storage.save();
                    this.renderStoredShaders(this.storage.all())
                    const p = DOMUtils.create("p");
                    p.textContent = "Shaders imported.";
                    DOMUtils.get("#export-result").append(p);

                    this.updateImmediate(`Shaders imported...`);

                } catch (e) {
                    this.updateImmediate(`Shaders could not be imported...`);
                    console.error('Error parsing JSON:', e);
                }
            };
            reader.readAsText(file);
        });

    }


    setCurrentShader(shader: StoredShader): void {
        this.currentShader = shader;
        DOMUtils.get<HTMLInputElement>("#shader-name").value = shader.name;
        DOMUtils.get<HTMLInputElement>("#shader-description").value = shader.description;
        // Create a transaction to replace the document
        const transaction = this.editorView.state.update({
            changes: { from: 0, to: this.editorView.state.doc.length, insert: shader.documents[0].source }
        });
        // Dispatch the transaction to the editor view
        this.editorView.dispatch(transaction);
        this.renderSourceList(shader.documents);
        this.editorView.focus();
        this.sourceIndex = 0;

        this.updateImmediate(`Shader "${shader.name}" loaded...`);
        DOMUtils.get("#current-shadername").textContent = shader.name

    }

    saveCurrentShader() {
        this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();
        this.currentShader.name = DOMUtils.get<HTMLInputElement>("#shader-name").value;
        this.currentShader.description = DOMUtils.get<HTMLInputElement>("#shader-description").value;
        this.storage.update(this.currentShader);
        this.currentShader.thumbnail = this.renderer.canvas.toDataURL();
        this.storage.save();
        this.updateImmediate(`Shader ${this.currentShader.name} saved...`);
    }

    renderStoredShaders(shaders: Array<StoredShader>): void {
        const parent = DOMUtils.get("#lst-shaders");
        DOMUtils.removeChilds(parent);
        shaders.forEach(shader => {
            const image = shader.thumbnail ? shader.thumbnail : "https://placehold.co/80x45?text=?";
            const template = `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                   <img src="${image}" style="max-width:80px" class="img-thumbnail mr-3" >
                    <div class="ms-2 me-auto">
                        <h6 class="fw-bold">${shader.name}</h6>
                        <div class="shader-description">
                        ${DOMUtils.truncString(shader.description, 50)}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-secondary" data-id=${shader.id}">
                    <i class="bi bi-pencil-square"></i>
                    </button>
                </li>`;
            const item = DOMUtils.toDOM(template);
            const button = DOMUtils.get("button", item);
            button.dataset.id = shader.id;
            DOMUtils.on("click", button, () => {
                this.setCurrentShader(shader);
            });
            parent.append(item);
        });
    }


    renderSourceList(documents: IDocumentData[]) {

        const parent = DOMUtils.get<HTMLInputElement>("#select-source");
        DOMUtils.removeChilds(parent);

        documents.forEach((doc, index) => {
            const option = DOMUtils.create<HTMLOptionElement>("option");

            let prefix = "";            
            if(doc.type !==TypeOfShader.MainFrag)         
                prefix =  `RENDERPASS${index-1}`;

            option.text =  `${prefix} (${ getShadeTypeName(doc.type) }) `;

            option.value = index.toString();
            parent.append(option);
        });

        parent.value = "0";

    }

    async initStorage(): Promise<StoredShader> {
        return new Promise((resolve, reject) => {
            try {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.init();
                const lastModified = this.storage.all().sort((a: StoredShader, b: StoredShader) => {
                    return b.lastModified - a.lastModified
                })[0];
                this.renderSourceList(lastModified.documents);
                resolve(lastModified);
            } catch (err) {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.setup();
                axios.get<IOfflineGraph<StoredShader>>(`shaders/default.json?rnd=${randomStr()}`).then(
                    model => {
                        model.data.collection.forEach(shader => {
                            this.storage.insert(shader);
                        });
                        this.storage.save();
                        reject("No storage found")
                    });
            }
        });
    }

    getShaderByUUD():StoredShader | undefined{
        const urlParams = new URLSearchParams(location.search);
        if(urlParams.has("shader")){          
            const shader =  this.storage.findById(urlParams.get("shader")!);
            return shader;
        }
        return undefined;
    }

    constructor() {
      
        this.setupUI();
        this.initStorage().then(shader => {

            this.storage.onChange = () => {
                this.renderStoredShaders(this.storage.all())
            }
            this.currentShader = shader;
            this.renderStoredShaders(this.storage.all())
            this.setupEditor(shader).then(r => {              
                    this.setCurrentShader( this.getShaderByUUD() || shader);
            });
        }).catch(err => {
            this.renderStoredShaders(this.storage.all());
            const shader = this.storage.all()[0];
            this.setupEditor(shader).then(r => {
                this.setCurrentShader( this.getShaderByUUD() || shader);
            });
        });


        DOMUtils.on<HTMLInputElement>("change", "#select-source", (ev, el) => {
            this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();
            const document = this.currentShader.documents[parseInt(el!.value)];
            const transaction = this.editorView.state.update({
                changes: { from: 0, to: this.editorView.state.doc.length, insert: document.source }
            });
            this.editorView.dispatch(transaction);
            this.sourceIndex = parseInt(el!.value);
        });

    }
}





document.addEventListener("DOMContentLoaded", () => {

    const getURLParameter = (name: string): string | null => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };
    
    const widthStr = getURLParameter("w");
    const heightStr = getURLParameter("h");
    
    // Type Assertions for Safety
    const width = widthStr ? parseInt(widthStr, 10) : null; 
    const height = heightStr ? parseInt(heightStr, 10) : null;
    
    if (width && height) { 
        const canvas = document.querySelector("#result-canvas") as HTMLCanvasElement;
        canvas.width = width;
        canvas.height = height;       
    }

   
       

    const editor = new Editor();
});
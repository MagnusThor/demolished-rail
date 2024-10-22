import { Scene } from "./Scene";
import { SequencerBase } from "./SequencerBase";

export class Sequence extends SequencerBase {
    public bpm: number = 0;
    public ticksPerBeat: number = 0;
    private lastBeatTime: number = 0;
    private currentTick: number = 0;
    private currentBar: number = 0;

    public beatsPerBar: number = 0;
    private currentBeat: number = 0;

    private beatListeners: ((scene: number, time: number) => void)[] = [];
    private tickListeners: ((scene: number, time: number) => void)[] = [];
    private barListeners: ((bar: number) => void)[] = []

    private audioContext!: AudioContext;
    private audioBuffer!: AudioBuffer;
    private audioSource!: AudioBufferSourceNode;

    private analyser!: AnalyserNode;
    private fftData!: Uint8Array;
    targetCtx!: CanvasRenderingContext2D | null;




    onReady() {
        throw "not implemeted";
    }

    constructor(
        public target:HTMLCanvasElement,
        bpm: number = 120, ticksPerBeat: number = 4, beatsPerBar: number = 4, scenes: Scene[], audioFile?: string) {

      
        super(scenes);
    
        this.targetCtx = target.getContext("2d"); 


      
        
        this.bpm = bpm;
        this.ticksPerBeat = ticksPerBeat;
        this.beatsPerBar = beatsPerBar;

        if (audioFile) {
            this.loadAudio(audioFile);
        } else {
            this.onReady();
        }
        this.durationMs = 0;
        if (this.scenes.length > 0) {
            this.durationMs = Math.max(...this.scenes.map((scene) => {
                return scene.startTimeinMs + scene.durationInMs;
            }));
        }
    }

    private loadAudio(audioFile: string) {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser(); // Create analyser node

        fetch(audioFile)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.audioBuffer = audioBuffer;

                this.onReady();

            })
            .catch(error => console.error("Error loading audio:", error));
    }

    // Add event listener for bars
    onBar(listener: (bar: number) => void) {
        this.barListeners.push(listener);
    }

    onBeat(listener: (scene: number, ts: number) => void) {
        this.beatListeners.push(listener);
    }

    onTick(listener: (scene: number, ts: number) => void) {
        this.tickListeners.push(listener);
    }

    addScene(scene: Scene): void {
        this.scenes.push(scene);
        this.recalculateDuration();
    }

    removeScene(scene: Scene): void {
        this.scenes = this.scenes.filter((s) => s !== scene);
        this.recalculateDuration();
    }

    private recalculateDuration() {
        this.durationMs = 0;
        if (this.scenes.length > 0) {
            this.durationMs = Math.max(...this.scenes.map((scene) => {
                return scene.startTimeinMs + scene.durationInMs;
            }));
        }
    }

    play(): void {
        this.isPlaying = true;
        this.currentSceneIndex = 0;
        this.lastBeatTime = 0;
        this.currentTick = 0;

        // Start audio playback
        if (this.audioBuffer) {
            // Create a NEW AudioBufferSourceNode each time
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.analyser);

            this.analyser.connect(this.audioContext.destination);
            this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
            this.audioSource.start();

        }

        const animate = (ts: number) => {
            // Call playCurrentScene even if there is no current scene
            this.playCurrentScene(ts);

            if (this.isPlaying) {
                this.requestAnimationFrameID = requestAnimationFrame(animate);
            }
        }
        this.requestAnimationFrameID = requestAnimationFrame(animate);
    }

    pause(): void {
        this.isPlaying = false;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }

    stop(): void {
        this.isPlaying = false;
        this.currentSceneIndex = 0;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }

    get currentScene(): Scene | undefined {
        return this.scenes[this.currentSceneIndex];
    }

    private playCurrentScene(timeStamp: number): void {
        if (!this.isPlaying) {
            return;
        }
        // Determine the current scene based on timeStamp
        let currentSceneIndex = this.scenes.findIndex(scene =>
            timeStamp >= scene.startTimeinMs &&
            timeStamp < scene.startTimeinMs + scene.durationInMs
        );
        // If no scene is found for the current time, check if there's an upcoming scene
        if (currentSceneIndex === -1) {
            currentSceneIndex = this.scenes.findIndex(scene => timeStamp < scene.startTimeinMs);
            if (currentSceneIndex === -1) { // No upcoming scene, animation finished
                this.isPlaying = false;
                return;
            } else { // Wait for the upcoming scene
                return;
            }
        }
        // If the scene has changed, update currentSceneIndex and play the new scene
        if (this.currentSceneIndex !== currentSceneIndex) {
            this.currentSceneIndex = currentSceneIndex;



            let elapsedTime = timeStamp - this.currentScene!.startTimeinMs;
            this.currentScene!.play(elapsedTime).then(() => {
                // You might want to add an event here for when a scene ends
            });
        }
        // FFT analysis
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.fftData);

            const avgFrequency = this.fftData.reduce((sum, val) => sum + val, 0) / this.fftData.length;
            // console.log("Average frequency:", avgFrequency);
        }

        // Call update() on all entities in the new scene
        this.currentScene!.entities.forEach(entity => {
            entity.update(timeStamp);            
            if (this.target) {
                this.targetCtx?.clearRect(0,0,this.target.width,this.target.height);
                entity.copyToCanvas(this.target);
              }
        });

        // BPM and event handling
        const beatIntervalMs = 60000 / this.bpm;
        const tickIntervalMs = beatIntervalMs / this.ticksPerBeat;

        if (timeStamp - this.lastBeatTime >= beatIntervalMs) {
            this.lastBeatTime = timeStamp;
            this.beatListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));
            this.currentTick = 0;

            // Bar event handling
            this.currentBeat++;
            if (this.currentBeat > this.beatsPerBar) {
                this.currentBar++;
                this.currentBeat = 1; // Reset to 1 after a bar is complete
                this.barListeners.forEach(listener => listener(this.currentBar));
            }
        }
        if (timeStamp - this.lastBeatTime >= this.currentTick * tickIntervalMs) {
            this.tickListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));
            this.currentTick++;
        }
    }
}
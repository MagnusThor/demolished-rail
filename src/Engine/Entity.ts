import { Sequence } from "./Sequence";

export interface IEntity {
    update(timeStamp: number): void
    key:string
    copyToCanvas(targetCanvas: HTMLCanvasElement):void
}

export class Entity<T> implements IEntity {
    canvas: HTMLCanvasElement;
    ctx!: CanvasRenderingContext2D | null;
    constructor(public key: string,w:number,h:number, public props?: T,
        public action?: (time: number, ctx: CanvasRenderingContext2D, properties: T,sequence?:Sequence) => void) {
       
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext("2d");
    }

    copyToCanvas(targetCanvas: HTMLCanvasElement) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {  
          targetCtx.drawImage(this.canvas, 0, 0); 
        }
      }

    update(timeStamp: number): void {
        this.ctx?.clearRect(0,0,this.canvas.width,this.canvas.height);
        if (this.action && this.ctx && this.props)
            this.action(timeStamp, this.ctx, this.props);
    }
}



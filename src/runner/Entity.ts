export interface IEntity {
    draw(timeStamp: number): void
}

export class Entity implements IEntity {
    constructor(public key: string, props?: Map<string, number>) {

    }

    draw(timeStamp: number): void {
        // This will do draw operation on a Canvas2D or a WebGL2 Canvas
    }
}



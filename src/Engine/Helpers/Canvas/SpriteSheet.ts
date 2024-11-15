// SpriteSheet.ts
export class SpriteSheet {

  frameWidth: number;
  frameHeight: number;

  /**
   * Creates a new SpriteSheet instance.
   * @param imageUrl - The URL of the sprite sheet image.
   * @param frameWidth - The width of each frame in the sprite sheet.
   * @param frameHeight - The height of each frame in the sprite sheet.
   */
  constructor(public image: HTMLImageElement | HTMLCanvasElement, frameWidth: number, frameHeight: number) {
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
  }

  /**
   * Extracts a specific frame from the sprite sheet as a new canvas.
   * @param frameIndex - The index of the frame to extract.
   * @returns A new canvas element containing the extracted frame.
   */
  getFrame(frameIndex: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.frameWidth;
    canvas.height = this.frameHeight;
    const ctx = canvas.getContext('2d')!;

    const x = (frameIndex % (this.image.width / this.frameWidth)) * this.frameWidth;
    const y = Math.floor(frameIndex / (this.image.width / this.frameWidth)) * this.frameHeight;

    ctx.drawImage(this.image, x, y, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);
    return canvas;
  }
}


export interface ISpriteBlockProps {
  spriteSheet: SpriteSheet;     
  sprite?: ISprite
  x:number,
  y:number
}



export enum SpriteAnimationDirection {
  VERTICAL = 0,
  HORIZONTAL = 1
}

export interface ISpriteAnimation {
  frames: number[];
  speed: number; // Frames per second
  direction: SpriteAnimationDirection;
  loop: boolean;
  currentFrame: number; // Add currentFrame property to track the current frame
}

export interface ISprite {
  image: HTMLImageElement | HTMLCanvasElement;
  position?: { x: number; y: number };
  size: { width: number; height: number };
  animation?: ISpriteAnimation;
  update(dt: number, ctx: CanvasRenderingContext2D): void;
  draw(ctx: CanvasRenderingContext2D,x:number,y:number):void;

}

/**
 * A helper class for drawing and animating sprites.
 */
export class Sprite implements ISprite {
  image: HTMLImageElement | HTMLCanvasElement;
  position?: { x: number; y: number };
  size: { width: number; height: number };
  animation?: ISpriteAnimation;
  private elapsedTime: number = 0;

  /**
   * Creates a new Sprite instance.
   * @param image - The image to use for the sprite.
   * @param position - The position of the sprite on the canvas.
   * @param size - The size of the sprite.
   * @param animation - Optional animation properties for the sprite.
   */
  constructor(image: HTMLImageElement | HTMLCanvasElement, position?: { x: number; y: number }, size?: { width: number; height: number },
    animation?: ISpriteAnimation) {
    this.image = image;
    this.position = position;
    this.size = size!;
    this.animation = animation;
  }

  /**
   * Updates the animation frame of the sprite.
   * @param dt - The time delta since the last update.
   */
  update(dt: number, ctx: CanvasRenderingContext2D) {
    if (this.animation) {

      this.elapsedTime += dt;
      const frameTime = 1 / this.animation.speed;
      if (this.elapsedTime >= frameTime) {
        this.animation.currentFrame++;

        if (this.animation.loop) {
          this.animation.currentFrame %= this.animation.frames.length;
        } else if (this.animation.currentFrame >= this.animation.frames.length) {
          this.animation.currentFrame = this.animation.frames.length - 1;
        }
        this.elapsedTime -= frameTime;
      }
    }
    
  }


 // In your Sprite class
draw(ctx: CanvasRenderingContext2D,x:number,y:number) {
  if (!this.position || !this.animation) return;

  const frame = this.animation.frames[this.animation.currentFrame];

  // Calculate x based on direction and frame, but use the entity's x position
  const sX = this.animation.direction === SpriteAnimationDirection.HORIZONTAL
    ? this.position.x // Use this.position.x for horizontal direction
    : this.position.x + frame * this.size.width; 

  // Calculate y based on direction and frame, but use the entity's y position
  const sY = this.animation.direction === SpriteAnimationDirection.HORIZONTAL
    ? this.position.y + frame * this.size.height
    : this.position.y; // Use this.position.y for vertical direction

  ctx.drawImage(
    this.image,
    sX, sY, this.size.width, this.size.height,
    x, y, this.size.width, this.size.height
  );
}

}
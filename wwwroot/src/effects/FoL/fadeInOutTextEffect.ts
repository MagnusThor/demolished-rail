import { Sequence } from "../../../../src/Engine/sequence";

export interface ITextFadeInOut {
 
    y: number; // Center y-coordinate
    texts: string[];
    font: string;
    size: number;
    fadeInDuration: number; // Duration of the fade-in in seconds
    fadeOutDuration: number; // Duration of the fade-out in seconds
    textDuration: number
  }
  
  export const textFadeInOut = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: ITextFadeInOut,
    sequence: Sequence
  ) => {
    const { y, texts, font, size, fadeInDuration, fadeOutDuration,textDuration } = propertybag;
  
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
  
    const sceneStartTime = sequence.currentScene!.startTimeinMs / 1000;
    const elapsed = ts / 1000 - sceneStartTime; // Time elapsed since the start of the scene
  
    // Calculate the index of the current text element
    const textIndex = Math.floor(elapsed / textDuration) % texts.length; 
    const text = texts[textIndex];
  
    // Calculate the elapsed time for the current text element
    const textElapsed = elapsed % textDuration; 
  
    let alpha = 1;
    if (textElapsed < fadeInDuration) {
      alpha = textElapsed / fadeInDuration; // Fade in
    } else if (textElapsed > textDuration - fadeOutDuration) {
      alpha = (textDuration - textElapsed) / fadeOutDuration; // Fade out
    }
  
    ctx.globalAlpha = alpha;
    ctx.fillText(text, ctx.canvas.width / 2, y); // Draw centered text
    ctx.globalAlpha = 1;
  };

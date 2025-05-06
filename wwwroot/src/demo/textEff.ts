import { TextAlignment } from '../example/canvas2d/fadeInOutTextEffect';

export interface IFadeInTimedTextElement {
    id: number;
    data: string;
    font?: string;
    size?: number;
    fadeInStart: number; // Time in seconds when the fade-in should start
    duration: number;    // Total duration in seconds the element is visible (including fade in/out)
    x?: number;          // Optional x-coordinate for the element
    y?: number;          // Optional y-coordinate for the element
}


export interface IFadeInTimedElementEffectProps {
    elements: IFadeInTimedTextElement[];
    alignment?: TextAlignment; // Default alignment if x is not provided for an element
    margin?: number;        // Margin to use with default alignment
    fadeInDuration: number;
    fadeOutDuration: number;
    defaultY?: number;       // Default y-coordinate if not provided for an element
}

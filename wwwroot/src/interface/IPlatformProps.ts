/**
 * The tile entity.
 */
/**
 * Interface for the properties of a moving platform entity.
 */


export interface IPlatformProps {
    x: number;
    y: number;
    width: number;
    height: number;
    velY: number;
    minY: number;
    maxY: number;
    oldY: number;
    color: string;
}

import { IGameEntity } from "../interface/IGameEntity";
import { IBoundingBox } from "../interface/IBoundingBox";

/**
 * Checks if an entity's bounding box is within the viewport, plus an optional buffer.
 * @param entity The entity to check, must have a getBoundingBox method.
 * @param viewport The current viewport state.
 * @param screenWidth The width of the screen.
 * @param screenHeight The height of the screen.
 * @param buffer A buffer zone in pixels around the viewport.
 * @returns boolean
 */
export const isEntityInView = (
    entity: IGameEntity<any>,
    viewport: { x: number; y: number },
    screenWidth: number,
    screenHeight: number,
    buffer: number = 200
): boolean => {
    // Get the bounding box from the entity's dedicated method
    if(!entity.getBoundingBox) {
        console.warn(`Entity ${entity.name} does not have a getBoundingBox method.`);
        return false;
    }       
    const box: IBoundingBox = entity.getBoundingBox!(entity);

    // Perform the standard AABB intersection test
    return box.x < viewport.x + screenWidth + buffer &&
           box.x + box.width > viewport.x - buffer &&
           box.y < viewport.y + screenHeight + buffer &&
           box.y + box.height > viewport.y - buffer;
};
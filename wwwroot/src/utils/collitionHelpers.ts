import { IGameEntity } from "../interface/IGameEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IGameState } from "../interface/IGameState";
import { ICollisionDetector } from "../interface/ICollisionDetector";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";

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
        const entityBox: IBoundingBox = entity.getBoundingBox!(entity);
        
        // Create a bounding box for the viewport with the buffer
        const viewportBox: IBoundingBox = {
            x: viewport.x - buffer,
            y: viewport.y - buffer,
            width: screenWidth + 2 * buffer,
            height: screenHeight + 2 * buffer
        };
        
        // Use the AABBColliding helper to perform the check
        return CollisionHelper.AABBColliding(entityBox, viewportBox);
};

export const runCollitionDetectors = <T>(gameState:IGameState,props:T,detectors: ICollisionDetector[]) => {
        detectors.forEach(detector => {
            const targetEntities =  getFilteredAndSortedEntities(gameState,props, detector.targetName)
            
            if (targetEntities && targetEntities.length > 0) {
                targetEntities.forEach(targetEntity => {
                    const collisionResults = detector.detectorFn(props, targetEntity);
                    if (Array.isArray(collisionResults)) {
                        collisionResults.forEach(collisionData => {
                            detector.onCollision(props, collisionData, targetEntity);
                        });
                    }
                });
            }
        });
    }


const getFilteredAndSortedEntities = (gameState:IGameState, props: any, targetName: string) => {
    let targetEntities = gameState.findEntities(targetName);

    if (targetEntities && targetEntities.length > 0) {
        // Filter entities that are not within the viewport
        targetEntities = targetEntities.filter(entity => 
            isEntityInView(entity, gameState.viewport, gameState.viewport.viewportWidth, gameState.viewport.viewportHeight));

        // Sort entities by distance to the player
        targetEntities.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.props.positioned.x - props.positioned.x, 2) + Math.pow(a.props.positioned.y - props.positioned.y, 2));
            const distB = Math.sqrt(Math.pow(b.props.positioned.x - props.positioned.x, 2) + Math.pow(b.props.positioned.y - props.positioned.y, 2));
            return distA - distB;
        });
    }

    return targetEntities;
};


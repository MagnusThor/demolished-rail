import { IGameEntity, IGameEntityBase } from "../interface/IGameEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IGameState } from "../interface/IGameState";
import { ICollidable, ICollisionDetector } from "../interface/ICollisionDetector";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { IPositioned } from "../interface/IPositioned";
import { gameState } from "../state/gameState";

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
    buffer: number = 32
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

export const runCollitionDetectors = <T>(
        entity: IGameEntity<any>,detectors: ICollisionDetector[],_gameState?:IGameState,) => {

        if(!_gameState) _gameState = gameState; // no state provided use global

        detectors.forEach(detector => {
            const targetEntities =  getFilteredAndSortedEntities(_gameState,entity, detector.targetName)
            
            if (targetEntities && targetEntities.length > 0) {
                targetEntities.forEach((targetEntity: any) => {
                    const collisionResults = detector.detectorFn(entity, targetEntity);
                    if (Array.isArray(collisionResults)) {
                        collisionResults.forEach(collisionData => {
                            detector.onCollision(entity, collisionData, targetEntity);
                        });
                    }
                });
            }
        });
    }


export const getFilteredAndSortedEntities = (gameState: IGameState, 
    sourceEntity:IGameEntity<IGameEntityBase> , targetName: string) => {
    // --- Defensive Check for Source Entity ---
    // If the source entity or its 'positioned' property is missing, we can't do anything.
    if (!sourceEntity || !sourceEntity.props.positioned) {
        console.log(sourceEntity);
        console.error("Source entity or its 'positioned' property is missing.");
        return [];
    }

    let targetEntities = gameState.findEntities(targetName);

    if (targetEntities && targetEntities.length > 0) {
        // --- Filter for Viewport AND Valid Position ---
        // We'll add a check to make sure the 'positioned' property exists before filtering.
        targetEntities = targetEntities.filter(entity => 
            entity.props && entity.props.positioned && isEntityInView(entity, gameState.viewport, gameState.viewport.viewportWidth, gameState.viewport.viewportHeight)
        );

        // --- Sort Entities with a Safer Check ---
        try {
            targetEntities.sort((a: { props: { positioned: { x: number; y: number; }; }; }, b: { props: { positioned: { x: number; y: number; }; }; }) => {
                // If either 'a' or 'b' is missing the necessary properties,
                // we'll return 0 to keep the sort from crashing.
                if (!a.props || !a.props.positioned || !b.props || !b.props.positioned) {
                    return 0;
                }
                // Now that we've checked, it's safe to calculate the distances.
                const distA = Math.sqrt(Math.pow(a.props.positioned.x - sourceEntity.props.positioned.x, 2) + Math.pow(a.props.positioned.y - sourceEntity.props.positioned.y, 2));
                const distB = Math.sqrt(Math.pow(b.props.positioned.x - sourceEntity.props.positioned.x, 2) + Math.pow(b.props.positioned.y - sourceEntity.props.positioned.y, 2));
                return distA - distB;
            });
        }
        catch (error) {
            console.error("An error occurred during entity sorting:", error);
            // We can return the unfiltered list to prevent a complete crash
            // while the root problem is being debugged.
            return targetEntities; 
        }
    }
    return targetEntities;
};

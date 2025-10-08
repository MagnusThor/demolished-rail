
// Minimum downward velocity required to trigger a screen shake upon hard landing.

import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { GameEntity } from "../GameEntity";
import { LevelEntityRenderer } from "../level/LevelEntityRenderer";

import { WorldManager } from "../WorldManager";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { isHardImpact } from "../../utils/impactHelpers";
import { getSurroundingTiles, getTileProperties } from "../../utils/tileEntityHelpers";
import { ExtendedCollisionHelper } from "../../utils/extendedCollitionHelper";
import { GameState } from "../../global/GameState";
import { BoundingBox } from "../../interface/IBoundingBox";

export interface IInteractableProps extends IGameEntityBase {
    velX: number; // Horizontal velocity
    velY: number; // Vertical velocity
    gravity: number; // Gravity affecting the entity
    rotation: number; // Current rotation in radians
    rotationSpeed: number; // How fast the entity rotates when falling
}

/**
 * A visible entity that the player can interact with when in close proximity.
 * This class handles the logic for detecting the player and listening for an interaction event.
 */
export class InteractableEntity extends GameEntity<IInteractableProps> {

    constructor(props: IInteractableProps) {
        super("interactable", props);

        this.collisionDetectors = [{
            targetName: "tileBlock",
            detectorFn: (interactableEntity: InteractableEntity, tileEntity: LevelEntityRenderer) => {
                
                const results = new Array<ICollisionResult>();

                const nearbyTiles = getSurroundingTiles(tileEntity.tileSpatialGrid,
                    interactableEntity.props.position.getBoundingBox(), tileEntity.props.tileWidth);

                const bbox = interactableEntity.props.position.getBoundingBox();
             
                nearbyTiles.forEach(tile => {
                    const tileBBox = {
                        x: tile.x,
                        y: tile.y,
                        width: tileEntity.props.tileWidth,
                        height: tileEntity.props.tileHeight
                    };

                    const tileProps = getTileProperties(tile.type);

                    // Only check for collisions with solid tiles
                    if (tileProps?.isSolid) {
                        const result = ExtendedCollisionHelper.isRectRectColliding(
                            bbox.x, bbox.y, bbox.width, bbox.height, tileBBox.x, tileBBox.y, tileBBox.width, tileBBox.height
                        );

                        if (result) {
                            // Use the generic snapTo property
                            result.snapTo = tileBBox;
                            results.push(result);
                        }
                    }
                });
                return results;
            },
            onCollision: (interactableEntity: InteractableEntity, result: ICollisionResult, tileEntity: LevelEntityRenderer) => {
                const interactableProps = interactableEntity.props;
                const snapTo = result.snapTo;
                
                // Track the velocity before snapping/resetting. This is crucial for detecting impact.
                const previousVelY = interactableProps.velY; 

                if (!snapTo) {
                    return;
                }

                if (result.axis === CollisionAxis.Y) {
                    // Check if the entity is falling or jumping
                    if (previousVelY > 0) { // Falling and hitting floor
                        // Snap to the top of the object
                        interactableProps.position.y = snapTo.y - interactableProps.position.height;
                        // Reset rotation when it lands
                        interactableProps.rotation = 0;

                        // Add Screen Shake on hard impact (landing)
                        // This check prevents constant shaking when the entity is resting (velY near 0).
                        if (isHardImpact(previousVelY)) {
                            WorldManager.getCamera()?.runEffect('shake', 8.0);
                        }
                        
                    } else if (previousVelY < 0) { // Jumping and hitting ceiling
                        // Snap to the bottom of the object
                        interactableProps.position.y = snapTo.y + snapTo.height;
                    }
                    interactableProps.velY = 0;
                } else if (result.axis === CollisionAxis.X) {
                    // Check if the entity is moving right or left

                   // console.log(`Collided with`,result.targetEntity)
                 
                    if (interactableProps.velX > 0) {
                        // Snap to the left side of the object
                        interactableProps.position.x = snapTo.x - interactableProps.position.width;

                    } else if (interactableProps.velX < 0) {
                        // Snap to the right side of the object
                        interactableProps.position.x = snapTo.x + snapTo.width;
                    }

                    
                    interactableProps.velX = 0;
                }
            }
        }];
    }

    getBoundingBox? = (self: IGameEntity<IInteractableProps>) => {

        
        const bbox = new BoundingBox(self.props.position.getBoundingBox!())


     

        return bbox;//;.worldToViewport();

    }

    onUpdate? = (self: IGameEntity<IInteractableProps>, timeStamp: number) => {
        const props = self.props;

        // Apply gravity
        props.velY += props.gravity;

        // Add rotation when falling (when velY is positive)
        if (props.velY > 0) {
            props.rotation += props.rotationSpeed * (props.velY / 10);
        }

        // Update the position
        props.position.x += props.velX;
        props.position.y += props.velY;

        // Run collision detectors to correct position if there's any overlap from the move
        this.runCollitionDetectors();
    };

    onDraw? = (self: IGameEntity<IInteractableProps>, helper: CanvasHelper) => {
        const props = self.props;


        
        const bbox = self.getBoundingBox!(self);

        ExtendedCollisionHelper.visualizeBBox(
            helper.ctx,
            bbox,"interactable",3)


        // Use the new drawRotatedRect helper method
        helper.drawRotatedRect(
            props.position.x,
            props.position.y,
            props.position.width,
            props.position.height,
            props.rotation,
            {
                strokeStyle: 'blue',
                lineWidth: 2
            }
        );
    };
}

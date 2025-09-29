import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { GameState } from "../../global/GameState";
import { isHardImpact } from "../../utils/impactHelpers";
import { getSurroundingTiles, getTileProperties } from "../../utils/tileEntityHelpers";
import { GameEntity } from "../GameEntity";
import { LevelEntity } from "../level/levelEntity";
import { ExtendedCollisionHelper } from "../player/collisiondetectors/extendedCollitionHelper";
import { PlayerEntity } from "../player/playerEntity";
import { WorldManager } from "../WorldManager";

// Minimum downward velocity required to trigger a screen shake upon hard landing.

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
            detectorFn: (interactableEntity: InteractableEntity, tileEntity: LevelEntity) => {
                const results = new Array<ICollisionResult>();
                const nearbyTiles = getSurroundingTiles(tileEntity.tileSpatialGrid,
                    interactableEntity.props.positioned.getBoundingBox(), tileEntity.props.tileWidth);

                const bbox = interactableEntity.props.positioned.getBoundingBox();

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
            onCollision: (interactableEntity: InteractableEntity, result: ICollisionResult, tileEntity: LevelEntity) => {
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
                        interactableProps.positioned.y = snapTo.y - interactableProps.positioned.height;
                        // Reset rotation when it lands
                        interactableProps.rotation = 0;

                        // Add Screen Shake on hard impact (landing)
                        // This check prevents constant shaking when the entity is resting (velY near 0).
                        if (isHardImpact(previousVelY)) {
                            WorldManager.getCamera()?.runEffect('shake', 8.0);
                        }
                        
                    } else if (previousVelY < 0) { // Jumping and hitting ceiling
                        // Snap to the bottom of the object
                        interactableProps.positioned.y = snapTo.y + snapTo.height;
                    }
                    interactableProps.velY = 0;
                } else if (result.axis === CollisionAxis.X) {
                    // Check if the entity is moving right or left

              

                    if (interactableProps.velX > 0) {
                        // Snap to the left side of the object
                        interactableProps.positioned.x = snapTo.x - interactableProps.positioned.width;
                    } else if (interactableProps.velX < 0) {
                        // Snap to the right side of the object
                        interactableProps.positioned.x = snapTo.x + snapTo.width;
                    }

                    
                    interactableProps.velX = 0;
                }
            }
        }];
    }

    getBoundingBox? = (self: IGameEntity<IInteractableProps>) => {
        return self.props.positioned.getBoundingBox!();
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
        props.positioned.x += props.velX;
        props.positioned.y += props.velY;

        // Run collision detectors to correct position if there's any overlap from the move
        this.runCollitionDetectors();
    };

    onDraw? = (self: IGameEntity<IInteractableProps>, helper: CanvasHelper) => {
        const props = self.props;

        // Use the new drawRotatedRect helper method
        helper.drawRotatedRect(
            props.positioned.x,
            props.positioned.y,
            props.positioned.width,
            props.positioned.height,
            props.rotation,
            {
                strokeStyle: 'blue',
                lineWidth: 2
            }
        );
    };
}

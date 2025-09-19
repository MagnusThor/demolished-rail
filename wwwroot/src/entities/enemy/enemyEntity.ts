import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { gameState } from "../../state/gameState";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { ICollisionResult } from "../../interface/ICollisionResult";

import { IEnemyProps } from "../../interface/IEnemyProps";
import { IGameEntity, IGameEntityBehavior } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { Positioned } from "../../interface/IPositioned";
import { EnemyChasingBehavior } from "./behavior/EnemyChasingBehavior";
import { EnemyPatrollingBehavior } from "./behavior/EnemyPatrollingBehavior";
import { enemyCollisionDetectors } from "./enemyCollisionDetectors";
import { StateHelper } from "../StateHelper";
import { EntityEvent } from "../EntityEvent";
import { ISpriteAnimation } from "../../interface/ISpriteAnimation";
import { IGameAsset } from "../../interface/IGameAsset";


export class EnemyEntity implements IGameEntity<IEnemyProps> {

    stateHelper: StateHelper<IEnemyProps>;

    constructor(startX: number,
        startY: number,
        indexedTiles: IIndexedTile[],
        animations: { [key: string]: ISpriteAnimation; }
    ) {

        let assignedBehavior: IGameEntityBehavior;

        if (Math.random() < 0.5) {
            assignedBehavior = EnemyPatrollingBehavior();
        } else {
            assignedBehavior = EnemyChasingBehavior(startX, startY);
        }

        this.uuid = crypto.randomUUID();
        this.name = `enemy-${crypto.randomUUID()}`;

        this.props = {
            // The position is now set directly with world coordinates
            positioned: new Positioned(startX - 128, startY - 128, 128, 128),
            health: {
                health: 100,
                damage: 10
            },
            velX: 0,
            velY: 0,
            gravity: 0.35,
            isGrounded: false,
            behaviors: { main: assignedBehavior },
            direction: 1,
            flippedX: false,
            isInitialized: true,
            zIndex: 1,
            states: {},
            animations: animations,
            currentAnimationKey: 'idle', // Set a default animation to start with
            isCollidable: true
        };

        this.stateHelper = new StateHelper(this.props);
        this.collisionDetectors = enemyCollisionDetectors;

       
    }
   
    entityEvents?: EntityEvent | undefined;

    uuid: string;
    name: string;
    props: IEnemyProps;
    collisionDetectors?: ICollisionDetector[] | undefined;

    processCollisions? = (self: IGameEntity<IEnemyProps>, entities: IGameEntity<any>[]) => {
        for (const detector of self.collisionDetectors!) {
            for (const entity of entities) {
                if (entity.name === detector.targetName) {
                    const collisionResultsRaw = detector.detectorFn(self, entity);
                    let collisionResults: ICollisionResult[] = [];
                    if (Array.isArray(collisionResultsRaw)) {
                        collisionResults = collisionResultsRaw;
                    } else if (collisionResultsRaw && typeof collisionResultsRaw === "object") {
                        collisionResults = [collisionResultsRaw];
                    }
                    for (const result of collisionResults) {
                        detector.onCollision(self, result);
                    }
                }
            }
        }
    };

    onInit?: ((self: IGameEntity<IEnemyProps>) => void) | undefined;
    onUpdate? = (self: IGameEntity<IEnemyProps>, timeStamp: number) => {
        const props = self.props;

        // Apply gravity and movement to the enemy's position
        props.velY += props.gravity;
        props.positioned.x += props.velX;
        props.positioned.y += props.velY;
        props.isGrounded = false;

        // After moving, process collisions to resolve any overlaps
        // This will correct the position and may flip the direction
        this.processCollisions!(self, gameState.findEntities("tileBlock"));

        // The behavior now sets the enemy's velocity for the next frame,
        // based on the updated state after collision resolution
        if (props.behaviors) {
            props.behaviors.main.onUpdate!(self);
        }

        // --- ANIMATION UPDATE LOGIC ---
        // Get the current animation object based on the key
        const currentAnim = props.animations[props.currentAnimationKey!];
        if (currentAnim) {
            // Check if enough time has passed to change the frame
            if (timeStamp - currentAnim.lastFrameChangeTime > 1000 / currentAnim.frameRate) {
                // Advance to the next frame, looping back to the start if at the end
                currentAnim.currentFrameIndex = (currentAnim.currentFrameIndex + 1) % currentAnim.frames.length;
                currentAnim.lastFrameChangeTime = timeStamp;
            }
        }
        // --- END ANIMATION UPDATE LOGIC ---

    };
    onDraw? = (self: IGameEntity<IEnemyProps>, helper: CanvasHelper) => {
        if (!gameState || !gameState.viewport) {
            console.warn("gameState or viewport not initialized, skipping enemy drawing.");
            return;
        }
        const props = self.props;
        const ctx = helper.ctx;

        // --- DRAW ANIMATED SPRITE ---
        const currentAnim = props.animations[props.currentAnimationKey!];
        if (currentAnim) {

            helper.drawAnimatedSprite(
                currentAnim,
                props.positioned.x, props.positioned.y, performance.now(),
                props.flippedX
            );

        } else {
            // Fallback to drawing a red box if the spritesheet isn't available
            ctx.fillStyle = "#DC3545";
            ctx.fillRect(
                props.positioned.x,
                props.positioned.y,
                props.positioned.width,
                props.positioned.height,
            );
        }
        // --- END DRAW ANIMATED SPRITE ---

        // Draw the health bar
        const healthBarHeight = 8;
        const healthBarWidth = props.positioned.width * (props.health.health / 100);

        if (healthBarWidth > 0) {
            ctx.fillStyle = "rgba(6, 78, 23, 1)";
            ctx.fillRect(
                props.positioned.x,
                props.positioned.y - healthBarHeight - 2,
                healthBarWidth,
                healthBarHeight,
            );
        }

    }

    getBoundingBox? = (self: IGameEntity<IEnemyProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    };
}

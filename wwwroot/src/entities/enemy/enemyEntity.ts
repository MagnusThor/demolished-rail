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
import { EnemyGuardingBehavior } from "./behavior/EnemyGuardingBehavior";


export class EnemyEntity implements IGameEntity<IEnemyProps> {

    stateHelper: StateHelper<IEnemyProps>;
    private _currentBehavior: IGameEntityBehavior;

    constructor(
        startX: number,
        startY: number,
        indexedTiles: IIndexedTile[],
        animations: { [key: string]: ISpriteAnimation; }
    ) {
        this.uuid = crypto.randomUUID();
        this.name = `enemy-${crypto.randomUUID()}`;

        // Initialize with a default behavior
        this._currentBehavior = EnemyPatrollingBehavior();

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
            // A single property for the current behavior
            currentBehavior: this._currentBehavior,
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
        this.switchBehavior(this._currentBehavior);
    }

    entityEvents?: EntityEvent | undefined;
    uuid: string;
    name: string;
    props: IEnemyProps;
    collisionDetectors?: ICollisionDetector[] | undefined;

    /**
     * Helper method to switch and initialize a new behavior.
     * @param newBehavior The behavior to switch to.
     */
    private switchBehavior(newBehavior: IGameEntityBehavior): void {
        if (!newBehavior._isInitialized) {
            if (newBehavior.onInit) {
                newBehavior.onInit(this);
            }
            newBehavior._isInitialized = true;
        }
        this._currentBehavior = newBehavior;
    }

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

        // --- BEHAVIOR MANAGER LOGIC ---
        const player = gameState.player;
        if (player) {
            const playerPos = player.props.positioned.toPoint2D();
            const enemyPos = props.positioned.toPoint2D();
            const distance = playerPos.distanceTo(enemyPos);

            // Set a placeholder for the next behavior to apply
            let nextBehavior: IGameEntityBehavior = this._currentBehavior;

            if (distance < 200) {
                // Player is within range, switch to chasing behavior
                // Only create a new behavior instance if it's different from the current one
                if (this._currentBehavior.name !== "chasing") {
                    nextBehavior = EnemyChasingBehavior(props.positioned.x, props.positioned.y);
                }
            } else {
                // Player is too far, revert to patrolling/guarding behavior
                if (this._currentBehavior.name !== "patrolling") {
                    nextBehavior = EnemyPatrollingBehavior();
                }
            }

            // If the next behavior is different, switch to it.
            if (nextBehavior !== this._currentBehavior) {
                this.switchBehavior(nextBehavior);
            }
        }
        // --- END BEHAVIOR MANAGER LOGIC ---


        // Apply gravity and movement to the enemy's position
        props.velY += props.gravity;
        props.positioned.x += props.velX;
        props.positioned.y += props.velY;
        props.isGrounded = false;

        // After moving, process collisions to resolve any overlaps
        this.processCollisions!(self, gameState.findEntities("tileBlock"));

        // The behavior now sets the enemy's velocity for the next frame
        if (this._currentBehavior) {
            this._currentBehavior.onUpdate!(self, timeStamp);
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

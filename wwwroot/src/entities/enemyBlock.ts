// entities/enemyBlock.ts
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { gameState } from "../gameState";
import { IBulletProps } from "../interface/IBulletProps";
import { IGameEntity } from "../interface/IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";
import { ICollisionResult } from "../interface/ICollisionResult";
import { IDynamicEntity } from "../interface/IDynamicEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IPlayerProps } from "../interface/IPlayerProps";
import { Positioned } from "../interface/IPositioned";
import { IHealthProps } from "../interface/IHealthProps";
import { ITileProps } from "../interface/ITileProps";
import { isSolidTile } from "../utils/tileBlockHelpers";

const ENEMY_SPEED = 2;

/**
 * Interface for enemy behavior, to be implemented for different enemy types.
 * Each behavior can have its own update and draw logic.
 */
export interface IEnemyBehavior {
    name: string;
    onUpdate?: (enemy: IDynamicEntity<IEnemyProps>) => void;
}

/**
 * Interface for the properties of an enemy entity.
 * It extends IDynamicProps and now includes an optional behavior array.
 */
export interface IEnemyProps {
    position: Positioned;
    health: IHealthProps;
    isAlive: boolean;
    lifeTime: number;
    velX: number; // Added for movement
    velY: number; // Added for movement
    gravity: number; // Added gravity
    isGrounded: boolean; // Indicates if the enemy is on a solid surface
    tileMap: number[][]; // A reference to the tile map for collisions
    tileWidth: number; // The width of a tile
    tileHeight: number; // The height of a tile
    behavior?: IEnemyBehavior[];
    direction: number; // Added to control patrol direction
}

/**
 * Patrolling behavior: moves the enemy back and forth.
 * The logic to check for a wall and reverse direction is now fully self-contained here.
 */
const PatrollingBehavior = (): IEnemyBehavior => {
    return {
        name: "patrolling",
        onUpdate: (enemy) => {
            const props = enemy.props;
            const tileMap = props.tileMap;
            const tileWidth = props.tileWidth;
            const tileHeight = props.tileHeight;

            // Create a temporary bounding box for the next frame's position
            const nextBbox: IBoundingBox = {
                x: props.position.x + (props.direction * ENEMY_SPEED),
                y: props.position.y,
                width: props.position.width,
                height: props.position.height
            };

            // Check for collision with tiles in the simulated next position
            const startCol = Math.floor(nextBbox.x / tileWidth);
            const endCol = Math.ceil((nextBbox.x + nextBbox.width) / tileWidth);
            const startRow = Math.floor(nextBbox.y / tileHeight);
            const endRow = Math.ceil((nextBbox.y + nextBbox.height) / tileHeight);

            let willCollide = false;
            for (let y = startRow; y < endRow; y++) {
                for (let x = startCol; x < endCol; x++) {
                    if (y >= 0 && y < tileMap.length && x >= 0 && x < tileMap[0].length) {
                        const tileType = tileMap[y][x];
                        if (isSolidTile(tileType)) {
                            const tileBbox = {
                                x: x * tileWidth,
                                y: y * tileHeight,
                                width: tileWidth,
                                height: tileHeight
                            };
                            if (CollisionHelper.AABBColliding(nextBbox, tileBbox)) {
                                willCollide = true;
                                break; // Exit inner loop
                            }
                        }
                    }
                }
                if (willCollide) {
                    break; // Exit outer loop
                }
            }
            
            // If a collision is detected in the next frame, reverse the direction.
            if (willCollide) {
                props.direction *= -1;
            }
            
            // Set the horizontal velocity based on the current direction.
            props.velX = props.direction * ENEMY_SPEED;
        },
    };
};

/**
 * Creates and returns a new enemy entity.
 * @param startX The starting X position.
 * @param startY The starting Y position.
 * @param tileMap The 2D array representing the tile map for collisions.
 * @param tileWidth The width of a single tile.
 * @param tileHeight The height of a single tile.
 */
export const enemyBlock = (
    startX: number,
    startY: number,
    tileMap: number[][],
    tileWidth: number,
    tileHeight: number
): IDynamicEntity<IEnemyProps> => {

    let assignedBehavior: IEnemyBehavior[] = [];
    
    // The logic to decide enemy behavior goes here.
    assignedBehavior.push(PatrollingBehavior()); // Add patrolling behavior

    return {
        uuid: crypto.randomUUID(), // Unique identifier for the entity
        key: 'enemyBlock',
        name: 'enemyBlock',
        props: {
            position: new Positioned(startX, startY, 32, 32),
            isAlive: true,
            lifeTime: -1, // -1 means infinite lifetime for this entity
            health: {
                health: 100,
                damage: 10
            },
            velX: 0,
            velY: 0,
            gravity: 0.35, // Added gravity
            isGrounded: false,
            tileMap: tileMap,
            tileWidth: tileWidth,
            tileHeight: tileHeight,
            behavior: assignedBehavior,
            direction: 1, // Start moving right
        },
        collisionDetectors: [
            {
                targetName: "bulletBlock",
                detectorFn: (enemyProps: IEnemyProps, bullet: IGameEntity<IBulletProps>) => {
                    const collisionResults = new Array<ICollisionResult>();
                    
                    if (CollisionHelper.AABBColliding(enemyProps.position.getBoundingBox!(), bullet.getBoundingBox!(bullet))) {
                        collisionResults.push({
                            x: bullet.props.position.x,
                            y: bullet.props.position.y,
                            width: bullet.props.position.width,
                            height: bullet.props.position.height,
                            axis: CollisionAxis.X,
                            targetEntity: bullet
                        });
                    }
                    return collisionResults;
                },
                onCollision: (selfProps: IEnemyProps, collisionData: ICollisionResult) => {
                    selfProps.health.health -= collisionData.targetEntity!.props.health.damage;
                    collisionData.targetEntity!.props.isAlive = false;
                    if (selfProps.health.health <= 0) {
                        selfProps.isAlive = false;
                    }
                }
            },
            {
                targetName: "playerBlock",
                detectorFn: (enemyProps: IEnemyProps, player: IGameEntity<IPlayerProps>) => {
                    const collisionResults = new Array<ICollisionResult>();
                    
                    if (CollisionHelper.AABBColliding(enemyProps.position.getBoundingBox!(), player.getBoundingBox!(player))) {
                        collisionResults.push({
                            x: player.props.position.x,
                            y: player.props.position.y,
                            width: player.props.position.width,
                            height: player.props.position.height,
                            axis: CollisionAxis.X,
                            targetEntity: player
                        });
                    }
                    return collisionResults;
                },
                onCollision: (selfProps: IEnemyProps, collisionData: ICollisionResult) => {
                    const player = collisionData.targetEntity! as IGameEntity<IPlayerProps>;
                    player.props.health.health -= selfProps.health.damage;
                }
            },
            // Collision detector for solid tiles
            {
                targetName: "tileBlock",
                detectorFn: (enemyProps: IEnemyProps, tileEntity: IGameEntity<ITileProps>) => {
                    const collisionResults = new Array<ICollisionResult>();
                    const tileMap = tileEntity.props.tileMap;
                    const tileWidth = tileEntity.props.tileWidth;
                    const tileHeight = tileEntity.props.tileHeight;

                    // Check for collision with tiles in the enemy's vicinity
                    const enemyBbox = enemyProps.position.getBoundingBox!();
                    const startCol = Math.floor(enemyBbox.x / tileWidth);
                    const endCol = Math.ceil((enemyBbox.x + enemyBbox.width) / tileWidth);
                    const startRow = Math.floor(enemyBbox.y / tileHeight);
                    const endRow = Math.ceil((enemyBbox.y + enemyBbox.height) / tileHeight);

                    for (let y = startRow; y < endRow; y++) {
                        for (let x = startCol; x < endCol; x++) {
                            if (y >= 0 && y < tileMap.length && x >= 0 && x < tileMap[0].length) {
                                const tileType = tileMap[y][x];
                                if (isSolidTile(tileType)) {
                                    const tileBbox = {
                                        x: x * tileWidth,
                                        y: y * tileHeight,
                                        width: tileWidth,
                                        height: tileHeight
                                    };
                                    if (CollisionHelper.AABBColliding(enemyBbox, tileBbox)) {
                                        collisionResults.push({
                                            x: tileBbox.x,
                                            y: tileBbox.y,
                                            width: tileBbox.width,
                                            height: tileBbox.height,
                                            axis: CollisionAxis.Y, // We handle collision resolution based on axis
                                            targetEntity: tileEntity
                                        });
                                    }
                                }
                            }
                        }
                    }
                    return collisionResults;
                },
                onCollision: (selfProps: IEnemyProps, collisionData: ICollisionResult) => {
                    // This function is now responsible for setting the new velocity and position after collision
                    const tileBbox: IBoundingBox = {
                        x: collisionData.x,
                        y: collisionData.y,
                        width: collisionData.width,
                        height: collisionData.height
                    };
                    
                    const dx = (selfProps.position.x + selfProps.position.width / 2) - (tileBbox.x + tileBbox.width / 2);
                    const dy = (selfProps.position.y + selfProps.position.height / 2) - (tileBbox.y + tileBbox.height / 2);
                    const width = (selfProps.position.width + tileBbox.width) / 2;
                    const height = (selfProps.position.height + tileBbox.height) / 2;
                    const crossWidth = width * dy;
                    const crossHeight = height * dx;

                    if (crossWidth > crossHeight) {
                        if (crossWidth > -crossHeight) {
                            // Bottom collision
                            selfProps.position.y = tileBbox.y + tileBbox.height;
                            selfProps.velY = 0;
                        } else {
                            // Left collision: We only handle clipping here. Direction change is in onUpdate.
                            selfProps.position.x = tileBbox.x - selfProps.position.width;
                            selfProps.velX = 0;
                        }
                    } else {
                        if (crossWidth > -crossHeight) {
                            // Right collision: We only handle clipping here. Direction change is in onUpdate.
                            selfProps.position.x = tileBbox.x + tileBbox.width;
                            selfProps.velX = 0;
                        } else {
                            // Top collision (landing on a platform)
                            selfProps.position.y = tileBbox.y - selfProps.position.height;
                            selfProps.velY = 0;
                            selfProps.isGrounded = true;
                        }
                    }
                }
            }
        ],
        
        getBoundingBox: (self): IBoundingBox => {
            return self.props.position.getBoundingBox!();
        },
        onCreated: (self) => {
         
        },
        onDestroy: (self) => {
        },
        onUpdate: (self, timeStamp) => {
            const props = self.props;
            
            // Execute the current behavior's update logic
            // This is where the behavior will set the velocity for the frame
            if (props.behavior && props.behavior.length > 0) {
                props.behavior[0].onUpdate!(self);
            }
            
            // Apply gravity
            props.velY += props.gravity;

            // Apply velocity to position
            props.position.x += props.velX;
            props.position.y += props.velY;
            
            // Clear ground state
            props.isGrounded = false;
        },
        processCollisions: (self: IDynamicEntity<IEnemyProps>, entities) => {
            const selfProps = self.props;
            for (const detector of self.collisionDetectors!) {
                for (const entity of entities) {
                    if (entity.name === detector.targetName) {
                        const collisionResultsRaw = detector.detectorFn(selfProps, entity);
                        let collisionResults: ICollisionResult[] = [];
                        if (Array.isArray(collisionResultsRaw)) {
                            collisionResults = collisionResultsRaw;
                        } else if (collisionResultsRaw && typeof collisionResultsRaw === "object") {
                            collisionResults = [collisionResultsRaw];
                        }
                        for (const result of collisionResults) {
                            detector.onCollision(selfProps, result);
                        }
                    }
                }
            }
        },
        onDraw: (self, helper: CanvasHelper) => {
            if (!gameState || !gameState.viewport) {
                console.warn("gameState or viewport not initialized, skipping enemy drawing.");
                return;
            }
            const props = self.props;
            const ctx = helper.ctx;
    
            
            ctx.fillStyle = "#DC3545";
            ctx.fillRect(
                props.position.x,
                props.position.y,
                props.position.width,
                props.position.height,
            );

            // Draw health bar
            const healthBarHeight = 8;
            const healthBarWidth = props.position.width * (props.health.health / 100);
            ctx.fillStyle = "rgba(6, 78, 23, 1)";
            ctx.fillRect(
                props.position.x ,
                props.position.y - healthBarHeight - 2,
                healthBarWidth,
                healthBarHeight,
            );
        }
    };
};

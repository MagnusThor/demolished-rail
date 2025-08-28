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
import { ILevelProps } from "../interface/ILevelProps";
import { isSolidTile, getTileProperties, IIndexedTile } from "../utils/tileBlockHelpers";
import { TILE_TYPES } from "../LEVEL_SAMPLE";
import { IEnemyBehavior, IEnemyProps } from "../interface/IEnemyProps";

const ENEMY_SPEED = 2;

// The rest of the code is unchanged up to PatrollingBehavior
// ...

/**
 * Patrolling behavior: moves the enemy back and forth.
 * This behavior must now receive a reference to the indexedTiles for accurate collision checks.
 */
const PatrollingBehavior = (indexedTiles: IIndexedTile[]): IEnemyBehavior => {
    return {
        name: "patrolling",
        onUpdate: (enemy) => {
            const props = enemy.props;
            
            // Create a temporary bounding box for the next frame's position
            const nextBbox: IBoundingBox = {
                x: props.position.x + (props.direction * ENEMY_SPEED),
                y: props.position.y,
                width: props.position.width,
                height: props.position.height
            };

            // Check for collision with tiles in the simulated next position
            let willCollide = false;
            for (const tile of indexedTiles) {
                if (isSolidTile(tile.type)) {
                    const tileProperties = getTileProperties(tile.type as keyof typeof TILE_TYPES);
                    if (tileProperties) {
                        const tileBbox: IBoundingBox = {
                            x: tile.x,
                            y: tile.y,
                            width: tileProperties.width,
                            height: tileProperties.height
                        };
                        if (CollisionHelper.AABBColliding(nextBbox, tileBbox)) {
                            willCollide = true;
                            break; 
                        }
                    }
                }
            }
            
            if (willCollide) {
                props.direction *= -1;
            }
            
            props.velX = props.direction * ENEMY_SPEED;
        },
    };
};

/**
 * Creates and returns a new enemy entity.
 * It now accepts the pre-calculated world coordinates and the indexed tile list.
 */
export const enemyBlock = (
    startX: number,
    startY: number,
    indexedTiles: IIndexedTile[]
): IDynamicEntity<IEnemyProps> => {

    let assignedBehavior: IEnemyBehavior[] = [];
    assignedBehavior.push(PatrollingBehavior(indexedTiles));

    return {
        uuid: crypto.randomUUID(),
        key: 'enemyBlock',
        name: 'enemyBlock',
        props: {
            // The position is now set directly with world coordinates
            position: new Positioned(startX, startY, 32, 32),
            isAlive: true,
            lifeTime: -1,
            health: {
                health: 100,
                damage: 10
            },
            velX: 0,
            velY: 0,
            gravity: 0.35,
            isGrounded: false,
            // These properties are no longer used for collision logic but might be needed elsewhere.
            tileMap: [], 
            tileWidth: 0,
            tileHeight: 0,
            behavior: assignedBehavior,
            direction: 1,
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
            {
                targetName: "tileBlock",
                detectorFn: (enemyProps: IEnemyProps, tileEntity: IGameEntity<ILevelProps>) => {
                    const collisionResults = new Array<ICollisionResult>();
                    const enemyBbox = enemyProps.position.getBoundingBox!();

                    // This is the correct way to check for tile collisions using indexed tiles.
                    const indexedTiles = tileEntity.props.indexedTiles;
                    if (indexedTiles) {
                        for (const tile of indexedTiles) {
                            if (isSolidTile(tile.type)) {
                                const tileProperties = getTileProperties(tile.type as keyof typeof TILE_TYPES);
                                if (tileProperties) {
                                    const tileBbox = {
                                        x: tile.x,
                                        y: tile.y,
                                        width: tileProperties.width,
                                        height: tileProperties.height
                                    };
                                    if (CollisionHelper.AABBColliding(enemyBbox, tileBbox)) {
                                        collisionResults.push({
                                            x: tileBbox.x,
                                            y: tileBbox.y,
                                            width: tileBbox.width,
                                            height: tileBbox.height,
                                            axis: CollisionAxis.Y,
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
                            selfProps.position.y = tileBbox.y + tileBbox.height;
                            selfProps.velY = 0;
                        } else {
                            selfProps.position.x = tileBbox.x - selfProps.position.width;
                            selfProps.velX = 0;
                        }
                    } else {
                        if (crossWidth > -crossHeight) {
                            selfProps.position.x = tileBbox.x + tileBbox.width;
                            selfProps.velX = 0;
                        } else {
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
        onCreated: (self) => { },
        onDestroy: (self) => { },
        onUpdate: (self, timeStamp) => {
            const props = self.props;
            
            if (props.behavior && props.behavior.length > 0) {
                props.behavior[0].onUpdate!(self);
            }
            
            props.velY += props.gravity;
            props.position.x += props.velX;
            props.position.y += props.velY;
            props.isGrounded = false;
        },
        processCollisions: (self: IDynamicEntity<IEnemyProps>, entities) => {
            // This method is fine as it is. It correctly processes collisions with other entities.
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

            const healthBarHeight = 8;
            const healthBarWidth = props.position.width * (props.health.health / 100);
            ctx.fillStyle = "rgba(6, 78, 23, 1)";
            ctx.fillRect(
                props.position.x,
                props.position.y - healthBarHeight - 2,
                healthBarWidth,
                healthBarHeight,
            );
        }
    };
};
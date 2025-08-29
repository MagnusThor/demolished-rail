import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IBulletProps } from "../../interface/IBulletProps";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IEnemyProps } from "../../interface/IEnemyProps";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { TILE_TYPES } from "../../LEVEL_SAMPLE";
import { isSolidTile, getTileProperties } from "../../utils/tileBlockHelpers";


export const enemyCollisionDetectors = [
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
];

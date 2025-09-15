import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IBulletProps } from "../../interface/IBulletProps";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IEnemyProps } from "../../interface/IEnemyProps";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { TileDefinitions } from "../../level/TileDefinitions";
import { isSolidTile, getTileProperties } from "../../utils/tileBlockHelpers";
import { EnemyEntity } from "./enemyEntity";


export const enemyCollisionDetectors = [
    {
        targetName: "bulletBlock",
        detectorFn: (enemy: EnemyEntity, bullet: IGameEntity<IBulletProps>) => {

            

            const collisionResults = new Array<ICollisionResult>();

            if (CollisionHelper.AABBColliding(enemy.getBoundingBox!(enemy), bullet.getBoundingBox!(bullet))) {
                collisionResults.push({
                    x: bullet.props.positioned.x,
                    y: bullet.props.positioned.y,
                    width: bullet.props.positioned.width,
                    height: bullet.props.positioned.height,
                    axis: CollisionAxis.X,
                    targetEntity: bullet
                });
            }
            return collisionResults;
        },

        onCollision: (selfProps: IEnemyProps, collisionData: ICollisionResult) => {
            selfProps.health.health -= collisionData.targetEntity!.props.health.damage;
        }
    },
    {
        targetName: "playerBlock",
        detectorFn: (enemy: EnemyEntity, player: IGameEntity<IPlayerProps>) => {

            const collisionResults = new Array<ICollisionResult>();
            if (CollisionHelper.AABBColliding(enemy.props.positioned.getBoundingBox!(), player.getBoundingBox!(player))) {
                collisionResults.push({
                    x: player.props.positioned.x,
                    y: player.props.positioned.y,
                    width: player.props.positioned.width,
                    height: player.props.positioned.height,
                    axis: CollisionAxis.X,
                    targetEntity: player
                });
            }
            return collisionResults;
        },
        onCollision: (enemy: EnemyEntity, collisionData: ICollisionResult) => {
            const player = collisionData.targetEntity! as IGameEntity<IPlayerProps>;
            player.props.health.health -= enemy.props.health.damage;
        }
    },
    {
        targetName: "tileBlock",
        detectorFn: (enemy: EnemyEntity, tileEntity: IGameEntity<ILevelProps>) => {
            const collisionResults = new Array<ICollisionResult>();
            const enemyBbox = enemy.props.positioned.getBoundingBox!();

            const indexedTiles = tileEntity.props.indexedTiles;
            if (indexedTiles) {
                for (const tile of indexedTiles) {
                    if (isSolidTile(tile.type)) {
                        const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions);
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
        onCollision: (enemy: EnemyEntity, collisionData: ICollisionResult) => {

            const selfProps = enemy.props;

            const tileBbox: IBoundingBox = {
                x: collisionData.x,
                y: collisionData.y,
                width: collisionData.width,
                height: collisionData.height
            };
            const dx = (selfProps.positioned.x + selfProps.positioned.width / 2) - (tileBbox.x + tileBbox.width / 2);
            const dy = (selfProps.positioned.y + selfProps.positioned.height / 2) - (tileBbox.y + tileBbox.height / 2);
            const width = (selfProps.positioned.width + tileBbox.width) / 2;
            const height = (selfProps.positioned.height + tileBbox.height) / 2;
            const crossWidth = width * dy;
            const crossHeight = height * dx;

            if (crossWidth > crossHeight) {
                if (crossWidth > -crossHeight) {
                    selfProps.positioned.y = tileBbox.y + tileBbox.height;
                    selfProps.velY = 0;
                } else {
                    selfProps.positioned.x = tileBbox.x - selfProps.positioned.width;
                    selfProps.velX = 0;
                }
            } else {
                if (crossWidth > -crossHeight) {
                    selfProps.positioned.x = tileBbox.x + tileBbox.width;
                    selfProps.velX = 0;
                } else {
                    selfProps.positioned.y = tileBbox.y - selfProps.positioned.height;
                    selfProps.velY = 0;
                    selfProps.isGrounded = true;
                }
            }
        }
    }
];

import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IBulletProps } from "../../interface/IBulletProps";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IEnemyProps } from "../../interface/IEnemyProps";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { TileDefinitions } from "../../factory/TileDefinitions";
import { GameAssets } from "../../global/GameAssets";
import { GameState } from "../../global/GameState";
import { DebrisHelper } from "../../utils/debrisHelper";
import { isSolidTile, getTileProperties, getSurroundingTiles } from "../../utils/tileEntityHelpers";
import { LevelEntityRenderer } from "../level/LevelEntityRenderer";
import { EnemyEntity } from "./enemyEntity";

/**
 * Generates debris particles from a destroyed enemy and adds them to the game state's particle system.
 *
 * This function extracts the enemy's current sprite sheet image, calculates the center position of the enemy,
 * and uses the DebrisHelper to create debris particles at that location. The generated particles are then
 * pushed into the global game state's particle array.
 *
 * @param enemy - The enemy entity from which to generate debris particles.
 */
const generateDebrisFromEnemy = (enemy: EnemyEntity) => {
    const sourceImage = 
    enemy.props.animations[
    enemy.props.currentAnimationKey].spriteSheet.data;
    const centerX = enemy.props.position.x + enemy.props.position.width / 2;
    const centerY = enemy.props.position.y + enemy.props.position.height / 2;
    const particleCanvas = DebrisHelper.generateDebris(sourceImage!, 25,centerX,centerY,0.25,1);
    GameState.getInstance().particles.push(...particleCanvas);  
};


export const enemyCollisionDetectors = [
    {
        targetName: "bulletBlock",
        detectorFn: (enemy: EnemyEntity, bullet: IGameEntity<IBulletProps>) => {
            const collisionResults = new Array<ICollisionResult>();
            if (CollisionHelper.AABBColliding(enemy.getBoundingBox!(enemy), bullet.getBoundingBox!(bullet))) {
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
        onCollision: (enemy: EnemyEntity, collisionData: ICollisionResult) => {
            enemy.props.health.health -= collisionData.targetEntity!.props.health.damage;
            GameState.getInstance().removeEntityByUUID(collisionData.targetEntity!.uuid);
            if (enemy.props.health.health <= 0) {
                generateDebrisFromEnemy(enemy);
                GameState.getInstance().removeEntityByUUID(enemy.uuid);

            }
        }
    },
    {
        targetName: "playerBlock",
        detectorFn: (enemy: EnemyEntity, player: IGameEntity<IPlayerProps>) => {

            const collisionResults = new Array<ICollisionResult>();
            if (CollisionHelper.AABBColliding(enemy.props.position.getBoundingBox!(), player.getBoundingBox!(player))) {
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
        onCollision: (enemy: EnemyEntity, collisionData: ICollisionResult) => {
            const player = collisionData.targetEntity! as IGameEntity<IPlayerProps>;
            player.props.health.health -= enemy.props.health.damage;
        }
    },
    {
        targetName: "tileBlock",
        detectorFn: (enemy: EnemyEntity, tileEntity: LevelEntityRenderer) => {
            const collisionResults = new Array<ICollisionResult>();
            const enemyBbox = enemy.props.position.getBoundingBox!();
            //const indexedTiles = tileEntity.props.indexedTiles;


            const nearbyTiles = getSurroundingTiles(tileEntity.tileSpatialGrid,
                enemyBbox, 32);


            if (nearbyTiles) {
                for (const tile of nearbyTiles) {
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
            const dx = (selfProps.position.x + selfProps.position.width / 2) - (tileBbox.x + tileBbox.width / 2);
            const dy = (selfProps.position.y + selfProps.position.height / 2) - (tileBbox.y + tileBbox.height / 2);
            const width = (selfProps.position.width + tileBbox.width) / 2;
            const height = (selfProps.position.height + tileBbox.height) / 2;
            const crossWidth = width * dy;
            const crossHeight = height * dx;

            if (crossWidth > crossHeight) {
                if (crossWidth > -crossHeight) {
                    // Collision from above
                    selfProps.position.y = tileBbox.y + tileBbox.height;
                    selfProps.velY = 0;
                } else {
                    // Collision from left
                    selfProps.position.x = tileBbox.x - selfProps.position.width;
                    selfProps.velX = 0;
                }
            } else {
                if (crossWidth > -crossHeight) {
                    selfProps.position.x = tileBbox.x + tileBbox.width;
                    selfProps.velX = 0;

                } else {
                    // Collision from below
                    selfProps.position.y = tileBbox.y - selfProps.position.height;
                    selfProps.velY = 0;
                    selfProps.isGrounded = true;
                }
            }
        }
    }
];

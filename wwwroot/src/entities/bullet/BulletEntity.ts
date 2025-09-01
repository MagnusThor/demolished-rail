import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IBulletProps } from "../../interface/IBulletProps";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { Positioned } from "../../interface/IPositioned";
import { isSolidTile } from "../../utils/tileBlockHelpers";
import { GameEntity } from "../GameEntity";
import { IEnemyProps } from "../../interface/IEnemyProps";
import { StateHelper } from "../StateHelper";

const BULLET_SPEED = 10;

export class BulletEntity extends GameEntity<IBulletProps>  {
    
    constructor(startX: number, startY: number, direction: string) {
         const props = {
                health: {
                    health: 100,
                    damage: 10
                },
                positioned: new Positioned(startX, startY, 8, 8),
                velX: direction === "right" ? BULLET_SPEED : -BULLET_SPEED,
                velY: 0,
                isAlive: true,
                lifeTime: 2000,
                isInitialized: true,
                zIndex:1,
                states:{}
            }

        super(
            "bulletBlock",
            props   
        );

        
        this.collisionDetectors = [
            {
                targetName: "tileBlock",
                detectorFn: this.detectTileCollision,
                onCollision: this.handleTileCollision
            },
            // Collision detector for the enemy entity
            {
                targetName: "enemyBlock",
                detectorFn: (bulletProps: IBulletProps, enemyEntity: IGameEntity<IEnemyProps>) => {
                    const collisionResults = new Array<ICollisionResult>();
                    const bulletBBox = bulletProps.positioned.getBoundingBox!();
                    const enemyBBox = enemyEntity.getBoundingBox!(enemyEntity);

                    if (CollisionHelper.AABBColliding(bulletBBox, enemyBBox)) {
                        collisionResults.push({
                            x: enemyBBox.x,
                            y: enemyBBox.y,
                            width: enemyBBox.width,
                            height: enemyBBox.height,
                            axis: CollisionAxis.X, // or Y, depending on the game logic
                            targetEntity: enemyEntity
                        });
                    }
                    return collisionResults;
                },
                onCollision: (selfProps: IBulletProps, collisionData: ICollisionResult) => {
                    // When the bullet hits an enemy, it should be removed.
                    selfProps.isAlive = false;
                }
            }
        ];
    }
    
    getBoundingBox = (self: IGameEntity<IBulletProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    }
    
    onUpdate? =(self: IGameEntity<IBulletProps>, timeStamp: number): void => {
        self.props.positioned.x += self.props.velX;
        self.props.lifeTime -= timeStamp;
        if (self.props.lifeTime <= 0) {
            self.props.isAlive = false;
        }
    }
    
    onDraw? =(self: IGameEntity<IBulletProps>, helper: CanvasHelper): void => {
        if (!self.props.isAlive) {
            return;
        }
        const props = self.props;
        const ctx = helper.ctx;
        
        ctx.fillStyle = "#FFC107";
        ctx.fillRect(
            props.positioned.x,
            props.positioned.y,
            props.positioned.width,
            props.positioned.height,
        );
    }
    
    public onInit(): void { }
    
    private detectTileCollision(bulletProps: IBulletProps, tileEntity: IGameEntity<ILevelProps>): ICollisionResult[] | false {
        const tileProps = tileEntity.props;
        const collisionResults = new Array<ICollisionResult>();
        const bulletBBox = bulletProps.positioned.getBoundingBox!();

        const bulletTileX = Math.floor(bulletProps.positioned.x / tileProps.tileWidth);
        const bulletTileY = Math.floor(bulletProps.positioned.y / tileProps.tileHeight);
        
        // Dynamically adjust the collision check radius based on bullet speed
        const checkRadius = Math.ceil(Math.abs(bulletProps.velX) / tileProps.tileWidth) + 1;

        for (let row = bulletTileY - checkRadius; row <= bulletTileY + checkRadius; row++) {
            for (let col = bulletTileX - checkRadius; col <= bulletTileX + checkRadius; col++) {
                if (row >= 0 && row < tileProps.tileMap.length && col >= 0 && col < tileProps.tileMap[0].length) {
                    const tileType = tileProps.tileMap[row][col];
                    if (isSolidTile(tileType)) {
                        const tileX = col * tileProps.tileWidth;
                        const tileY = row * tileProps.tileHeight;

                        const tileBBox: IBoundingBox = {
                            x: tileX,
                            y: tileY,
                            width: tileProps.tileWidth,
                            height: tileProps.tileHeight
                        };

                        if (CollisionHelper.AABBColliding(bulletBBox, tileBBox)) {
                            collisionResults.push({
                                x: tileX, y: tileY, width: tileProps.tileWidth, height: tileProps.tileHeight, axis: CollisionAxis.X,
                                targetEntity: tileEntity,
                            });
                        }
                    }
                }
            }
        }
        return collisionResults;
    }

    private handleTileCollision(bulletProps: IBulletProps, collisionData: ICollisionResult): void {
        bulletProps.isAlive = false;
        
    }
}

import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IBulletProps } from "../../interface/IBulletProps";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { Positioned } from "../../interface/IPositioned";
import { isSolidTile } from "../../utils/tileEntityHelpers";
import { GameEntity } from "../GameEntity";
import { IEnemyProps } from "../../interface/IEnemyProps";
import { StateHelper } from "../StateHelper";
import { EnemyEntity } from "../enemy/enemyEntity";
import { LevelEntity } from "../level/levelEntity"; // Ensure this import is available for LevelEntity type

const BULLET_SPEED = 10;

// Type assertion for accessing the LevelEntity's internal collision map
// since IGameEntity<ILevelProps> does not expose it directly.
type LevelEntityWithMap = IGameEntity<ILevelProps> & { 
    logicalCollisionMap: { type: number, x: number, y: number, row: number, col: number }[][], 
    tileWidth: number, 
    tileHeight: number 
};

export class BulletEntity extends GameEntity<IBulletProps> {
    
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
            zIndex: 1,
            states: {},
            isCollidable: true
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
                detectorFn: (bulletEntity: BulletEntity, enemyEntity: EnemyEntity) => {
                    const bulletProps = bulletEntity.props;

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
                            targetEntity: enemyEntity,
                            
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
        // Simple linear movement
        self.props.positioned.x += self.props.velX;
        
        // Decrement life time and check for death
        self.props.lifeTime -= timeStamp;
        if (self.props.lifeTime <= 0) {
       //     self.props.isAlive = false;
        }
    }
    
    onDraw? =(self: IGameEntity<IBulletProps>, helper: CanvasHelper): void => {
        if (!self.props.isAlive) {
            return;
        }
        const props = self.props;
        const ctx = helper.ctx;
        
        // Draw the bullet as a small filled rectangle
        ctx.fillStyle = "#FFC107";
        ctx.fillRect(
            props.positioned.x,
            props.positioned.y,
            props.positioned.width,
            props.positioned.height,
        );
    }
    
    public onInit(): void { }
    
    /**
     * Detects collision with solid tiles in the level map.
     * Rewritten to efficiently check only the tiles the bullet currently overlaps
     * by using the LevelEntity's pre-calculated logicalCollisionMap.
     */
    private detectTileCollision(bulletEntity: BulletEntity, tileEntity: IGameEntity<ILevelProps>): ICollisionResult[] | false {

        const bulletProps = bulletEntity.props;
        const collisionResults = new Array<ICollisionResult>();
        const bulletBBox = bulletProps.positioned.getBoundingBox!();

        // Safely cast the IGameEntity to the expected LevelEntity type to access its internal maps
        const levelEntity = tileEntity as unknown as LevelEntityWithMap; 

        // Ensure we have access to the collision data
        if (!levelEntity.logicalCollisionMap) {
            console.error("LevelEntity logicalCollisionMap not initialized.");
            return false;
        }

        const tileWidth = levelEntity.tileWidth;
        const tileHeight = levelEntity.tileHeight;

        // Determine the range of tile columns and rows the bullet overlaps with its current position
        const startCol = Math.floor(bulletBBox.x / tileWidth);
        const endCol = Math.floor((bulletBBox.x + bulletBBox.width) / tileWidth);
        const startRow = Math.floor(bulletBBox.y / tileHeight);
        const endRow = Math.floor((bulletBBox.y + bulletBBox.height) / tileHeight);

        // Iterate through all potentially overlapping tiles
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                
                // Check map bounds
                if (row >= 0 && row < levelEntity.logicalCollisionMap.length && col >= 0 && col < levelEntity.logicalCollisionMap[0].length) {
                    
                    const collisionTile = levelEntity.logicalCollisionMap[row][col];
                    
                    // Check if the tile is marked as solid (not null and not empty/0x00)
                    if (collisionTile && collisionTile.type !== 0x00) { 
                        
                        const tileBBox: IBoundingBox = {
                            x: collisionTile.x,
                            y: collisionTile.y,
                            width: tileWidth,
                            height: tileHeight
                        };
                        
                        // Perform the final precise collision check against the solid tile's bounding box
                        if (CollisionHelper.AABBColliding(bulletBBox, tileBBox)) {
                            collisionResults.push({
                                x: tileBBox.x, y: tileBBox.y, width: tileBBox.width, height: tileBBox.height, axis: CollisionAxis.X,
                                targetEntity: tileEntity,
                            });
                            // Return immediately upon first collision to destroy the bullet.
                            return collisionResults; 
                        }
                    }
                }
            }
        }
        return collisionResults.length > 0 ? collisionResults : false;
    }

    private handleTileCollision(bulletEntity: BulletEntity, collisionData: ICollisionResult): void {

        //bulletEntity.props.isAlive = false;
        
    }
}

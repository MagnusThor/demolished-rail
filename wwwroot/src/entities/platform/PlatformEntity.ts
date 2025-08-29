import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlatformProps } from "../../interface/IPlatformProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { Positioned } from "../../interface/IPositioned";
import { findClosestSolidTile } from "../../utils/tileBlockHelpers";
import { GameEntity } from "../GameEntity";


export class PlatformEntity extends GameEntity<IPlatformProps> implements IGameEntity<IPlatformProps> {
    
    constructor(tile: any, props: ILevelProps) {
        // Find platform boundaries based on surrounding solid tiles
        const closestTopTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "up");
        const closestBottomTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "down");
        const minY = closestTopTile ? closestTopTile.y * props.tileHeight + props.tileHeight : tile.y * props.tileHeight;
        const maxY = closestBottomTile ? closestBottomTile.y * props.tileHeight - props.tileHeight : tile.y * props.tileHeight;
        
        super(
            "platformBlock",
            {
                position: new Positioned(tile.x * props.tileWidth, minY, props.tileWidth, props.tileHeight),
                velY: 1,
                minY: minY,
                maxY: maxY,
                oldY: tile.y * props.tileHeight,
                color: "blue",
                isInitialized: false,
            }
        );
        
        this.collisionDetectors = [
            {
                targetName: "playerBlock",
                detectorFn: this.detectPlayerCollision,
                onCollision: this.handlePlayerCollision,
            },
        ];
    }
    

    getBoundingBox = (self: IGameEntity<IPlatformProps>): IBoundingBox => {
        return self.props.position.getBoundingBox!();
    }
    
    private detectPlayerCollision(platformProps: IPlatformProps, playerEntity: IGameEntity<IPlayerProps>): ICollisionResult[] {
        const playerProps = playerEntity.props;
        const collisionResults = new Array<ICollisionResult>();

        if (CollisionHelper.AABBColliding(playerProps.position.getBoundingBox!(), platformProps.position.getBoundingBox!())) {
            collisionResults.push({
                axis: CollisionAxis.Y,
                targetEntity: playerEntity,
                x: platformProps.position.x,
                y: platformProps.position.y,
                width: platformProps.position.width,
                height: platformProps.position.height,
            });
        }
        return collisionResults;
    }
    
    private handlePlayerCollision(platformProps: IPlatformProps, collisionData: ICollisionResult): void {
        const player = collisionData.targetEntity! as IGameEntity<IPlayerProps>;
        const playerProps = player.props;

        // The key is to check if the player is moving downwards.
        // This prevents the platform from affecting the player if they hit it from the sides or below.
        if (playerProps.velY >= 0) {
            // This logic is now more robust. It places the player precisely on top of the platform.
            playerProps.position.y = platformProps.position.y - playerProps.position.height;
            playerProps.position.y += platformProps.velY;
            playerProps.velY = 0;
            playerProps.isGrounded = true;
        }
    }
    
    public onUpdate(self: IGameEntity<IPlatformProps>): void {
        self.props.oldY = self.props.position.y;
        
        // Predict the next position to prevent overshooting the boundaries
        const nextY = self.props.position.y + self.props.velY;
        
        if (nextY >= self.props.maxY || nextY <= self.props.minY) {
            self.props.velY *= -1;
        }

        self.props.position.y += self.props.velY;
    }
    
    public onDraw(self: IGameEntity<IPlatformProps>, helper: CanvasHelper): void {
        const ctx = helper.ctx;
        ctx.fillStyle = self.props.color;
        ctx.fillRect(
            self.props.position.x, 
            self.props.position.y,
            self.props.position.width,
            self.props.position.height
        );
    }
}

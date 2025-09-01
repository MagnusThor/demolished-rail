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
import { findClosestSolidTile, getTileProperties } from "../../utils/tileBlockHelpers";
import { GameEntity } from "../GameEntity";


export class PlatformEntity extends GameEntity<IPlatformProps> implements IGameEntity<IPlatformProps> {
    texture: any;
    // Add a class property to store the tile properties
    private tileProperties: any;
    
    constructor(tile: any, props: ILevelProps,texture:any) {
        // Find platform boundaries based on surrounding solid tiles
        const closestTopTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "up");
        const closestBottomTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "down");
        const minY = closestTopTile ? closestTopTile.y * props.tileHeight + (props.tileHeight+32) : tile.y * props.tileHeight;
        const maxY = closestBottomTile ? closestBottomTile.y * props.tileHeight  : tile.y * props.tileHeight;
        
        // Calculate the tile properties and store them in a local variable before the super call.
        const tileProps = getTileProperties(3)!;
        
        super(
            "platformBlock",
            {
                positioned: new Positioned(tile.x * props.tileWidth, minY, tileProps.width, tileProps.height),
                velY: 1,
                minY: minY,
                maxY: maxY,
                oldY: tile.y * props.tileHeight,
                color: "blue",
                isInitialized: false,
                zIndex:1
            }
        );

        // Now, after the super call, assign the local variable to the class property.
        this.tileProperties = tileProps;
        this.texture = texture
        
        
        this.collisionDetectors = [
            {
                targetName: "playerBlock",
                detectorFn: this.detectPlayerCollision,
                onCollision: this.handlePlayerCollision,
            },
        ];
    }
    

    getBoundingBox = (self: IGameEntity<IPlatformProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    }
    
    private detectPlayerCollision(platformProps: IPlatformProps, playerEntity: IGameEntity<IPlayerProps>): ICollisionResult[] {
        const playerProps = playerEntity.props;
        const collisionResults = new Array<ICollisionResult>();

        if (CollisionHelper.AABBColliding(playerProps.positioned.getBoundingBox!(), platformProps.positioned.getBoundingBox!())) {
            collisionResults.push({
                axis: CollisionAxis.Y,
                targetEntity: playerEntity,
                x: platformProps.positioned.x,
                y: platformProps.positioned.y,
                width: platformProps.positioned.width,
                height: platformProps.positioned.height,
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
            playerProps.positioned.y = platformProps.positioned.y - playerProps.positioned.height;
            playerProps.positioned.y += platformProps.velY;
            playerProps.velY = 0;
            playerProps.isGrounded = true;
        }
    }
    
    public onUpdate(self: IGameEntity<IPlatformProps>): void {
        self.props.oldY = self.props.positioned.y;
        
        // Predict the next position to prevent overshooting the boundaries
        const nextY = self.props.positioned.y + self.props.velY;
        
        // FIX: The platform was reversing direction too early. The check for maxY must include the platform's height.
        if ((nextY + self.props.positioned.height) >= self.props.maxY || nextY <= self.props.minY) {
            self.props.velY *= -1;
        }

        self.props.positioned.y += self.props.velY;
    }
    
    public onDraw(self: IGameEntity<IPlatformProps>, helper: CanvasHelper): void {

        
        const tileTexture = this.texture;

        const ctx = helper.ctx;

        ctx.drawImage(
            tileTexture.texture.src, // Source image
            tileTexture.x,           // Source x
            tileTexture.y,           // Source y
            tileTexture.width,       // Source width
            tileTexture.height,      // Source height
            self.props.positioned.x,                  // Destination x
            self.props.positioned.y,                  // Destination y
            // Use the stored tile properties for drawing dimensions
            this.tileProperties.width,    // Destination width
            this.tileProperties.height     // Destination height
        );

        // ctx.fillStyle = self.props.color;
        // ctx.fillRect(
        //  self.props.positioned.x, 
        //  self.props.positioned.y,
        //  self.props.positioned.width,
        //  self.props.positioned.height
        // );
    }
}

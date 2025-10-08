import { Point2D } from "../../../../src";
import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlatformProps } from "../../interface/IPlatformProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { Positioned } from "../../interface/IPosition2D";
import { IGameTexture } from "../../interface/ITexture";
import { findClosestSolidTile, getTileProperties } from "../../utils/tileEntityHelpers";
import { GameEntity } from "../GameEntity";


export class PlatformEntity extends GameEntity<IPlatformProps>{
    texture: IGameTexture;
    // Add a class property to store the tile properties
    private tileProperties: any;
    
    constructor(tile: any, props: ILevelProps,texture:IGameTexture) {
        // Find platform boundaries based on surrounding solid tiles
        const closestTopTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "up");
        const closestBottomTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "down");
        const minY = closestTopTile ? closestTopTile.y * props.tileHeight + (props.tileHeight+32) : tile.y * props.tileHeight;
        const maxY = closestBottomTile ? closestBottomTile.y * props.tileHeight  : tile.y * props.tileHeight;
        
        // Calculate the tile properties and store them in a local variable before the super call.
        const tileProps = getTileProperties(0x30)!;
        
        super(
            "platformBlock",
            {
                position: new Positioned(tile.x * props.tileWidth, minY, tileProps.width, tileProps.height),
                velY: 2 * Math.random(),
                minY: minY,
                maxY: maxY,
                oldY: tile.y * props.tileHeight,
                isInitialized: false,
                zIndex:1,
                states:{},
                isCollidable: true
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
        return self.props.position.getBoundingBox!();
    }
    
    private detectPlayerCollision(platformEntity: PlatformEntity, playerEntity: IGameEntity<IPlayerProps>): ICollisionResult[] {

        const platformProps = platformEntity.props;

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
                collisionNormal:new Point2D(0,0)

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
            //playerProps.states["isGrounded"] = true;
            player.stateHelper.set("isGrounded",true);
        }
    }
    
    public onUpdate(self: IGameEntity<IPlatformProps>): void {
        self.props.oldY = self.props.position.y;
        
        // Predict the next position to prevent overshooting the boundaries
        const nextY = self.props.position.y + self.props.velY;
        
        // FIX: The platform was reversing direction too early. The check for maxY must include the platform's height.
        if ((nextY + self.props.position.height) >= self.props.maxY || nextY <= self.props.minY) {
            self.props.velY *= -1;
        }

        self.props.position.y += self.props.velY;
    }
    
    public onDraw(self: IGameEntity<IPlatformProps>, helper: CanvasHelper): void {

        
        const tileTexture = this.texture;

        const ctx = helper.ctx;

        ctx.drawImage(
            tileTexture.asset!.data!, // Source image
            tileTexture.x,           // Source x
            tileTexture.y,           // Source y
            tileTexture.width,       // Source width
            tileTexture.height,      // Source height
            self.props.position.x,              // Destination x
            self.props.position.y,              // Destination y
            // Use the stored tile properties for drawing dimensions
            this.tileProperties.width,    // Destination width
            this.tileProperties.height      // Destination height
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

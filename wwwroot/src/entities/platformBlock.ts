import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { CollisionAxis, ICollisionResult, IGameEntity } from "../interface/IGameEntity";
import { IPlatformProps } from "../interface/IPlatformProps";
import { IPlayerProps } from "../interface/IPlayerProps";
import { Positioned } from "../interface/IPositioned";
import { ITileProps } from "../interface/ITileProps";
import { findClosestSolidTile } from "../utils/tileBlockHelpers";

export const platformBlock = (tile: any, props: ITileProps): IGameEntity<IPlatformProps> => {
    const closestTopTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "up");
    const closestBottomTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "down");
    const minY = closestTopTile ? closestTopTile.y * props.tileHeight + props.tileHeight : tile.y * props.tileHeight;
    const maxY = closestBottomTile ? closestBottomTile.y * props.tileHeight - props.tileHeight : tile.y * props.tileHeight;
    return {
        key: "platformBlock",
        name: "platformBlock",
        uuid: crypto.randomUUID(),
        props: {
            position: new Positioned(tile.x * props.tileWidth, minY, props.tileWidth, props.tileHeight),
            
            velY: 1,
            minY: minY,
            maxY: maxY,
            oldY: tile.y * props.tileHeight,
            color: "blue",
        },
        getBoundingBox: (self): IBoundingBox => {
           return self.props.position.getBoundingBox!();
        },
        collisionDetectors: [
            {
                targetName: "playerBlock",
                detectorFn: (platformProps: IPlatformProps, playerEntity: IGameEntity<IPlayerProps>) => {
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
                },
                onCollision: (platformProps: IPlatformProps, collisionData: ICollisionResult) => {
                    const player = collisionData.targetEntity!;
                    const playerProps = player.props as IPlayerProps;
                    const playerIsOnTop = playerProps.position.y + playerProps.position.height >= platformProps.position.y;
                    if (playerIsOnTop) {
                        playerProps.position.y = platformProps.position.y - playerProps.position.height;
                        playerProps.position.y += platformProps.velY;
                        playerProps.velY = 0;
                        playerProps.isGrounded = true;
                    }
                }
            },
        ],
        onUpdate: (self, ts) => {
            self.props.oldY = self.props.position.y;

            self.props.position.y += self.props.velY;
            if (self.props.position.y >= self.props.maxY || self.props.position.y <= self.props.minY) {
                self.props.velY *= -1;
            }
        },
        onDraw: (self, helper) => {
            const ctx = helper.ctx;
    
            ctx.fillStyle = self.props.color;
            ctx.fillRect(
                self.props.position.x, 
                self.props.position.y,
                self.props.position.width,
                self.props.position.height
            );
        }
    };
};

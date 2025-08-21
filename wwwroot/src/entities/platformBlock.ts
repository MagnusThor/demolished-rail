import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { CollisionAxis, ICollisionResult, IGameEntity } from "../interface/IGameEntity";
import { IPlatformProps } from "../interface/IPlatformProps";
import { ITileProps } from "../interface/ITileProps";
import { IPlayerProps } from "./playerBlock";
import { findClosestSolidTile } from "./tileBlockHelpers";

export const platformBlock = (tile: any, props: ITileProps): IGameEntity<IPlatformProps> => {
    const closestTopTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "up");
    const closestBottomTile = findClosestSolidTile(props.tileMap, tile.x, tile.y, "down");

    const minY = closestTopTile ? closestTopTile.y * props.tileHeight + props.tileHeight : tile.y * props.tileHeight;
    const maxY = closestBottomTile ? closestBottomTile.y * props.tileHeight - props.tileHeight : tile.y * props.tileHeight;

    return {
        key: "platformBlock",
        name: "platformBlock",
        props: {
            x: tile.x * props.tileWidth,
            y: tile.y * props.tileHeight,
            width: props.tileWidth,
            height: props.tileHeight,
            velY: 1,
            minY: minY,
            maxY: maxY,
            oldY: tile.y * props.tileHeight,
            color: "blue",
        },
        getBoundingBox: (self): IBoundingBox => {
            return {
                x: self.props.x,
                y: self.props.y,
                width: self.props.width,
                height: self.props.height
            };
        },
        collisionDetectors: [
            {
                targetName: "playerBlock",
                detectorFn: (platformProps: IPlatformProps, playerEntity: IGameEntity<IPlayerProps>) => {
                    const playerProps = playerEntity.props;
                    const collisionResults = new Array<ICollisionResult>();

                    if (
                        playerProps.x < platformProps.x + platformProps.width &&
                        playerProps.x + playerProps.width > platformProps.x &&
                        playerProps.y < platformProps.y + platformProps.height &&
                        playerProps.y + playerProps.height > platformProps.y
                    ) {
                        collisionResults.push({
                            axis: CollisionAxis.Y,
                            targetEntity: playerEntity,
                            x: platformProps.x,
                            y: platformProps.y,
                            width: platformProps.width,
                            height: platformProps.height,
                        });
                    }
                    return collisionResults;
                },
                onCollision: (platformProps: IPlatformProps, collisionData: ICollisionResult) => {
                  const player = collisionData.targetEntity!;
                    const playerProps = player.props as IPlayerProps;

                    // This is the core of the new logic.
                    // We check if the player's bottom is at or just below the platform's top.
                    const playerIsOnTop = playerProps.y + playerProps.height >= platformProps.y;
                    
                    if (playerIsOnTop) {
                        // Correct the player's vertical position to be perfectly on the platform.
                        playerProps.y = platformProps.y - playerProps.height;
                        
                        // Apply the platform's vertical velocity to the player,
                        // allowing them to "ride" it.
                        playerProps.y += platformProps.velY;

                        // Stop the player's downward velocity and set grounded state
                        playerProps.velY = 0;
                        playerProps.isGrounded = true;

                        // IMPORTANT: We do not return here. This allows the player to
                        // move left or right with their own input *while* riding the platform.
                    }
                }
            },
        ],
        onUpdate: (self, ts) => {
            self.props.oldY = self.props.y;

            self.props.y += self.props.velY;
            if (self.props.y >= self.props.maxY || self.props.y <= self.props.minY) {
                self.props.velY *= -1;
            }
        },
        onDraw: (self, helper) => {
            const ctx = helper.ctx;
            const viewportX = gameState.viewport.x;
            const viewportY = gameState.viewport.y;
            ctx.fillStyle = self.props.color;
            ctx.fillRect(
                self.props.x - viewportX,
                self.props.y - viewportY,
                self.props.width,
                self.props.height
            );
        }
    };
};
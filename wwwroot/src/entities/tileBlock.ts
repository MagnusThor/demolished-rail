import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IGameEntity } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ITileProps";
import { isEntityInView } from "../utils/visibilityHelpers";
import { collectibleBlock } from "./collectibleBlock";
import { platformBlock } from "./platformBlock";
import { getTilesByType } from "./tileBlockHelpers";


export const tileBlock: IGameEntity<ITileProps> = {
    key: "tileBlock",
    name: "tileBlock",
    props: {
        tileMap: [],
        tileWidth: 0,
        tileHeight: 0,
        platforms: [],
        collectibles: []
    },
    onInit: (self) => {
        const props = self.props;

        props.collectibles = getTilesByType(props.tileMap, 4).map(tile => {
            return {
                ...collectibleBlock(tile, props.tileWidth, props.tileHeight),
                props: {
                    ...collectibleBlock(tile, props.tileWidth, props.tileHeight).props,
                    x: tile.x * props.tileWidth,
                    y: tile.y * props.tileHeight,
                }
            };
        });
        props.platforms = getTilesByType(props.tileMap, 3).map(tile => {
            return platformBlock(tile, props);
        });
    },
    onUpdate: (self, timeStamp) => {
        const viewport = gameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;
        
        // This is the centralized collision detection loop.
        // It iterates through the player and checks for collisions with relevant objects.
        const player = gameState.findEntities("playerBlock")[0];
        if (player) {
            // Check for collisions with platforms
            self.props.platforms?.forEach(platform => {
                // Perform frustum culling before collision check
                if (isEntityInView(platform, viewport, screenWidth, screenHeight)) {
                    // Assuming platforms have a detector for the player
                    const detector = platform.collisionDetectors?.find(d => d.targetName === "playerBlock");
                    if (detector) {
                        const collisionResults = detector.detectorFn(platform.props, player);
                        if (collisionResults) {
                            // Since detectorFn returns a single result or an array, we handle both cases.
                            if (Array.isArray(collisionResults)) {
                                collisionResults.forEach(result => detector.onCollision(platform.props, result));
                            } else {
                                if (collisionResults !== true) {
                                    detector.onCollision(platform.props, collisionResults);
                                }
                            }
                        }
                    }
                }
            });

            // Check for collisions with collectibles
            self.props.collectibles?.forEach(collectible => {
                // Perform frustum culling before collision check
                if (isEntityInView(collectible, viewport, screenWidth, screenHeight)) {
                    // Assuming collectibles have a detector for the player
                    const detector = collectible.collisionDetectors?.find(d => d.targetName === "playerBlock");
                    if (detector) {
                        const collisionResults = detector.detectorFn(collectible.props, player);
                        if (collisionResults) {
                            if (Array.isArray(collisionResults)) {
                                collisionResults.forEach(result => detector.onCollision(collectible.props, result));
                            } else if (collisionResults && collisionResults !== true) {
                                detector.onCollision(collectible.props, collisionResults);
                            }
                        }
                    }
                }
            });
        }

        // Update collectibles and platforms that are in view.
        self.props.collectibles?.forEach(collectible => {
            if (isEntityInView(collectible, viewport, screenWidth, screenHeight)) {
                collectible.onUpdate!(collectible, timeStamp);
            }
        });

        self.props.platforms?.forEach(platform => {
            if (isEntityInView(platform, viewport, screenWidth, screenHeight)) {
                platform.onUpdate!(platform, timeStamp);
            }
        });
    },
    onDraw: (self, helper) => {
        const props = self.props;
        const ctx = helper.ctx;
        const viewport = gameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;

        // Draw solid tiles (type 1) using frustum culling
        const solidTiles = getTilesByType(props.tileMap, 1);
        solidTiles.forEach(tile => {
            const tileX = tile.x * props.tileWidth;
            const tileY = tile.y * props.tileHeight;
            if (
                tileX < viewport.x + screenWidth &&
                tileX + props.tileWidth > viewport.x &&
                tileY < viewport.y + screenHeight &&
                tileY + props.tileHeight > viewport.y
            ) {
                ctx.fillStyle = "#666";
                ctx.fillRect(
                    tileX - viewport.x,
                    tileY - viewport.y,
                    props.tileWidth,
                    props.tileHeight
                );
            }
        });

        // Draw non-solid tiles (type 2) using frustum culling
        const nonSolidTiles = getTilesByType(props.tileMap, 2);
        nonSolidTiles.forEach(tile => {
            const tileX = tile.x * props.tileWidth;
            const tileY = tile.y * props.tileHeight;
            if (
                tileX < viewport.x + screenWidth &&
                tileX + props.tileWidth > viewport.x &&
                tileY < viewport.y + screenHeight &&
                tileY + props.tileHeight > viewport.y
            ) {
                ctx.fillStyle = "#ccc";
                ctx.fillRect(
                    tileX - viewport.x,
                    tileY - viewport.y,
                    props.tileWidth,
                    props.tileHeight
                );
            }
        });

        // Draw platforms only if they are in view
        props.platforms?.forEach(platform => {
            if (isEntityInView(platform, viewport, screenWidth, screenHeight, 0)) {
                platform.onDraw!(platform, helper);
            }
        });

        // Draw collectibles only if they are in view
        props.collectibles?.forEach(collectible => {
            if (isEntityInView(collectible, viewport, screenWidth, screenHeight, 0)) {
                collectible.onDraw!(collectible, helper);
            }
        });
    },
    getBoundingBox: (self): IBoundingBox => {
        const width = self.props.tileMap[0].length * self.props.tileWidth;
        const height = self.props.tileMap.length * self.props.tileHeight;
        return { x: 0, y: 0, width, height };
    }
};
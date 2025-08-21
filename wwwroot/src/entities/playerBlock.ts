// entities/playerBlock.ts
import { InputHelper } from "../../../src";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { KeyCode } from "../enums/KeyCode";
import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { CollisionAxis, ICollisionResult, IGameEntity, IGameEntityProp } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ITileProps";
import { bulletBlock } from "./bulletBlock";
import { isSolidTile } from "./tileBlockHelpers";

export interface IPlayerProps extends IGameEntityProp {
    x: number;
    y: number;
    width: number;
    height: number;
    velX: number;
    velY: number;
    gravity: number;
    isJumping: boolean;
    isGrounded: boolean;
    isMovingLeft: boolean;
    isMovingRight: boolean;
    lastDirection: "left" | "right";
    tileMap: number[][];
    tileWidth: number;
    tileHeight: number;
    input: InputHelper;
    worldWidth: number;
    isInitialized: boolean;
    
    
}

export const playerEntity: IGameEntity<IPlayerProps> = {
    key: "playerBlock",
    name: "playerBlock",
    props: {
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        velX: 0,
        velY: 0,
        gravity: 0.25,
        isJumping: false,
        isGrounded: false,
        isMovingLeft: false,
        isMovingRight: false,
        lastDirection: "right",
        tileMap: [],
        tileWidth: 0,
        tileHeight: 0,
        input: new InputHelper(document.createElement('canvas')),
        worldWidth: 0,
        isInitialized: false,
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
            targetName: "tileBlock",
            detectorFn: (playerProps: IPlayerProps, tileEntity: IGameEntity<ITileProps>) => {
                         const tileProps = tileEntity.props;
                    const collisionResults = new Array<ICollisionResult>();
                    const playerTileX = Math.floor(playerProps.x / tileProps.tileWidth);
                    const playerTileY = Math.floor(playerProps.y / tileProps.tileHeight);
                    const checkRadius = 2;
                    for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
                        for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                            if (row >= 0 && row < tileProps.tileMap.length && col >= 0 && col < tileProps.tileMap[0].length) {
                                const tileType = tileProps.tileMap[row][col];
                                if (isSolidTile(tileType)) {
                                    const tileX = col * tileProps.tileWidth;
                                    const tileY = row * tileProps.tileHeight;                                    
                                    if (CollisionHelper.isRectRectColliding(
                                        playerProps.x, playerProps.y, playerProps.width, playerProps.height,
                                        tileX, tileY, tileProps.tileWidth, tileProps.tileHeight
                                    )) {
                                        collisionResults.push({
                                            x: tileX, y: tileY, width: tileProps.tileWidth, height: tileProps.tileHeight, axis: CollisionAxis.X,
                                            targetEntity: tileEntity
                                        });
                                    }
                                }
                            }
                        }
                    }
                    return collisionResults;
            },
            onCollision: (playerProps: IPlayerProps, collisionData: ICollisionResult) => {
                if (!collisionData) {
                    return;
                }
                const axis = collisionData.axis;
                const tileX = collisionData.x;
                const tileY = collisionData.y;
                const tileWidth = collisionData.width;
                const tileHeight = collisionData.height;
                if (axis === 'x') {
                    if (playerProps.velX > 0) {
                        playerProps.x = tileX - playerProps.width;
                    } else if (playerProps.velX < 0) {
                        playerProps.x = tileX + tileWidth;
                    }
                    playerProps.velX = 0;
                } else if (axis === 'y') {
                    if (playerProps.velY > 0) {
                        playerProps.y = tileY - playerProps.height;
                        playerProps.isGrounded = true;
                    } else if (playerProps.velY < 0) {
                        playerProps.y = tileY + tileHeight;
                    }
                    playerProps.velY = 0;
                }
            }
        }
    ],
    onInit: (self) => {
        self.props.isInitialized = true;
    },
    onUpdate: (self, timeStamp) => {
    const props = self.props;
        const input = props.input;
        const MOVE_SPEED = 5;
        const JUMP_SPEED = 10;
        
        props.isMovingLeft = input.isKeyPressed(KeyCode.ArrowLeft) || input.isKeyPressed(KeyCode.KeyA);
        props.isMovingRight = input.isKeyPressed(KeyCode.ArrowRight) || input.isKeyPressed(KeyCode.KeyD);
        props.velX = 0;
        if (props.isMovingLeft) {
            props.velX = -MOVE_SPEED;
            props.lastDirection = "left";
        } else if (props.isMovingRight) {
            props.velX = MOVE_SPEED;
            props.lastDirection = "right";
        }
        props.x += props.velX;     
        if (input.isKeyPressed(KeyCode.Space)) {
            const newBullet = bulletBlock(
                props.x + (props.lastDirection === "right" ? props.width : -props.width), 
                props.y + props.height / 2, 
                props.lastDirection
            );
            gameState.dynamicEntities.push(newBullet);
            newBullet.onCreated?.(newBullet);
            input.consumeKey(KeyCode.Space);
        }
        const tileBlock = gameState.findEntities("tileBlock")[0];
        if (tileBlock && playerEntity.collisionDetectors) {
            const detector = playerEntity.collisionDetectors.find(d => d.targetName === "tileBlock");
            if (detector) {
                const collisionResults = detector.detectorFn(props, tileBlock);
                if (Array.isArray(collisionResults)) {
                    collisionResults.forEach(collisionData => {
                        collisionData.axis = CollisionAxis.X;
                        detector.onCollision(props, collisionData);
                    });
                }
            }
        }
        if ((input.isKeyPressed(KeyCode.ArrowUp) || input.isKeyPressed(KeyCode.KeyW)) && props.isGrounded) {
            props.isJumping = true;
            props.isGrounded = false;
            props.velY = -JUMP_SPEED;
        }
        if (props.velY < 10) {
            props.velY += props.gravity;
        }
        props.y += props.velY;
        props.isGrounded = false;
        
        if (tileBlock && playerEntity.collisionDetectors) {
            const detector = playerEntity.collisionDetectors.find(d => d.targetName === "tileBlock");
            if (detector) {
                const collisionResults = detector.detectorFn(props, tileBlock);
                if (Array.isArray(collisionResults)) {
                    collisionResults.forEach(collisionData => {
                        collisionData.axis = CollisionAxis.Y;
                        detector.onCollision(props, collisionData);
                    });
                }
            }
        }
        gameState.viewport.x = props.x - gameState.viewport.viewportWidth / 2;
        gameState.viewport.y = props.y - gameState.viewport.viewportHeight / 2;
    },
    onDraw: (self, helper) => {
        const props = self.props;
        const ctx = helper.ctx;
        const viewportX = gameState.viewport.x;
        const viewportY = gameState.viewport.y;
        ctx.fillStyle = "red";
        ctx.fillRect(
            props.x - viewportX,
            props.y - viewportY,
            props.width,
            props.height,
        );
    }
};
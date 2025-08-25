// entities/playerBlock.ts
import { InputHelper } from "../../../src";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { KeyCode } from "../enums/KeyCode";
import { gameAssets, gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IGameEntity } from "../interface/IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";
import { ICollisionResult } from "../interface/ICollisionResult";
import { ITileProps } from "../interface/ITileProps";
import { bulletBlock } from "./bulletBlock";
import { isSolidTile } from "../utils/tileBlockHelpers";
import { IPlayerProps } from "../interface/IPlayerProps";
import { Positioned } from "../interface/IPositioned";
import { ISpriteAnimation } from "../interface/IGameSprite";
import { ISpriteSheetAsset } from "../utils/GameAssets";
import { TILE_HEIGHT, CURRENT_LEVEL_TILE_MAP, TILE_WIDTH } from "../GameRunner";





export const playerEntity = (): IGameEntity<IPlayerProps> => {


    const animations: { [key: string]: ISpriteAnimation } = {
        walk: {
            name: 'walk',
            frames: [0, 1, 2, 3, 4, 5],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: gameAssets.getSpriteSheet("player_walk", 32, 32, 3, 2)!

        },
        idle: {
            name: 'idle',
            frames: [0], // You might have a specific idle frame
            frameRate: 1, // Can be a slow rate or 0
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: gameAssets.getSpriteSheet("player_walk", 32, 32, 3, 2)!
        },
        jump: {
            name: 'jump',
            frames: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            frameRate: 10,
            currentFrameIndex: 0,
            lastFrameChangeTime: 0,
            spriteSheet: gameAssets.getSpriteSheet("player_jump", 32, 32, 3, 3)!
        },

        // You can add more animations here, e.g., 'jump', 'attack'
    };






    const player: IGameEntity<IPlayerProps> =
    {


        key: "playerBlock",
        name: "playerBlock",
        uuid: crypto.randomUUID(), // Unique identifier for the player block

       
        props: {
            position: new Positioned(32, 32, 32, 32),
            
            velX: 0,
            velY: 0,
            
            gravity: 0.25,
            isJumping: false,
            isGrounded: false,
            isMovingLeft: false,
            isMovingRight: false,
            lastDirection: "right",

            tileMap: CURRENT_LEVEL_TILE_MAP,
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT,
            
      
            isInitialized: false,
            health: {
                health: 100,
                damage: 0
            },
            animations: animations,
            currentAnimation: animations["idle"]
        },
        getBoundingBox: (self): IBoundingBox => {
            return self.props.position.getBoundingBox!();
        },
        collisionDetectors: [
            {
                targetName: "tileBlock",
                detectorFn: (playerProps: IPlayerProps, tileEntity: IGameEntity<ITileProps>) => {
                    const tileProps = tileEntity.props;
                    const collisionResults = new Array<ICollisionResult>();
                    const playerTileX = Math.floor(playerProps.position.x / tileProps.tileWidth);
                    const playerTileY = Math.floor(playerProps.position.y / tileProps.tileHeight);
                    const checkRadius = 2;
                    for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
                        for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                            if (row >= 0 && row < tileProps.tileMap.length && col >= 0 && col < tileProps.tileMap[0].length) {
                                const tileType = tileProps.tileMap[row][col];
                                if (isSolidTile(tileType)) {
                                    const tileX = col * tileProps.tileWidth;
                                    const tileY = row * tileProps.tileHeight;
                                    if (CollisionHelper.isRectRectColliding(
                                        playerProps.position.x, playerProps.position.y, playerProps.position.width,
                                        playerProps.position.height,
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
                            playerProps.position.x = tileX - playerProps.position.width;
                        } else if (playerProps.velX < 0) {
                            playerProps.position.x = tileX + tileWidth;
                        }
                        playerProps.velX = 0;
                    } else if (axis === 'y') {
                        if (playerProps.velY > 0) {
                            playerProps.position.y = tileY - playerProps.position.height;
                            playerProps.isGrounded = true;
                        } else if (playerProps.velY < 0) {
                            playerProps.position.y = tileY + tileHeight;
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

            const input = gameState.input!;

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
            props.position.x += props.velX;
            if (input.isKeyPressed(KeyCode.Space)) {
                const newBullet = bulletBlock(
                    props.position.x + (props.lastDirection === "right" ? props.position.width : -props.position.width),
                    props.position.y + props.position.height / 2,
                    props.lastDirection
                );
                gameState.dynamicEntities.push(newBullet);
                newBullet.onCreated?.(newBullet);
                input.consumeKey(KeyCode.Space);
            }
            const tileBlock = gameState.findEntities("tileBlock")[0];
            if (tileBlock && gameState.player!.collisionDetectors) {
                const detector = gameState.player!.collisionDetectors.find(d => d.targetName === "tileBlock");
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
                props.currentAnimation = props.animations["jump"];
            }
            if (props.velY < 10) {
                props.velY += props.gravity;
            }
            props.position.y += props.velY;
            props.isGrounded = false;

            if (tileBlock && gameState.player!.collisionDetectors!) {
                const detector = gameState.player!.collisionDetectors.find(d => d.targetName === "tileBlock");
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


            // Animation Logic

            // Jump animation takes priority
            if (!props.isGrounded) {
                if (props.currentAnimation.name !== "jump") {
                    props.currentAnimation = props.animations["jump"];
                }
            }
            // If not in the air, check for walk or idle
            else {
                if (props.isMovingLeft || props.isMovingRight) {
                    // If the player is moving, switch to the walk animation
                    if (props.currentAnimation.name !== 'walk') {
                        props.currentAnimation = props.animations.walk;
                        props.currentAnimation.currentFrameIndex = 0; // Reset animation
                    }
                } else {
                    // If the player is not moving, switch to the idle animation
                    if (props.currentAnimation.name !== 'idle') {
                        props.currentAnimation = props.animations.idle;
                        props.currentAnimation.currentFrameIndex = 0; // Reset animation
                    }
                }
            }


        },
        onDraw: (self, helper) => {
            const props = self.props;
            helper.drawAnimatedSprite(
                props.currentAnimation,
                props.position.x,
                props.position.y,
                performance.now()
            );
        }
    }
    return player;
};

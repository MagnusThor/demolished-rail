import { CollisionAxis } from "../../enums/CollisionAxis";
import { KeyCode } from "../../enums/KeyCode";
import { gameState } from "../../gameState";
import { IGameEntity } from "../../interface/IGameEntity";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { BulletEntity } from "../bullet/BulletEntity";


export const playerUpdate = (self: IGameEntity<IPlayerProps>, timeStamp: Number): void => {

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
        const newBullet = new BulletEntity(
            props.position.x + (props.lastDirection === "right" ? props.position.width : -props.position.width),
            props.position.y + props.position.height / 2,
            props.lastDirection
        );
        gameState.dynamicEntities.push(newBullet);
    
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
    // Jump animation takes priority
    if (!props.isGrounded) {
        if (props.currentAnimation!.name !== "jump") {
            props.currentAnimation = props.animations["jump"];
        }
    }
    // If not in the air, check for walk or idle
    else {
        if (props.isMovingLeft || props.isMovingRight) {
            // If the player is moving, switch to the walk animation
            if (props.currentAnimation!.name !== 'walk') {
                props.currentAnimation = props.animations.walk;
                props.currentAnimation.currentFrameIndex = 0; // Reset animation
            }
        } else {
            // If the player is not moving, switch to the idle animation
            if (props.currentAnimation!.name !== 'idle') {
                props.currentAnimation = props.animations.idle;
                props.currentAnimation.currentFrameIndex = 0; // Reset animation
            }
        }
    }
}
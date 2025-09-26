import { Point2D } from "../../../../src";
import { IGameEntityBehavior } from "../../interface/IGameEntity";
import { IPlayerBehavior } from "../../interface/IPlayerProps";
import { Positioned } from "../../interface/IPositioned";
import { gameState } from "../../state/gameState";
import { getSurroundingTiles, getTileProperties, getTileXY } from "../../utils/tileEntityHelpers";
import { LevelEntity } from "../level/levelEntity";
import { RopeEntity } from "../platform/RopeEntity";
import { InteractableEntity } from "../triggerzone/InteractableEntity";

import { ExtendedCollisionHelper } from "./collisiondetectors/extendedCollitionHelper";
import { PlayerEntity } from "./playerEntity";


export const ResetState: IPlayerBehavior = {
    name:"reset",
    order:1,
    criteria: (player:PlayerEntity) => true,
    onUpdate: (player:PlayerEntity) => {
        const stateHelper = player.stateHelper;
        stateHelper.set<boolean>("isGrounded", false);
        stateHelper.set<boolean>("onLadder", false);
        stateHelper.set<boolean>("onPlatform", false); 
    }
}



export const CollisionBehavior: IPlayerBehavior = {
    name: "player-entity-collition",
    order: 65,
    criteria: (player:PlayerEntity) => true,
    onUpdate: (player:PlayerEntity) => {
        const props = player.props;
        const gameEntities = gameState.entities;       
        const levelEntity = gameState.findEntities("tileBlock")[0] as LevelEntity;        
        // Calculate the player's potential next position
        const nextX = props.positioned.x + props.velX;
        const nextY = props.positioned.y + props.velY
        const nextBoundingBox = {
            x: nextX,
            y: nextY,
            width: props.positioned.width,
            height: props.positioned.height
        };
        // Get surrounding tiles based on the next position
        const surroundingTiles = getSurroundingTiles(levelEntity.tileSpatialGrid,nextBoundingBox,32);
        // Check collisions with surrounding tiles
        for (const tile of surroundingTiles) {
            // find the game entity that corresponds to this tile's coordinates            
            const playerPosition = props.positioned;
            gameEntities.forEach(entity => {
                     const entityBBox = new Positioned(entity.props.positioned.x , entity.props.positioned.y,32,32).getBoundingBox(); // we use 32x32 as default tile size
                     const playerBBox = playerPosition.getBoundingBox();
                     if(ExtendedCollisionHelper.AABBColliding(playerBBox, entityBBox!)){
                        if(entity.uuid !== player.uuid){
                            // lets of we got and interactable entity  
                            if(entity.name === "interactable"){
                                const castedEntity = entity as InteractableEntity;
                                // lets is just move it;
                                castedEntity.props.positioned.x += props.velX;                             
                            }
                            else if(entity.name === "triggerZone"){
                                // do ops
                            }
                        }
                     }

            });
            
           
        }
    }
};

export const JumpBehavior: IPlayerBehavior = {
    name: "jump",
    order: 10, // Executed early in the physics loop
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("wantsToJump"),
    onUpdate: (player:PlayerEntity) => {
        const stateHelper = player.stateHelper;
        const props = player.props;

        if (stateHelper.get<boolean>("isSwinging")) {
            // Detach logic
            const DETACH_SPEED = 10;
            props.velX = Math.sin((props.attachedTo! as any).props.angle) * DETACH_SPEED;
            props.velY = Math.cos((props.attachedTo! as any).props.angle) * DETACH_SPEED;
            
            // Moved these lines here to ensure velocity is set *before* detaching state
            stateHelper.set<boolean>("isSwinging", false);
            props.attachedTo = undefined;
            
        } else if (stateHelper.get<boolean>("isGrounded")) {
            // Normal jump logic
            const JUMP_SPEED = 8;
            props.velY = -JUMP_SPEED;
            stateHelper.set<boolean>("isJumping", true);
        }
        stateHelper.set<boolean>("wantsToJump", false);
    }
};

export const ClimbBehavior: IPlayerBehavior = {
    name: "climb",
    order: 20, // Executed after jump but before gravity
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("onLadder"),
    onUpdate: (player:PlayerEntity) => {
        const CLIMB_SPEED = 2;
        if (player.props.velY === 0) {
            player.props.velY = 0;
        } else {
            player.props.velY = player.props.velY > 0 ? CLIMB_SPEED : -CLIMB_SPEED;
        }
        
        if (player.props.currentAnimation!.name !== "idle") {
            player.props.currentAnimation = player.props.animations["idle"];
        }
    }
};

export const JetpackBehavior: IPlayerBehavior = {
    name: "jetpack",
    order: 30, // Executed after jump and climb, overrides gravity
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("isJetpacking"),
    onUpdate: (player:PlayerEntity) => {
        const JETPACK_SPEED = 6;
        player.props.velY = -JETPACK_SPEED;
    }
};

export const GravityBehavior: IPlayerBehavior = {
    name: "gravity",
    order: 40, // The default vertical behavior
    criteria: (player:PlayerEntity) => !player.stateHelper.get<boolean>("onLadder") && !player.stateHelper.get<boolean>("isGrounded") && !player.stateHelper.get<boolean>("isSwinging") && !player.stateHelper.get<boolean>("isJetpacking"),
    onUpdate: (player:PlayerEntity) => {
        player.props.velY += player.props.gravity;
    }
};

export const GroundedBehavior: IPlayerBehavior = {
    name: "grounded",
    order: 50, // Resets vertical velocity after gravity is applied
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("isGrounded") && !player.stateHelper.get<boolean>("onLadder") && !player.stateHelper.get<boolean>("isJetpacking"),
    onUpdate: (player:PlayerEntity) => {
        player.props.velY = 0;
    }
};

export const MovementBehavior: IPlayerBehavior = {
    name: "movement",
    order: 60, // Updates position based on velocity
    criteria: (player:PlayerEntity) => !player.stateHelper.get<boolean>("isSwinging"),
    onUpdate: (player:PlayerEntity) => {
        player.props.positioned.x += player.props.velX;
        player.props.positioned.y += player.props.velY;
    }
};

export const SwingingBehavior: IPlayerBehavior = {
    name: "swinging",
    order: 70, // Overrides normal movement when swinging
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("isSwinging"),
    onUpdate: (player:PlayerEntity) => {
        const ropeEntity = player.props.attachedTo as RopeEntity;
        player.props.positioned.x = ropeEntity.endX - (player.props.positioned.width / 2);
        player.props.positioned.y = ropeEntity.endY - (player.props.positioned.height /2);
    }
};

export const UpdatePriorPositionBehavior: IPlayerBehavior = {
    name: "updatePriorPosition",
    order: 80, // Last step in the physics update
    criteria: (player:PlayerEntity) => true, // This behavior always runs
    onUpdate: (player:PlayerEntity) => {
        player.props.positioned.updatePriorPosition!();
    }
};

export const IdleBehavior: IPlayerBehavior = {
    name: "idle",
    order: 90, // Animation behavior
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("isGrounded") && player.props.velX === 0,
    onUpdate: (player:PlayerEntity) => {
        if (player.props.currentAnimation!.name !== 'idle') {
            player.props.currentAnimation = player.props.animations.idle;
            player.props.currentAnimation.currentFrameIndex = 0;
        }
    }
};

export const WalkBehavior: IPlayerBehavior = {
    name: "walk",
    order: 100, // Animation behavior
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("isGrounded") && player.props.velX !== 0,
    onUpdate: (player:PlayerEntity) => {
        if (player.props.currentAnimation!.name !== 'walk') {
            player.props.currentAnimation = player.props.animations.walk;
            player.props.currentAnimation.currentFrameIndex = 0;
        }
    }
};

export const allPlayerBehaviors = [

    IdleBehavior,
    WalkBehavior,
    JumpBehavior,
    ClimbBehavior,
    JetpackBehavior,
    GravityBehavior,
    GroundedBehavior,
    MovementBehavior,
    SwingingBehavior,
    CollisionBehavior,
    UpdatePriorPositionBehavior
].sort((a, b) => a.order - b.order);

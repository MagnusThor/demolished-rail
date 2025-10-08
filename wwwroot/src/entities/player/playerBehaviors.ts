import { IPlayerBehavior } from "../../interface/IPlayerProps";
import { Positioned } from "../../interface/IPosition2D";
import { GameState } from "../../global/GameState";
import { getSurroundingTiles, getTileXY } from "../../utils/tileEntityHelpers";
import { LevelEntityRenderer } from "../level/LevelEntityRenderer";
import { RopeEntity } from "../platform/RopeEntity";

import { normalizePlayerBoundingBox, PlayerEntity } from "./playerEntity";
import { InteractableEntity } from "../triggerzone/InteractableEntity";
import { ExtendedCollisionHelper } from "../../utils/extendedCollitionHelper";
import { BoundingBox } from "../../interface/IBoundingBox";


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
        const gameEntities = GameState.getInstance().entities;       
        const levelEntity = GameState.getInstance().findEntities("tileBlock")[0] as LevelEntityRenderer;        
        // Calculate the player's potential next position
        const nextX = props.position.x + props.velX;
        const nextY = props.position.y + props.velY
        const nextBoundingBox = {
            x: nextX,
            y: nextY,
            width: props.position.width,
            height: props.position.height
        };
        // Get surrounding tiles based on the next position
        const surroundingTiles = getSurroundingTiles(levelEntity.tileSpatialGrid,nextBoundingBox,32);
        // Check collisions with surrounding tiles
        for (const tile of surroundingTiles) {
            gameEntities.forEach(entity => {
    
                    const entityPos =  new Positioned(entity.props.position.x , entity.props.position.y,32,32);
                    const entityBBox = new BoundingBox(entityPos).worldToViewport(); // we use 32x32 as default tile size
                    const playerBBox = normalizePlayerBoundingBox(player.props);

                     if(ExtendedCollisionHelper.AABBColliding(playerBBox, entityBBox!)){

                        if(entity.uuid !== player.uuid){
                            // let of we got and interactable entity  
                            if(entity.name === "interactable"){
                                console.log("htting interactable",entity);
                                const castedEntity = entity as InteractableEntity;
                                // lets is just move it;
                                castedEntity.props.position.x += props.velX;                             
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

            if (player.props.currentAnimation!.name !== 'jump') {
            player.props.currentAnimation = player.props.animations.jump;
            player.props.currentAnimation.currentFrameIndex = 0;
                }   

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
        player.props.position.x += player.props.velX;
        player.props.position.y += player.props.velY;
    }
};

export const SwingingBehavior: IPlayerBehavior = {
    name: "swinging",
    order: 70, // Overrides normal movement when swinging
    criteria: (player:PlayerEntity) => player.stateHelper.get<boolean>("isSwinging"),
    onUpdate: (player:PlayerEntity) => {
        const ropeEntity = player.props.attachedTo as RopeEntity;
        player.props.position.x = ropeEntity.endX - (player.props.position.width / 2);
        player.props.position.y = ropeEntity.endY - (player.props.position.height /2);
    }
};

export const UpdatePriorPositionBehavior: IPlayerBehavior = {
    name: "updatePriorPosition",
    order: 80, // Last step in the physics update
    criteria: (player:PlayerEntity) => true, // This behavior always runs
    onUpdate: (player:PlayerEntity) => {
        player.props.position.updatePriorPosition!();
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

import { RopeEntity } from "../platform/RopeEntity";
import { PlayerEntity } from "./playerEntity";


/**
 * Defines a behavior for a player state.
 * The criteria function checks if the behavior should be applied.
 */
export interface IPlayerBehavior {
    name: string;
    order: number;
    criteria: (player: PlayerEntity) => boolean;
    onUpdate?: (player: PlayerEntity) => void;
}

// --- Individual Behaviors ---

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
    UpdatePriorPositionBehavior
].sort((a, b) => a.order - b.order);

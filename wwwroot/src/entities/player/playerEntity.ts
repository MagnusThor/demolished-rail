import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollidable } from "../../interface/ICollisionDetector";
import { IGameEntity } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { gameState } from "../../state/gameState";
import { runCollitionDetectors } from "../../utils/collitionHelpers";
import { getSurroundingTiles } from "../../utils/tileBlockHelpers";
import { BulletEntity } from "../bullet/BulletEntity";
import { GameEntity } from "../GameEntity";
import { TileEntity } from "../tiles/tileEntity";
import { playerCollisionDetectors } from "./collisiondetectors/playerCollitionDetectors";
import { CollisionEvent } from "./CollisionEvent";
import { setupPlayerInput } from "./playerInput";

export class PlayerEntity extends GameEntity<IPlayerProps> implements ICollidable {
    entityEvents: CollisionEvent;
    
    // Constant for jump speed to be used in the onUpdate method
    private JUMP_SPEED = 8;

    constructor(props: IPlayerProps) {
        super("playerBlock", props);
        this.collisionDetectors = playerCollisionDetectors;
        this.props.currentAnimation = this.props.animations["idle"];
        this.entityEvents = new CollisionEvent();
        setupPlayerInput(this);
        this.onInit(this);
    }

    getBoundingBox = (self: IGameEntity<IPlayerProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    }
    
    getSurroundingTilesOfPlayer(): IIndexedTile[] {
        const tileEntity = gameState.findEntities("tileBlock")[0] as unknown as TileEntity;
        
        return getSurroundingTiles(tileEntity.tileSpatialGrid,
            this.props.positioned.getBoundingBox(), tileEntity.props.tileWidth);
    }
    
    onInit = (self: IGameEntity<IPlayerProps>) => {

        self.props.isInitialized = true;

        // Subscribe to a string-based topic for the ladder collision event.
        self.entityEvents!.subscribe("onLadder", (self, results) => {
            console.log("onLadder event called", results);
        });

        self.entityEvents!.subscribe("onPlatform", (self, results) => {
            console.log("Platform hitted", results);
        });

        self.entityEvents!.subscribe("playerMove", (self, results) => {
            const velX = results.velX;
            self.props.velX = velX;
        });

        self.entityEvents!.subscribe("playerJump", (self, results) => {
            if (!self.stateHelper.get<boolean>("onLadder")) {
                self.stateHelper.set<boolean>("wantsToJump", true);
            }
        });

        self.entityEvents!.subscribe("playerClimb", (self, results) => {
            if (self.stateHelper.get<boolean>("onLadder")) {
                const velY = results.velY;
                self.props.velY = velY;
            } else {
                self.props.velY = 0;
            }
        });

        self.entityEvents!.subscribe("playerShoot", (self, results) => {
            const direction = results.direction;
            const bullet = new BulletEntity(
                this.props.positioned.x, self.props.positioned.y, direction);
            gameState.dynamicEntities.push(bullet);
          
        });
    }

    onUpdate? = (self: IGameEntity<IPlayerProps>, timeStamp: number) => {
        const props = self.props;
        const stateHelper = this.stateHelper;

        // --- 1. Reset State at the start of the frame ---
        stateHelper.set<boolean>("isGrounded", false);
        stateHelper.set<boolean>("onLadder", false);
        stateHelper.set<boolean>("onPlatform", false); 
        
        // --- 2. Run Collisions and update State ---
        runCollitionDetectors(self, self.collisionDetectors!);

        // --- 3. Handle Jump Logic (after collision check) ---
        if (stateHelper.get<boolean>("wantsToJump") && stateHelper.get<boolean>("isGrounded")) {
            props.velY = -this.JUMP_SPEED;
            stateHelper.set<boolean>("isJumping", true);
            stateHelper.set<boolean>("wantsToJump", false);
        }

        // --- 4. Apply Gravity (only when not on a ladder) ---
        if (!stateHelper.get<boolean>("onLadder") && !stateHelper.get<boolean>("isGrounded")) {
            props.velY += props.gravity;
        }

        // --- 5. Apply Movement to Player Position ---
        props.positioned.x += props.velX;
        props.positioned.y += props.velY;

        // --- 6. Animation Updates ---
        if (stateHelper.get<boolean>("onLadder")) {
             // Prioritize ladder animation if on a ladder.
            if (props.currentAnimation!.name !== "idle") {
                props.currentAnimation = props.animations["idle"];
            }
        } else if (stateHelper.get<boolean>("isGrounded") && props.velY === 0) {
            // Check for isGrounded AND vertical velocity is zero for a reliable ground state.
            stateHelper.set<boolean>("isJumping", false);
            if (props.velX !== 0) {
                if (props.currentAnimation!.name !== 'walk') {
                    props.currentAnimation = props.animations.walk;
                    props.currentAnimation.currentFrameIndex = 0;
                }
            } else {
                if (props.currentAnimation!.name !== 'idle') {
                    props.currentAnimation = props.animations.idle;
                    props.currentAnimation.currentFrameIndex = 0;
                }
            }
        } 


        // --- 7. Update Prior Position ---
        props.positioned.updatePriorPosition!();
    }

    onDraw = (self: IGameEntity<IPlayerProps>, helper: CanvasHelper) => {
        const stateHelper = this.stateHelper;
        const props = self.props;

        helper.drawAnimatedSprite(
            props.currentAnimation!,
            props.positioned.x,
            props.positioned.y,
            performance.now()
        );

        
    }
}

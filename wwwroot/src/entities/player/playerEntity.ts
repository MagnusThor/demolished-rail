import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollidable } from "../../interface/ICollisionDetector";
import { IGameEntity } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { GameState } from "../../global/GameState";
import { runCollitionDetectors } from "../../utils/collitionHelpers";
import { getSurroundingTiles } from "../../utils/tileEntityHelpers";

import { GameEntity } from "../GameEntity";
import { LevelEntityRenderer } from "../level/LevelEntityRenderer";
import { playerCollisionDetectors } from "./collisiondetectors/playerCollitionDetectors";
import { EntityEvent } from "../EntityEvent";
import { setupPlayerInput } from "./playerInput";
import { allPlayerBehaviors } from "./playerBehaviors";
import { BulletEntity } from "../bullet/BulletEntity";
import { SmokeRingEntity } from "./SmokeRingEntity";


export const normalizePlayerBoundingBox = (props: IPlayerProps): IBoundingBox => {
    const sprite = props.currentAnimation!.spriteSheet;
    return {
        x: props.position.x - sprite.renderWidth / 2,
        y: props.position.y - sprite.renderHeight, // moves from feet → top
        width: sprite.renderWidth,
        height: sprite.renderHeight,
    };
}

export class PlayerEntity extends GameEntity<IPlayerProps> implements IGameEntity<IPlayerProps> {
    entityEvents: EntityEvent;

    constructor(props: IPlayerProps) {
        super("playerBlock", props);
        this.collisionDetectors = playerCollisionDetectors;
        this.props.currentAnimation = this.props.animations["idle"];
        this.entityEvents = new EntityEvent();

        setupPlayerInput(this);
        this.onInit(this);
    }
    processCollisions?: ((self: IGameEntity<IPlayerProps>, entities: IGameEntity<any>[]) => void) | undefined;
    onCreated?: ((self: IGameEntity<IPlayerProps>) => void) | undefined;
    onDestroy?: ((self: IGameEntity<IPlayerProps>) => void) | undefined;

    getBoundingBox = (self: IGameEntity<IPlayerProps>): IBoundingBox => {

        const props = self.props;

        const sprite = props.currentAnimation!.spriteSheet;

        return {
        x: props.position.x - sprite.renderWidth / 2,
        y: props.position.y - sprite.renderHeight,
        width: sprite.renderWidth,
        height:  sprite.renderHeight,
    };
    }

    getSurroundingTilesOfPlayer(): IIndexedTile[] {
        const tileEntity = GameState.getInstance().findEntities("tileBlock")[0] as unknown as LevelEntityRenderer;
        return getSurroundingTiles(tileEntity.tileSpatialGrid,
            this.props.position.getBoundingBox(), tileEntity.props.tileWidth);
    }

    onInit = (self: IGameEntity<IPlayerProps>) => {

        self.props.isInitialized = true;
        self.props.attachedTo = undefined;
        self.props.gadgets = { jetpack: true };

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
            const velY = results.velY;
            self.props.velY = velY;
            self.stateHelper.set<boolean>("isGrounded", false);
        });

        self.entityEvents!.subscribe("playerClimb", (self, results) => {
            const velY = results.velY;
            self.props.velY = velY;
        });

        self.entityEvents!.subscribe("playerStartJetpack", (self, results) => {
            if (self.props.gadgets.jetpack) {
                self.stateHelper.set<boolean>("isJetpacking", true);

            }
        });

        self.entityEvents!.subscribe("playerStopJetpack", (self, results) => {
            self.stateHelper.set<boolean>("isJetpacking", false);
        });

        self.entityEvents!.subscribe("playerShoot", (self, results) => {
            const direction = results.direction;
            const bulletPos = this.getBoundingBox(this);
            const bullet = new BulletEntity(
                bulletPos.x , bulletPos.y  , direction);
            GameState.getInstance().entities.push(bullet);

        });
    }

    public resetState(): void {
        const stateHelper = this.stateHelper;
        stateHelper.set<boolean>("isGrounded", false);
        stateHelper.set<boolean>("onLadder", false);
        stateHelper.set<boolean>("onPlatform", false);
    }

    onUpdate? = (self: IGameEntity<IPlayerProps>, timeStamp: number) => {

        // 1. Reset states at the start of the frame

        this.resetState();

        // 2. Run collision detectors to update the state based on the current position
        runCollitionDetectors(self, self.collisionDetectors!);

        // 3. Apply behaviors based on current state
        for (const behavior of allPlayerBehaviors) {
            if (behavior.criteria(this)) {
                if (behavior.onUpdate) {
                    behavior.onUpdate(this);
                }
            }
        }

        if (this.stateHelper.get<boolean>("isJetpacking")) {
            const ring = new SmokeRingEntity(self.props.position.x+self.props.position.width / 2, self.props.position.y + self.props.position.height);

            GameState.getInstance().entities.push(ring);
        }
    }

    onDraw = (self: IGameEntity<IPlayerProps>, helper: CanvasHelper) => {
        const stateHelper = this.stateHelper;
        const props = self.props;

        const flipX =    stateHelper.get<string>("lastDirection") === "left";

        const sprite = props.currentAnimation!.spriteSheet;
         
        const drawX = props.position.x - sprite.renderWidth / 2;
        const drawY = props.position.y - sprite.renderHeight;

        // // derive draw position from bottom-center
        // const drawX = props.position.x - props.position.width / 2;
        // const drawY = props.position.y - props.position.height;

        helper.drawAnimatedSprite(
            props.currentAnimation!,
            drawX,
            drawY,
            performance.now(),
            flipX
        );
    }
}

// entities/enemyBlock.ts
import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { gameState } from "../../gameState";
import { IGameEntity } from "../../interface/IGameEntity";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IDynamicEntity } from "../../interface/IDynamicEntity";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { Positioned } from "../../interface/IPositioned";
import { IIndexedTile } from "../../utils/tileBlockHelpers";
import { IEnemyBehavior, IEnemyProps } from "../../interface/IEnemyProps";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { EnemyPatrollingBehavior } from "./behavior/EnemyPatrollingBehavior";
import { enemyCollisionDetectors } from "./enemyCollisionDetectors";
import { EnemyChasingBehavior } from "./behavior/EnemyChasingBehavior";

export const ENEMY_SPEED = 2;

export class EnemyEntity implements IDynamicEntity<IEnemyProps>  {
    constructor(startX: number,
        startY: number,
        indexedTiles: IIndexedTile[]) {      
        let assignedBehavior: IEnemyBehavior[] = [];
        
         if (Math.random() < 0.5) {
            assignedBehavior.push(EnemyPatrollingBehavior(indexedTiles));
        } else {
            assignedBehavior.push(EnemyChasingBehavior());
        }
        //assignedBehavior.push(EnemyPatrollingBehavior(indexedTiles));

        this.uuid = crypto.randomUUID();
        this.name =  `enemy-${crypto.randomUUID()}`;
        this.key = this.name;
        this.props =  {
            // The position is now set directly with world coordinates
            position: new Positioned(startX, startY, 32, 32),
            isAlive: true,
            lifeTime: -1,
            health: {
                health: 100,
                damage: 10
            },
            velX: 0,
            velY: 0,
            gravity: 0.35,
            isGrounded: false,
            // These properties are no longer used for collision logic but might be needed elsewhere.
            tileMap: [],
            tileWidth: 0,
            tileHeight: 0,
            behavior: assignedBehavior,
            direction: 1,
            isInitialized: true,
        };

        this.collisionDetectors = enemyCollisionDetectors;


    }
    uuid: string;
    name: string;
    key: string;
    props: IEnemyProps;
    collisionDetectors?: ICollisionDetector[] | undefined;
    onCreated?: ((self: IDynamicEntity<IEnemyProps>) => void) | undefined;
    onDestroy?: ((self: IDynamicEntity<IEnemyProps>) => void) | undefined;

     // THIS IS THE CORRECTED METHOD
    processCollisions? = (self: IDynamicEntity<IEnemyProps>, entities: IGameEntity<any>[]) => {
        const selfProps = self.props;
        for (const detector of self.collisionDetectors!) {
            for (const entity of entities) {
                if (entity.name === detector.targetName) {
                    const collisionResultsRaw = detector.detectorFn(selfProps, entity);
                    let collisionResults: ICollisionResult[] = [];
                    if (Array.isArray(collisionResultsRaw)) {
                        collisionResults = collisionResultsRaw;
                    } else if (collisionResultsRaw && typeof collisionResultsRaw === "object") {
                        collisionResults = [collisionResultsRaw];
                    }
                    for (const result of collisionResults) {
                        detector.onCollision(selfProps, result);
                    }
                }
            }
        }
    };



   
    
    onInit?: ((self: IGameEntity<IEnemyProps>) => void) | undefined;
    onUpdate? = (self: IGameEntity<IEnemyProps>, timeStamp: number) => {        
            const props = self.props;

            if (props.behavior && props.behavior.length > 0) {
                props.behavior[0].onUpdate!(self);
            }

            props.velY += props.gravity;
            props.position.x += props.velX;
            props.position.y += props.velY;
            props.isGrounded = false;
        
    };
    onDraw? = (self: IGameEntity<IEnemyProps>, helper: CanvasHelper) => {
        if (!gameState || !gameState.viewport) {
                console.warn("gameState or viewport not initialized, skipping enemy drawing.");
                return;
            }
            const props = self.props;
            const ctx = helper.ctx;

            ctx.fillStyle = "#DC3545";
            ctx.fillRect(
                props.position.x,
                props.position.y,
                props.position.width,
                props.position.height,
            );

            const healthBarHeight = 8;
            const healthBarWidth = props.position.width * (props.health.health / 100);
            ctx.fillStyle = "rgba(6, 78, 23, 1)";
            ctx.fillRect(
                props.position.x,
                props.position.y - healthBarHeight - 2,
                healthBarWidth,
                healthBarHeight,
            );
          
    }
   
   
   getBoundingBox? = (self: IGameEntity<IEnemyProps>):IBoundingBox => {
            return self.props.position.getBoundingBox!();
   };

}


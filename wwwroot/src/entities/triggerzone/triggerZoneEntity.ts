import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity } from "../../interface/IGameEntity";
import { ITileSettings } from "../../interface/ITileSettings";
import { GameState } from "../../global/GameState";
import { GameEntity } from "../GameEntity";
import { ITriggerZoneProps } from "./ITriggerZoneProps";
import { ExtendedCollisionHelper } from "../../utils/extendedCollitionHelper";

export class TriggerZoneEntity extends GameEntity<ITriggerZoneProps> implements IGameEntity<ITriggerZoneProps> {

    constructor(props: ITriggerZoneProps) {
        super("triggerZone", props);
    }

   getBoundingBox(self: IGameEntity<ITriggerZoneProps>): IBoundingBox {
  
    const { position } = this.props;

    const box =  {
        x: position.x!,
        y: position.y!,
        width: position.width!,
        height: position.height!
    };

    return box;
}



    onInit? = (self: IGameEntity<ITriggerZoneProps>) => {
        const stateHelper = self.stateHelper;
        stateHelper.set<number>("numOfHits", 0);
        stateHelper.set<boolean>("isTriggered", false);
    };

    onUpdate? = (self: IGameEntity<ITriggerZoneProps>, timeStamp: number) => {
        const stateHelper = self.stateHelper;
        const player = GameState.getInstance().player;
        if (!player) return;

        // Use player's bounding box to check collisions
        const playerBox: IBoundingBox = GameState.getInstance().worldToViewport(player.getBoundingBox!(player));
        const triggerBox: IBoundingBox = GameState.getInstance().worldToViewport(self.getBoundingBox!(self));

        const isCurrentlyColliding = ExtendedCollisionHelper.AABBColliding(
            triggerBox,
            playerBox
        );

        const tileSettings = self.props.settings as ITileSettings;

        const maxNumberOfHits = tileSettings?.maxNumberOfHits ?? -1;
        const currentHits = stateHelper.get<number>("numOfHits") || 0;
        const hasExceededMaxHits = maxNumberOfHits !== -1 && currentHits >= maxNumberOfHits;

        if (isCurrentlyColliding && !stateHelper.get<boolean>("isTriggered") && !hasExceededMaxHits) {

            stateHelper.set<boolean>("isTriggered", true);
            stateHelper.set<number>("numOfHits", currentHits + 1);
          
            self.props.onTrigger?.(self as TriggerZoneEntity,tileSettings);
           // tileSettings.activate?.(self as TriggerZoneEntity, player,tileSettings);

        } else if (!isCurrentlyColliding && stateHelper.get<boolean>("isTriggered")) {
            self.props.onLeave?.(self as TriggerZoneEntity,tileSettings);
            stateHelper.set<boolean>("isTriggered", false);
        }
    };

    onDraw? = (self: IGameEntity<ITriggerZoneProps>, helper: CanvasHelper) => {
        const ctx = helper.ctx;

        // this is drawn top left;
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.props.position.x!, this.props.position.y!, 3, 0, Math.PI * 2);
        ctx.fill();


        const player = GameState.getInstance().player!;

       
        // this is drawn with an offset of y 32,  
        ExtendedCollisionHelper.visualizeBBox(ctx,player.getBoundingBox!(player),
            "player", 2);



        const bbox: IBoundingBox = self.getBoundingBox!(self);

        // this is drawn at the correct possition 
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        ctx.restore();


        
        // this is drawn with an offset of y 32 , but differs from when the the obove, why?
        ExtendedCollisionHelper.visualizeBBox(ctx,bbox,
            "zone", 2);
    };
}

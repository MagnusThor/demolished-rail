import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";
import { IGameEntity } from "../interface/IGameEntity";
import { ITileSettings } from "../interface/ILevelProps";
import { GameState } from "../global/GameState";

export const tunnelEntranceCreator = (bag: any): ITileSettings => {

    return {

        x: bag.x,
        y: bag.y,
        bag: bag,
        maxNumberOfHits: Infinity,

        activate: (self: TriggerZoneEntity, player?: IGameEntity<any>) => {
            const { destinationX, destinationY } = self.props.settings!.bag;

            console.log(`Player entered a tunnel. Teleporting to (${destinationX}, ${destinationY}).`);

            // Set the tunnel effect flag to true.
            //gameState.isTunnelEffectActive = true;
            GameState.sequence!.setPostProcessorState("flashlight",true);

            // Teleport the player.
            player!.props.positioned.x = destinationX;
            player!.props.positioned.y = destinationY;
        },

        deactivate: (self: TriggerZoneEntity, player?: IGameEntity<any>) => {
            // do nothing as we are teleported 
        }

    }
};


export const tunnelExitCreator = (bag: any): ITileSettings => {

    return {
        x: bag.x,
        y: bag.y,
        bag: bag,
        maxNumberOfHits: Infinity,

        activate: (self: TriggerZoneEntity, player?: IGameEntity<any>) => {
            const { destinationX, destinationY } = self.props.settings!.bag;

            console.log(`Player exiting a tunnel. Teleporting to (${destinationX}, ${destinationY}).`);


            //gameState.isTunnelEffectActive = false;
            GameState.sequence!.setPostProcessorState("flashlight",false);


            // Teleport the player.
            player!.props.positioned.x = destinationX;
            player!.props.positioned.y = destinationY;
        },

        deactivate: (self: TriggerZoneEntity, player?: IGameEntity<any>) => {

            // do nothing as we are teleported


        }

    }
};


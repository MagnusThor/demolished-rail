

import { TextOverlayManager } from "../entities/overlaytext/TextOverlayManager";
import { ITileSettings } from "../interface/ITileSettings";


export const textCreator = (bag:any): ITileSettings => {
    return {
    maxNumberOfHits: Infinity,
    x: bag.x,
    y: bag.y,
    bag: {
        textId: "welcome_message"
    },
    activate: (self, player,settings) => {

        console.log(`Activte text overlay with ID: ${settings?.textId}`);

        TextOverlayManager.getInstance().showText(settings!);

    }, deactivate(self, player,settings) {
        const textId = settings!.textId;
        console.log(`De-activate text overlay with ID: ${textId}`);
        TextOverlayManager.getInstance().hideText();

    }
}
};

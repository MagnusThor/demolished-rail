

import { TextOverlayManager } from "../entities/overlaytext/TextOverlayManager";
import { ITileSettings } from "../interface/ILevelProps";


export const textCreatorSettings = (bag:any): ITileSettings => {
    return {
    maxNumberOfHits: Infinity,
    x: bag.x,
    y: bag.y,
    bag: {
         x: 288,
    y: 224,
        textId: "welcome_message"
    },
    activate: (self, player) => {

        const textId = self.props.settings!.bag["textId"];
        console.log(`Triggering text overlay with ID: ${textId}`);

        TextOverlayManager.getInstance().showText(textId);
    }, deactivate(self, other) {
        const textId = self.props.settings!.bag["textId"];
        console.log(`Triggering text overlay with ID: ${textId}`);
        TextOverlayManager.getInstance().hideText();

    }
}
};

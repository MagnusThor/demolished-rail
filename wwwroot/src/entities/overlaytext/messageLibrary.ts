import { ITextMessage } from "./ITextMessage";




export const messageLibrary = new Map<string, ITextMessage>;

messageLibrary.set("welcome_message", {
    text: "Welcome to the game! Look for the key to unlock the gate.",
    font: "24px Arial",
    speed: 10,
    color: "255, 255, 255"
});

messageLibrary.set("key_found_message", {
    text: "You found the key! Now, go back to the gate and unlock it.",
    font: "24px 'Press Start 2P'",
    speed: 8,
    color: "255, 255, 0"
});
messageLibrary.set("level_complete", {
    text: "Congratulations! You have completed the level.",
    font: "32px Impact",
    speed: 5,
    color: "0, 255, 0"
});

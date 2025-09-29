import { gameAssetsToPreload } from "../assets/assetsToLoad";
import { GameAssets } from "../global/GameAssets";
import { DesignerApp } from "./DesignerApp"




document.addEventListener("DOMContentLoaded", async () => {

    await GameAssets.loadImages(gameAssetsToPreload);

    const instance = new DesignerApp();
}) 
import { GameAssetsToPreload } from "../factory/assetsToLoad";
import { GameAssets } from "../global/GameAssets";
import { DesignerApp } from "./DesignerApp"




document.addEventListener("DOMContentLoaded", async () => {

    await GameAssets.loadImages(GameAssetsToPreload);

    const instance = new DesignerApp();
}) 
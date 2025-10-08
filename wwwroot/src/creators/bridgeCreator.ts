import { LevelEntityRenderer } from "../entities/level/LevelEntityRenderer";
import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";
import { ITileSettings } from "../interface/ITileSettings";
import { GameState } from "../global/GameState";




export const bridgeCreator= (bag: any): ITileSettings =>  {
    return {    
    maxNumberOfHits:1,  
  
    x: bag.x,
    y: bag.y,
    bag: bag,
    activate: (self: TriggerZoneEntity) => {
        const { bag } = self.props.settings!;
        const { direction, bridgeTileIndex, wallTileIndex } = bag;
        const { x, y } = self.props.position;


    

        console.log(`Creating a bridge to the ${direction} from (${x}, ${y})`);

        // Get a reference to the level entity and ensure it has the update method
        const levelEntity = GameState.getInstance().currentLevel as LevelEntityRenderer;
        if (!levelEntity || typeof levelEntity.updateTileAt !== 'function') {
            console.error("LevelEntity not found or updateTileAt method is missing.");
            return;
        }

        const tileMap = levelEntity.props.tileMap;
        
        if (!tileMap) {
            console.error("No tile map found to create bridge.");
            return;
        }

        const tileWidth = levelEntity.props.tileWidth;
        const tileHeight = levelEntity.props.tileHeight;

        let currentTileCol = Math.floor(x / tileWidth);
        const currentTileRow = Math.floor(y / tileHeight);

        // Loop and fill tiles until a wall is hit or the map boundary is reached
        while (true) {
            if (direction === "right") {
                currentTileCol++;
            } else if (direction === "left") {
                currentTileCol--;
            }

            // Check if we are out of bounds
            if (currentTileCol < 0 || currentTileCol >= tileMap[0].length) {
                console.log("Reached map boundary. Bridge creation stopped.");
                break;
            }

            // Get the tile at the new position from the main tile map
            const tile = tileMap[currentTileRow][currentTileCol];

            // If the tile is a wall, stop creating the bridge.
            if (tile === wallTileIndex) {
                console.log("Wall hit. Bridge creation stopped.");
                break;
            }

            // If the tile is empty (e.g., 0), place a bridge tile.
            if (tile === 0) {
                console.log(`Placing bridge tile at (${currentTileCol}, ${currentTileRow})`);
                // Use the new, centralized method to update the tile and all related data structures.
                levelEntity.updateTileAt(currentTileRow, currentTileCol, bridgeTileIndex);
            }
        }

     
    
    }
    }
};

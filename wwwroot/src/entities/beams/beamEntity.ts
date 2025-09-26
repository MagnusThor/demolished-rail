import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity, IGameEntityBase } from "../../interface/IGameEntity";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { GameEntity } from "../GameEntity";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { isSolidTile, getTileProperties } from "../../utils/tileEntityHelpers";
import { runCollitionDetectors } from "../../utils/collitionHelpers";
import { LevelEntity  } from "../level/levelEntity";
import { PlayerEntity } from "../player/playerEntity";

/**
 * Interface for the properties of a BeamEntity.
 * Includes properties for movement, color, and lifespan.
 */
export interface IBeamProps extends IGameEntityBase {
    positioned: IPositioned;
    isInitialized: boolean;
    states: { [key: string]: any };
    zIndex: number;
    // Beam-specific properties
    direction: number; // -1 for left, 1 for right
    speed: number;
    hue: number;
    // We need to track the initial position to "restart" the beam.
    initialX: number;
    initialY: number;
}

/**
 * Represents a translucent, HSL-colored beam that travels in a straight line.
 * It "dies" on impact with a wall or player, or when its lifespan expires.
 */
export class BeamEntity extends GameEntity<IBeamProps> implements IGameEntity<IBeamProps> {

    constructor(x: number, y: number, direction: number) {
        const props: IBeamProps = {
            // Position the beam as a small rectangle
            positioned: new Positioned(x, y, 40, 10),
            zIndex: 30, // High zIndex to appear on top of other elements
            isInitialized: true,
            states: {
                // This state flag will signal the game engine to spawn a new beam
                spawnNewBeam: false,
            },
            direction: direction,
            speed: 1,
            hue: 120, // Starting hue for a green color
            initialX: x,
            initialY: y - 5,
            isCollidable: true
        };
        super("beam", props);

        // Define collision detectors for this entity.
        this.collisionDetectors = [
            {
                targetName: "tileBlock",
                detectorFn: this.detectTileCollision,
                onCollision: this.handleTileCollision
            },
            {
                targetName: "playerBlock",
                detectorFn: (beam: BeamEntity, player: PlayerEntity) => {
                    const beamBBox = beam.props.positioned.getBoundingBox!();
                    const playerBBox = player.props.positioned.getBoundingBox!();
                    // Check for a collision between the beam and the player's bounding box.
                    if (CollisionHelper.AABBColliding(beamBBox, playerBBox)) {
                        return [{
                            x: playerBBox.x,
                            y: playerBBox.y,
                            width: playerBBox.width,
                            height: playerBBox.height,
                            axis: CollisionAxis.X,
                            targetEntity: player,
                        }];
                    }
                    return false;
                },
                onCollision: (beam: BeamEntity, collisionData: ICollisionResult) => {
                   // works , do op's later on;
                },
            },
        ];
    }

    /**
     * Required method to return the bounding box of the beam for collision detection.
     * @param self The current instance of the BeamEntity.
     */
    getBoundingBox = (self: IGameEntity<IBeamProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    };

    /**
     * Updates the beam's state on each game loop frame.
     * Handles movement and color changes. Collision detection is handled by the GameEngine.
     * @param self The current instance of the BeamEntity.
     */
    public onUpdate(self: IGameEntity<IBeamProps>): void {
        // Run collision detectors from within the entity for now, as requested.
        //runCollitionDetectors(self, self.collisionDetectors!);

        this.runCollitionDetectors();

        const props = self.props;

        // Move the beam horizontally based on its direction and speed
        props.positioned.x += props.speed * props.direction;

        // Change the hue of the beam over time for a cycling color effect
        props.hue = (props.hue + 5) % 360;
    }

    /**
     * Draws the beam on the canvas as a translucent, HSL-colored rectangle.
     * @param self The current instance of the BeamEntity.
     * @param helper The CanvasHelper instance for drawing operations.
     */
    public onDraw(self: IGameEntity<IBeamProps>, helper: CanvasHelper): void {
        const props = self.props;
        const ctx = helper.ctx;

        ctx.save();

        // Use HSL color with a 50% opacity for a translucent effect.
        ctx.fillStyle = `hsl(${props.hue}, 100%, 50%, 0.5)`;
        
        // Draw the beam as a filled rectangle
        ctx.fillRect(
            props.positioned.x,
            props.positioned.y,
            props.positioned.width,
            props.positioned.height
        );

        ctx.restore();
    }

    /**
     * Private collision detector function for tiles.
     * It checks for an intersection with any solid tile on the map.
     * @param beamEntity The current BeamEntity instance.
     * @param tileEntity The Level entity containing the tile map.
     * @returns An array of collision results or false if no collision.
     */
    private detectTileCollision(beamEntity: BeamEntity, tileEntity: LevelEntity ): ICollisionResult[] | false {
        const beamProps = beamEntity.props;
        const tileProps = tileEntity.props;
        const collisionResults = new Array<ICollisionResult>();
        const beamBBox = beamProps.positioned.getBoundingBox!();

        // Calculate the tile coordinates for both the current and the next potential tile
        const currentTileCol = Math.floor(beamBBox.x / tileProps.tileWidth);
        const currentTileRow = Math.floor(beamBBox.y / tileProps.tileHeight);
        
        const nextTileCol = currentTileCol + beamProps.direction;
        
        const tilesToCheck = [
            { col: currentTileCol, row: currentTileRow },
            { col: nextTileCol, row: currentTileRow }
        ];
    
        for (const tilePos of tilesToCheck) {
            
            // Ensure the tile is within the map bounds
            if (tilePos.row >= 0 && tilePos.row < tileProps.tileMap.length && tilePos.col >= 0 && tilePos.col < tileProps.tileMap[0].length) {
                const tileType = tileProps.tileMap[tilePos.row][tilePos.col];
                
                if (isSolidTile(tileType)) { 
                    // Use the helper function to get the actual tile dimensions from the type definition
                    const tileProperties = getTileProperties(tileType);
                    if (!tileProperties) continue;

                    const tileX = tilePos.col * tileProps.tileWidth;
                    const tileY = tilePos.row * tileProps.tileHeight;

                    const tileBBox: IBoundingBox = {
                        x: tileX,
                        y: tileY,
                        width: tileProperties.width,
                        height: tileProperties.height
                    }; 

                    // Check for a collision with the specific tile
                    if (CollisionHelper.AABBColliding(beamBBox, tileBBox)) {
                        collisionResults.push({
                            x: tileX, y: tileY, width: tileProps.tileWidth, height: tileProps.tileHeight, axis: CollisionAxis.X,
                            targetEntity: tileEntity,
                        });
                    }
                }
            }
        }
        return collisionResults.length > 0 ? collisionResults : false;
    }

    /**
     * Private collision handler function.
     * Resets the beam's position and sets a flag to spawn a new one.
     * @param beam The BeamEntity instance that is colliding.
     * @param collisionData The collision data.
     */
    private handleTileCollision(beam: BeamEntity, collisionData: ICollisionResult): void {
        const selfProps = beam.props;
        // "Restart" the beam by resetting its position to its origin
        selfProps.positioned.x = selfProps.initialX;
        selfProps.positioned.y = selfProps.initialY;
        
        // Signal the game engine to spawn a new beam
        selfProps.states.spawnNewBeam = true;
    }
}

        import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
        import { GameState } from "../../global/GameState";
        import { IBoundingBox } from "../../interface/IBoundingBox";
        import { IGameEntity, IGameEntityBase } from "../../interface/IGameEntity";
        import { IPosition2D } from "../../interface/IPosition2D";
        import { GameEntity } from "../GameEntity";

        export interface ILavaTileEntity extends IGameEntityBase {
            position: IPosition2D;
        }

        /**
         * Represents a Lava Tile (0x06) in a 32x32 grid.
         * Draws to both the main canvas and a glow layer for bloom effects.
         */
        export class LavaTileEntity
            extends GameEntity<ILavaTileEntity>
            implements IGameEntity<ILavaTileEntity> {

            constructor(props: ILavaTileEntity) {
                super(`lavatile-${crypto.randomUUID()}`, props);
            }

            getBoundingBox = (self: IGameEntity<ILavaTileEntity>): IBoundingBox => {
                return self.props.position.getBoundingBox!();
            };

            onCreated?: ((self: IGameEntity<ILavaTileEntity>) => void) | undefined;
            onDestroy?: ((self: IGameEntity<ILavaTileEntity>) => void) | undefined;

            public onInit(self: IGameEntity<ILavaTileEntity>) {
                // initialize animations, particles, etc later
            }

            public onUpdate(self: IGameEntity<ILavaTileEntity>, timeStamp: number) {
                // update animation states if needed
            }

            /**
             * Draws the lava tile to the canvas;
             */
            public onDraw(self: IGameEntity<ILavaTileEntity>, helper: CanvasHelper) {
                const ctx = helper.ctx;

                // === Draw main tile ===
                ctx.fillStyle = "#ff3300"; // base lava color
                ctx.fillRect(
                    self.props.position.x,
                    self.props.position.y,
                    32,
                    32
                );
            }

            public onPostDraw(self: IGameEntity<ILavaTileEntity>, helper: CanvasHelper) {
                const ctx = helper.ctx;
                const box = self.getBoundingBox!(self);

                const screenX = box.x
                const screenY = box.y;

                // Simple flickering glow
                const t = performance.now() * 0.002;
                const flicker = 0.8 + Math.sin(t * 3.1 + screenX) * 0.2;
                const radius = Math.max(box.width, box.height) * (1.5 + 0.5 * flicker);

                const gradient = ctx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, radius
                );
                gradient.addColorStop(0, `rgba(255, 100, 0, ${0.6 + 0.3 * flicker})`);
                gradient.addColorStop(1, "rgba(255, 100, 0, 0)");

                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

        }

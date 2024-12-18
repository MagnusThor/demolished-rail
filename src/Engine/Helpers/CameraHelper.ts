export type CameraState = {
    origin: [number, number, number];
    sensitivity: number;
    isMouseDown: boolean;
    lastMousePos: [number, number];
};

export const cameraState: CameraState = {
    origin: [0.0, 0.0, 1.0],
    sensitivity: 1.,
    isMouseDown: false,
    lastMousePos: [0.0, 0.0],
};

export class CameraHelper {
    keyState: Record<string, { pressed: boolean; timestamp: number }> = {};
    velocity: [number, number, number] = [0, 0, 0];


    private handleKeyDown = (evt: KeyboardEvent) => {
        if (!this.keyState[evt.key] || !this.keyState[evt.key].pressed) {
            this.keyState[evt.key] = { pressed: true, timestamp: performance.now() };
        }
    };

    constructor(public canvas: HTMLCanvasElement) {
        this.setupMouseControls(canvas);

        // Set up keyboard controls
        window.addEventListener("keydown", this.handleKeyDown);

        window.addEventListener("keyup", (evt: KeyboardEvent) => {
            if (this.keyState[evt.key]) {
                this.keyState[evt.key].pressed = false;
            }
        });
    }

    setupMouseControls(canvas: HTMLCanvasElement) {
        canvas.addEventListener("mousedown", (event: MouseEvent) => {          
            if (document.fullscreenElement === canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.updateCameraOrigin(x, y);
                cameraState.isMouseDown = true;
            }
        });

        canvas.addEventListener("mouseup", () => {
            cameraState.isMouseDown = false;
        });

        canvas.addEventListener("mousemove", (event: MouseEvent) => {
            if (cameraState.isMouseDown) {
                const rect = canvas.getBoundingClientRect(); // Get canvas rect here
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.updateCameraOrigin(x, y);
            }
        });

        canvas.addEventListener("wheel", (event: WheelEvent) => {
            if (document.fullscreenElement === canvas) {
                event.preventDefault(); // Prevent default scrolling behavior
                const zoomSpeed = 0.1; // Adjust this value for faster/slower zoom
                const zoomDelta = Math.sign(event.deltaY) * zoomSpeed; 

                cameraState.origin[2] += zoomDelta; 
                cameraState.origin[2] = Math.max(1.0, cameraState.origin[2]); // Clamp zoom level

             
            }
        });
    }

    updateCameraOrigin(x: number, y: number) {
        const sensitivity = cameraState.sensitivity;
        const [lastX, lastY] = cameraState.lastMousePos;
        const dx = (x - lastX) * sensitivity;
        const dy = (y - lastY) * sensitivity;

        cameraState.origin[0] += dx; // Update X
        cameraState.origin[1] -= dy; // Update Y (invert for natural movement)
        cameraState.lastMousePos = [x, y];
      
    }



    updateCameraMovement() {

     

        if (document.fullscreenElement === this.canvas) {
            const baseSpeed = 0.01;
            const maxSpeed = .1;
            const acceleration = 0.002;
            const deceleration = 0.098; // Smooth deceleration multiplier

            let dx = 0, dy = 0, dz = 0;

            for (const [key, state] of Object.entries(this.keyState)) {
                if (state.pressed) {
                    const elapsed = performance.now() - state.timestamp;
                    const speed = Math.min(baseSpeed + acceleration * elapsed, maxSpeed);

                    switch (key) {
                        case "w": dz = -speed; break;
                        case "s": dz = speed; break;
                        case "a": dx = -speed; break;
                        case "d": dx = speed; break;
                        case "q": dy = -speed; break;
                        case "e": dy = speed; break;
                    }
                }
            }

            // Apply velocity and smooth deceleration
            this.velocity[0] = this.velocity[0] * deceleration + dx;
            this.velocity[1] = this.velocity[1] * deceleration + dy;
            this.velocity[2] = this.velocity[2] * deceleration + dz;

            // Update camera origin
            cameraState.origin[0] += this.velocity[0] ;
            cameraState.origin[1] += this.velocity[1] ;
            cameraState.origin[2] += this.velocity[2] ;

            // console.log(`Keyboard move: dx=${dx}, dy=${dy}, dz=${dz}`);
            // console.log(`New origin: ${cameraState.origin}`);

        }
    }

    cleanup() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    updateAndGetCameraState(): CameraState {
        this.updateCameraMovement();
        return cameraState;
    }
}

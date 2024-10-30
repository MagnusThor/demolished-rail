import { Sequence } from "../sequence";

export class DebugHelper {
    private divElement: HTMLDivElement;
    private startTime: number; // Add startTime to track elapsed time

    /**
     * Creates a new DebugHelper to display debug information on the screen.
     * @param sequence - The Sequence instance to get timing and beat information from.
     * @param startScene - The optional scene number to start the debug display from.
     */
    constructor(private sequence: Sequence, private startScene: number = 0) {
        this.divElement = document.createElement("div");
        this.divElement.style.position = "fixed";
        this.divElement.style.top = "10px";
        this.divElement.style.left = "10px";
        this.divElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.divElement.style.color = "white";
        this.divElement.style.padding = "5px";
        this.divElement.style.fontFamily = "monospace";
        this.divElement.style.zIndex = "1000";
        document.body.appendChild(this.divElement);

        this.startTime = performance.now(); // Initialize startTime
    }

    /**
     * Updates the debug display with the current time, scene, beat, and bar information.
     */
    update() {
        const elapsedTimeMs = performance.now() - this.startTime; // Calculate elapsed time
        const elapsedTimeSec = (elapsedTimeMs / 1000).toFixed(2);
        const currentSceneName = this.sequence.currentScene?.name || "None";
        const currentBeat = this.sequence.currentBeat;
        const currentBar = this.sequence.currentBar;
        const beatCounter = this.sequence.beatCounter;

        if (this.sequence.currentSceneIndex >= this.startScene) {
            this.divElement.textContent = `
        Elapsed Time: ${elapsedTimeMs.toFixed(0)}ms (${elapsedTimeSec}s)
        Scene: ${currentSceneName}
        Beat: ${currentBeat} (${beatCounter})
        Bar: ${currentBar}
      `;
        } else {
            this.divElement.textContent = "";
        }
    }

    addControls() {
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.bottom = "10px";
        container.style.left = "10px";
        container.style.zIndex
            = "1000";
        document.body.appendChild(container);

        // Create the slider
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = this.sequence.durationMs.toString();
        slider.value = "0";
        slider.style.width = "400px";
        container.appendChild(slider);

        // Create the play/pause button
        const playPauseButton = document.createElement("button");
        playPauseButton.textContent = "Pause";
        container.appendChild(playPauseButton);

        // Event listeners for slider and button
        slider.addEventListener("input", () => {
            const time = parseInt(slider.value, 10);
            this.sequence.pause(); // Pause the regular animation loop
            this.sequence.renderAtTime(time); // Render the scene at the specified time
        });

        playPauseButton.addEventListener("click", () => {
            if (this.sequence.isPlaying) {
                this.sequence.pause();
           
                playPauseButton.textContent = "Play";
            } else {
                this.sequence.play();
                playPauseButton.textContent = "Pause";
            }
        });
    }
}
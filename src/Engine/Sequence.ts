
import { Conductor } from "./conductor";
import { Entity } from "./entity";
import { AssetsHelper } from "./Helpers/assetsHelper";
import { Scene } from "./scene";
import { ShaderEntity } from "./shaderEntity";


export class Sequence {

    public conductor?: Conductor
    public durationMs: number = 0;
    public scenes: Scene[] = [];
    public currentSceneIndex: number = 0;
    public isPlaying: boolean = false;
    public requestAnimationFrameID!: number;
    private startTime: number = 0;
    public currentTime: number = 0;

    public bpm: number = 0;
    public ticksPerBeat: number = 0;
    public lastBeatTime: number = 0;
    public currentTick: number = 0;
    public currentBar: number = 0;
    public tickCounter: number = 0;
    public beatCounter: number = 0;
    public beatsPerBar: number = 0;
    public currentBeat: number = 0;

    private previousBeat = 0; // Store the previous beat value
    private previousTick = 0; // Store the previous tick value
    private previousBar = 0;  // Store the previous bar value

    private beatListeners: ((scene: number, time: number, count: number) => void)[] = [];
    private tickListeners: ((scene: number, time: number, count: number) => void)[] = [];
    private barListeners: ((bar: number) => void)[] = [];
    private frameListeners: ((scene: number, time: number) => void)[] = [];


    private audioContext!: AudioContext;
    private audioBuffer!: AudioBuffer;
    private audioSource!: AudioBufferSourceNode;
    private analyser!: AnalyserNode;
    public fftData!: Uint8Array;

    public targetCtx!: CanvasRenderingContext2D | null;

    private postProcessors: ((ctx: CanvasRenderingContext2D, sequence: Sequence) => void)[] = [];

    /**
     * Adds a post-processing function to the sequence.
     * @param processor - The post-processing function to add.
     */
    addPostProcessor(processor: (ctx: CanvasRenderingContext2D, sequence: Sequence) => void) {
        this.postProcessors.push(processor);
    }

    /**
     * Gets the remaining time in the current scene.
     * @param timeStamp - The current timestamp in the animation.
     * @returns The remaining time in milliseconds.
     */
    getSceneRemainingTime(timeStamp: number): number {
        if (!this.currentScene) {
            return 0;
        }
        const elapsedTime = timeStamp - this.currentScene.startTimeinMs;
        return Math.max(0, this.currentScene.durationInMs - elapsedTime);
    }

    /**
     * Creates a new Sequence.
     * @param target - The canvas element to render the animation on.
     * @param bpm - The beats per minute for the animation.
     * @param ticksPerBeat - The number of ticks per beat.
     * @param beatsPerBar - The number of beats per bar.
     * @param scenes - An array of scenes to include in the sequence.
     * @param audioFile - An optional URL to an audio file to synchronize the animation with.
     */
    constructor(
        public target: HTMLCanvasElement,
        bpm: number = 120,
        ticksPerBeat: number = 4,
        beatsPerBar: number = 4,
        scenes: Scene[],
        audioFile?: string
    ) {

        this.scenes = scenes || [];
        this.targetCtx = target.getContext("2d");
        this.bpm = bpm;
        this.ticksPerBeat = ticksPerBeat;
        this.beatsPerBar = beatsPerBar;

        if (audioFile) {
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            AssetsHelper.loadAudio(audioFile, this.audioContext)
                .then(audioBuffer => {
                    this.audioBuffer = audioBuffer;
                    this.onReady();
                })
                .catch(error => console.error("Error loading audio:", error));
        } else {
            this.onReady();
        }

        this.recalculateDuration();
    }

    /**
     * Loads the audio file and initializes the audio context and analyser.
     * @param audioFile - The URL of the audio file to load.
     */
    private loadAudio(audioFile: string) {


        fetch(audioFile)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.audioBuffer = audioBuffer;

                this.onReady();
            })
            .catch(error => console.error("Error loading audio:", error));
    }

    /**
     * Called when the audio file is loaded or when no audio is used.
     */
    onReady() { }


    /**
     * Adds an event listener for each frame.
     * @param listener - The function to call on each frame.
     */
    onFrame(listener: (scene: number, time: number) => void) {
        this.frameListeners.push(listener);
    }

    /**
     * Adds an event listener for when a bar is complete.
     * @param listener - The function to call when a bar is complete.
     */
    onBar(listener: (bar: number) => void) {
        this.barListeners.push(listener);
    }

    /**
     * Adds an event listener for when a beat occurs.
     * @param listener - The function to call when a beat occurs.
     */
    onBeat(listener: (scene: number, ts: number) => void) {
        this.beatListeners.push(listener);
    }

    /**
     * Adds an event listener for when a tick occurs.
     * @param listener - The function to call when a tick occurs.
     */
    onTick(listener: (scene: number, ts: number) => void) {
        this.tickListeners.push(listener);
    }

    /**
     * Adds a scene to the sequence.
     * @param scene - The scene to add.
     */
    addScene(scene: Scene): void {
        if (!scene.width && scene.height) {
            scene.width = this.target.width;
            scene.height = this.target.height;
        }
        this.scenes.push(scene);
        this.recalculateDuration();
    }

    /**
     * Adds multiple scenes to the sequence.
     * @param scenes - The scenes to add.
     * @returns The Sequence instance for chaining.
     */
    addScenes(...scenes: Scene[]): Sequence {
        this.scenes.push(...scenes);
        this.recalculateDuration();
        return this;
    }

    /**
    * Adds multiple scenes to the sequence.
    * @param scenes - The scenes to add.
    * @returns The Sequence instance for chaining.
    */
    addSceneArray(scenes: Scene[]): Sequence {
        this.scenes.push(...scenes);
        this.recalculateDuration();
        return this;
    }


    /**
     * Removes a scene from the sequence.
     * @param scene - The scene to remove.
     */
    removeScene(scene: Scene): void {
        this.scenes = this.scenes.filter((s) => s !== scene);
        this.recalculateDuration();
    }

    /**
     * Recalculates the total duration of the sequence.
     */
    private recalculateDuration() {
        this.durationMs = 0;
        if (this.scenes.length > 0) {
            this.durationMs = Math.max(...this.scenes.map((scene) => {
                return scene.startTimeinMs + scene.durationInMs;
            }));
        }
    }


    /**
     * Render a specific time
     *
     * @param {number} time
     * @memberof Sequence
     */
    renderAtTime(time: number) {
        this.currentTime = time; // Update the currentTime
        // Find the active scene for the given time
        const currentSceneIndex = this.scenes.findIndex(scene =>
            time >= scene.startTimeinMs && time < scene.startTimeinMs + scene.durationInMs
        );
        if (currentSceneIndex !== -1) {
            this.currentSceneIndex = currentSceneIndex;
            const elapsedTime = time - this.currentScene!.startTimeinMs;

            // Render the scene
            this.currentScene!.play(elapsedTime);

            // Update and draw entities
            this.targetCtx?.clearRect(0, 0, this.target.width, this.target.height);
            this.currentScene!.entities.forEach(entity => {
                entity.update(time);
                if (this.target) {
                    entity.copyToCanvas(this.target, this);
                }
            });

            // Apply post-processing
            if (this.targetCtx) {
                this.postProcessors.forEach(processor => processor(this.targetCtx!, this));
            }

            this.triggerEventsForTime(time);

        }
    }

    /**
 * Triggers beat, tick, and bar listeners for a given time.
 * @param time - The time in milliseconds.
 */
    private triggerEventsForTime(time: number) {
        const beatIntervalMs = 60000 / this.bpm;
        const tickIntervalMs = beatIntervalMs / this.ticksPerBeat;

        // Calculate beat, tick, and bar values for the given time
        const beat = Math.floor(time / beatIntervalMs) + 1;
        const tick = Math.floor((time % beatIntervalMs) / tickIntervalMs);
        const bar = Math.floor(beat / this.beatsPerBar) + 1;

        // Trigger listeners if the values have changed
        if (beat !== this.currentBeat) {
            this.currentBeat = beat;
            this.beatListeners.forEach(listener => listener(this.currentSceneIndex, time, this.beatCounter));
            this.beatCounter++;
        }

        if (tick !== this.currentTick) {
            this.currentTick = tick;
            this.tickListeners.forEach(listener => listener(this.currentSceneIndex, time, this.tickCounter));
            this.tickCounter++;
        }

        if (bar !== this.currentBar) {
            this.currentBar = bar;
            this.barListeners.forEach(listener => listener(this.currentBar));
        }

        // Trigger frame listeners
        this.frameListeners.forEach(listener => listener(this.currentSceneIndex, time));
    }

    /**
     * Starts the animation sequence.
     */
    play(): void {
        this.isPlaying = true;
        this.currentSceneIndex = 0;
        this.lastBeatTime = 0;
        this.currentTick = 0;
        this.currentBeat = 0; // Initialize currentBeat to 0
        this.startTime = performance.now();

        if (this.audioBuffer) {
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.analyser);

            this.analyser.connect(this.audioContext.destination);
            this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
            this.audioSource.start();
        }

        const animate = (ts: number) => {
            const adjustedTimeStamp = ts - this.startTime;
            this.playCurrentScene(adjustedTimeStamp);

            if (this.isPlaying) {
                this.requestAnimationFrameID = requestAnimationFrame(animate);
            }
        }
        this.requestAnimationFrameID = requestAnimationFrame(animate);
    }

    /**
     * Pauses  
   the animation sequence.
     */
    pause(): void {
        this.isPlaying = false;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }

    /**
     * Stops the animation sequence.
     */
    stop(): void {
        this.isPlaying = false;
        this.currentSceneIndex = 0;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }

    /**
     * Gets the current scene being played.
     * @returns The current Scene or undefined if no scene is active.
     */
    get currentScene(): Scene | undefined {
        return this.scenes[this.currentSceneIndex];
    }

    /**
  * Animates the current scene and handles scene transitions,
  * audio analysis, and beat/tick events.
  * @param timeStamp - The adjusted timestamp for the current frame.
  */
    private playCurrentScene(timeStamp: number): void {
        if (!this.isPlaying) {
            return;
        }

        this.currentTime = timeStamp; // Update currentTime

        // Determine the current scene based on timeStamp
        let currentSceneIndex = this.scenes.findIndex(scene =>
            timeStamp >= scene.startTimeinMs && timeStamp < scene.startTimeinMs + scene.durationInMs
        );

        // If no current scene is found, check for upcoming scenes
        if (currentSceneIndex === -1) {
            currentSceneIndex = this.scenes.findIndex(scene => timeStamp < scene.startTimeinMs);
            if (currentSceneIndex === -1) {  // No upcoming scene, end animation
                this.isPlaying = false;
                return;
            } else { // Wait for the upcoming scene
                return;
            }
        }

        // If the scene has changed, update currentSceneIndex and play the new scene
        if (this.currentSceneIndex !== currentSceneIndex) {
            this.currentSceneIndex = currentSceneIndex;
            const elapsedTime = timeStamp - this.currentScene!.startTimeinMs;

            // Set scene dimensions if not already set
            if (!this.currentScene!.width) {
                this.currentScene!.width = this.target.width;
            }
            if (!this.currentScene!.height) {
                this.currentScene!.height = this.target.height;
            }
            this.currentScene!.play(elapsedTime).then(() => {
                // Scene transition completed
            });
        }
        // FFT analysis (if analyser is available)
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.fftData);
        }



        // Clear the target canvas and update/draw entities
        this.targetCtx?.clearRect(0, 0, this.target.width, this.target.height);
        this
            .currentScene!.entities.forEach(entity => {


                // Update the conductor's time and trigger events
                this.conductor?.updateTime(timeStamp);
                this.conductor?.triggerEvents(this);

                entity.update(timeStamp);
                if (this.target) {
                    entity.copyToCanvas(this.target, this);
                }




                // Trigger entity events only when the values change
                if (this.currentBeat !== this.previousBeat) {
                    entity.beatListeners!.forEach(listener => listener(timeStamp, this.beatCounter, entity.props));
                    this.previousBeat = this.currentBeat;
                }

                if (this.currentTick !== this.previousTick) {
                    entity.tickListeners!.forEach(listener => listener(timeStamp, this.tickCounter, entity.props));
                    this.previousTick = this.currentTick;
                }

                if (this.currentBar !== this.previousBar) {
                    entity.barListeners!.forEach(listener => listener(timeStamp, this.currentBar, entity.props));
                    this.previousBar = this.currentBar;
                }

            });

        // Apply post-processing effects
        if (this.targetCtx) {
            this.postProcessors.forEach(processor => processor(this.targetCtx!, this));
        }

        this.handleBeatAndTickEvents(timeStamp); // Handle beat and tick events

        // Trigger frame listeners
        this.frameListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));

    }

    /**
     * Handles beat and tick events based on the current timestamp.
     * @param timeStamp - The adjusted timestamp for the current frame.
     */
    private handleBeatAndTickEvents(timeStamp: number) {
        const beatIntervalMs = 60000 / this.bpm;
        const tickIntervalMs = beatIntervalMs / this.ticksPerBeat;

        if (timeStamp - this.lastBeatTime >= beatIntervalMs) {
            this.lastBeatTime = timeStamp;
            this.beatListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp, this.beatCounter));
            this.currentTick = 0;
            this.currentBeat++;
            this.beatCounter++;

            if (this.currentBeat > this.beatsPerBar) {
                this.currentBar++;
                this.currentBeat = 1;
                this.barListeners.forEach(listener => listener(this.currentBar));
            }
        }

        if (timeStamp - this.lastBeatTime >= this.currentTick * tickIntervalMs) {
            this.tickListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp, this.tickCounter));
            this.currentTick++;
            this.tickCounter++;
        }
       }

}
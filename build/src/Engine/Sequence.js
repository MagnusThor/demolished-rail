"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequence = void 0;
const assetsHelper_1 = require("./Helpers/assetsHelper");
class Sequence {
    /**
     * Adds a post-processing function to the sequence.
     * @param processor - The post-processing function to add.
     */
    addPostProcessor(processor) {
        this.postProcessors.push(processor);
    }
    /**
     * Gets the remaining time in the current scene.
     * @param timeStamp - The current timestamp in the animation.
     * @returns The remaining time in milliseconds.
     */
    getSceneRemainingTime(timeStamp) {
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
    constructor(target, bpm = 120, ticksPerBeat = 4, beatsPerBar = 4, scenes, audioFile) {
        this.target = target;
        this.durationMs = 0;
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.isPlaying = false;
        this.startTime = 0;
        this.currentTime = 0;
        this.bpm = 0;
        this.ticksPerBeat = 0;
        this.lastBeatTime = 0;
        this.currentTick = 0;
        this.currentBar = 0;
        this.tickCounter = 0;
        this.beatCounter = 0;
        this.beatsPerBar = 0;
        this.currentBeat = 0;
        this.previousBeat = 0; // Store the previous beat value
        this.previousTick = 0; // Store the previous tick value
        this.previousBar = 0; // Store the previous bar value
        this.beatListeners = [];
        this.tickListeners = [];
        this.barListeners = [];
        this.postProcessors = [];
        this.scenes = scenes || [];
        this.targetCtx = target.getContext("2d");
        this.bpm = bpm;
        this.ticksPerBeat = ticksPerBeat;
        this.beatsPerBar = beatsPerBar;
        if (audioFile) {
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            assetsHelper_1.AssetsHelper.loadAudio(audioFile, this.audioContext)
                .then(audioBuffer => {
                this.audioBuffer = audioBuffer;
                this.onReady();
            })
                .catch(error => console.error("Error loading audio:", error));
        }
        else {
            this.onReady();
        }
        this.recalculateDuration();
    }
    /**
     * Loads the audio file and initializes the audio context and analyser.
     * @param audioFile - The URL of the audio file to load.
     */
    loadAudio(audioFile) {
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
     * Adds an event listener for when a bar is complete.
     * @param listener - The function to call when a bar is complete.
     */
    onBar(listener) {
        this.barListeners.push(listener);
    }
    /**
     * Adds an event listener for when a beat occurs.
     * @param listener - The function to call when a beat occurs.
     */
    onBeat(listener) {
        this.beatListeners.push(listener);
    }
    /**
     * Adds an event listener for when a tick occurs.
     * @param listener - The function to call when a tick occurs.
     */
    onTick(listener) {
        this.tickListeners.push(listener);
    }
    /**
     * Adds a scene to the sequence.
     * @param scene - The scene to add.
     */
    addScene(scene) {
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
    addScenes(...scenes) {
        this.scenes.push(...scenes);
        this.recalculateDuration();
        return this;
    }
    /**
    * Adds multiple scenes to the sequence.
    * @param scenes - The scenes to add.
    * @returns The Sequence instance for chaining.
    */
    addSceneArray(scenes) {
        this.scenes.push(...scenes);
        this.recalculateDuration();
        return this;
    }
    /**
     * Removes a scene from the sequence.
     * @param scene - The scene to remove.
     */
    removeScene(scene) {
        this.scenes = this.scenes.filter((s) => s !== scene);
        this.recalculateDuration();
    }
    /**
     * Recalculates the total duration of the sequence.
     */
    recalculateDuration() {
        this.durationMs = 0;
        if (this.scenes.length > 0) {
            this.durationMs = Math.max(...this.scenes.map((scene) => {
                return scene.startTimeinMs + scene.durationInMs;
            }));
        }
    }
    /**
     * Starts the animation sequence.
     */
    play() {
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
        const animate = (ts) => {
            const adjustedTimeStamp = ts - this.startTime;
            this.playCurrentScene(adjustedTimeStamp);
            if (this.isPlaying) {
                this.requestAnimationFrameID = requestAnimationFrame(animate);
            }
        };
        this.requestAnimationFrameID = requestAnimationFrame(animate);
    }
    /**
     * Pauses
   the animation sequence.
     */
    pause() {
        this.isPlaying = false;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }
    /**
     * Stops the animation sequence.
     */
    stop() {
        this.isPlaying = false;
        this.currentSceneIndex = 0;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }
    /**
     * Gets the current scene being played.
     * @returns The current Scene or undefined if no scene is active.
     */
    get currentScene() {
        return this.scenes[this.currentSceneIndex];
    }
    /**
  * Animates the current scene and handles scene transitions,
  * audio analysis, and beat/tick events.
  * @param timeStamp - The adjusted timestamp for the current frame.
  */
    playCurrentScene(timeStamp) {
        var _a;
        if (!this.isPlaying) {
            return;
        }
        this.currentTime = timeStamp; // Update currentTime
        // Determine the current scene based on timeStamp
        let currentSceneIndex = this.scenes.findIndex(scene => timeStamp >= scene.startTimeinMs && timeStamp < scene.startTimeinMs + scene.durationInMs);
        // If no current scene is found, check for upcoming scenes
        if (currentSceneIndex === -1) {
            currentSceneIndex = this.scenes.findIndex(scene => timeStamp < scene.startTimeinMs);
            if (currentSceneIndex === -1) { // No upcoming scene, end animation
                this.isPlaying = false;
                return;
            }
            else { // Wait for the upcoming scene
                return;
            }
        }
        // If the scene has changed, update currentSceneIndex and play the new scene
        if (this.currentSceneIndex !== currentSceneIndex) {
            this.currentSceneIndex = currentSceneIndex;
            const elapsedTime = timeStamp - this.currentScene.startTimeinMs;
            // Set scene dimensions if not already set
            if (!this.currentScene.width) {
                this.currentScene.width = this.target.width;
            }
            if (!this.currentScene.height) {
                this.currentScene.height = this.target.height;
            }
            this.currentScene.play(elapsedTime).then(() => {
                // Scene transition completed
            });
        }
        // FFT analysis (if analyser is available)
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.fftData);
        }
        // Clear the target canvas and update/draw entities
        (_a = this.targetCtx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.target.width, this.target.height);
        this.currentScene.entities.forEach(entity => {
            entity.update(timeStamp);
            if (this.target) {
                entity.copyToCanvas(this.target, this);
            }
            // Trigger entity events only when the values change
            if (this.currentBeat !== this.previousBeat) {
                entity.beatListeners.forEach(listener => listener(timeStamp, this.beatCounter, entity.props));
                this.previousBeat = this.currentBeat;
            }
            if (this.currentTick !== this.previousTick) {
                entity.tickListeners.forEach(listener => listener(timeStamp, this.tickCounter, entity.props));
                this.previousTick = this.currentTick;
            }
            if (this.currentBar !== this.previousBar) {
                entity.barListeners.forEach(listener => listener(timeStamp, this.currentBar, entity.props));
                this.previousBar = this.currentBar;
            }
        });
        // Apply post-processing effects
        if (this.targetCtx) {
            this.postProcessors.forEach(processor => processor(this.targetCtx, this));
        }
        this.handleBeatAndTickEvents(timeStamp); // Handle beat and tick events
    }
    /**
     * Handles beat and tick events based on the current timestamp.
     * @param timeStamp - The adjusted timestamp for the current frame.
     */
    handleBeatAndTickEvents(timeStamp) {
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
exports.Sequence = Sequence;

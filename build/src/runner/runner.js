"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequence = void 0;
class Sequence {
    constructor(bpm = 120, ticksPerBeat = 4, beatsPerBar = 4, scenes, audioFile) {
        this.bpm = 0;
        this.ticksPerBeat = 0;
        this.lastBeatTime = 0;
        this.currentTick = 0;
        this.beatsPerBar = 0;
        this.currentBeat = 0;
        this.beatListeners = [];
        this.tickListeners = [];
        this.barListeners = [];
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.isPlaying = false;
        this.durationMs = 0;
        this.scenes = scenes || [];
        this.bpm = bpm;
        this.ticksPerBeat = ticksPerBeat;
        this.beatsPerBar = beatsPerBar;
        if (audioFile) {
            this.loadAudio(audioFile);
        }
        this.durationMs = 0;
        if (this.scenes.length > 0) {
            this.durationMs = Math.max(...this.scenes.map((scene) => {
                return scene.startTimeinMs + scene.durationInMs;
            }));
        }
    }
    loadAudio(audioFile) {
        this.audioContext = new AudioContext();
        fetch(audioFile)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
            this.audioBuffer = audioBuffer;
        })
            .catch(error => console.error("Error loading audio:", error));
    }
    // Add event listener for bars
    onBar(listener) {
        this.barListeners.push(listener);
    }
    onBeat(listener) {
        this.beatListeners.push(listener);
    }
    onTick(listener) {
        this.tickListeners.push(listener);
    }
    addScene(scene) {
        this.scenes.push(scene);
        this.recalculateDuration();
    }
    removeScene(scene) {
        this.scenes = this.scenes.filter((s) => s !== scene);
        this.recalculateDuration();
    }
    recalculateDuration() {
        this.durationMs = 0;
        if (this.scenes.length > 0) {
            this.durationMs = Math.max(...this.scenes.map((scene) => {
                return scene.startTimeinMs + scene.durationInMs;
            }));
        }
    }
    play() {
        this.isPlaying = true;
        this.currentSceneIndex = 0;
        this.lastBeatTime = 0;
        this.currentTick = 0;
        // Start audio playback
        if (this.audioBuffer) {
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.audioContext.destination);
            this.audioSource.start();
        }
        const animate = (ts) => {
            // Call playCurrentScene even if there is no current scene
            this.playCurrentScene(ts);
            if (this.isPlaying) {
                this.requestAnimationFrameID = requestAnimationFrame(animate);
            }
        };
        this.requestAnimationFrameID = requestAnimationFrame(animate);
    }
    pause() {
        this.isPlaying = false;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }
    stop() {
        this.isPlaying = false;
        this.currentSceneIndex = 0;
        cancelAnimationFrame(this.requestAnimationFrameID);
    }
    get currentScene() {
        return this.scenes[this.currentSceneIndex];
    }
    playCurrentScene(timeStamp) {
        if (!this.isPlaying) {
            return;
        }
        // Determine the current scene based on timeStamp
        let currentSceneIndex = this.scenes.findIndex(scene => timeStamp >= scene.startTimeinMs &&
            timeStamp < scene.startTimeinMs + scene.durationInMs);
        // If no scene is found for the current time, check if there's an upcoming scene
        if (currentSceneIndex === -1) {
            currentSceneIndex = this.scenes.findIndex(scene => timeStamp < scene.startTimeinMs);
            if (currentSceneIndex === -1) { // No upcoming scene, animation finished
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
            let elapsedTime = timeStamp - this.currentScene.startTimeinMs;
            this.currentScene.play(elapsedTime).then(() => {
                // You might want to add an event here for when a scene ends
            });
        }
        // BPM and event handling
        const beatIntervalMs = 60000 / this.bpm;
        const tickIntervalMs = beatIntervalMs / this.ticksPerBeat;
        if (timeStamp - this.lastBeatTime >= beatIntervalMs) {
            this.lastBeatTime = timeStamp;
            this.beatListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));
            this.currentTick = 0;
            // Bar event handling
            this.currentBeat++;
            if (this.currentBeat > this.beatsPerBar) {
                this.currentBeat = 1; // Reset to 1 after a bar is complete
                this.barListeners.forEach(listener => listener());
            }
        }
        if (timeStamp - this.lastBeatTime >= this.currentTick * tickIntervalMs) {
            this.tickListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));
            this.currentTick++;
        }
    }
}
exports.Sequence = Sequence;

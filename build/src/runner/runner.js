"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequence = void 0;
const SequencerBase_1 = require("./SequencerBase");
class Sequence extends SequencerBase_1.SequencerBase {
    onReady() {
    }
    constructor(bpm = 120, ticksPerBeat = 4, beatsPerBar = 4, scenes, audioFile) {
        super(scenes);
        this.bpm = 0;
        this.ticksPerBeat = 0;
        this.lastBeatTime = 0;
        this.currentTick = 0;
        this.currentBar = 0;
        this.beatsPerBar = 0;
        this.currentBeat = 0;
        this.beatListeners = [];
        this.tickListeners = [];
        this.barListeners = [];
        this.bpm = bpm;
        this.ticksPerBeat = ticksPerBeat;
        this.beatsPerBar = beatsPerBar;
        if (audioFile) {
            this.loadAudio(audioFile);
        }
        else {
            this.onReady();
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
        this.analyser = this.audioContext.createAnalyser(); // Create analyser node
        fetch(audioFile)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
            this.audioBuffer = audioBuffer;
            this.onReady();
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
            // Create a NEW AudioBufferSourceNode each time
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
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
        // FFT analysis
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.fftData);
            const avgFrequency = this.fftData.reduce((sum, val) => sum + val, 0) / this.fftData.length;
            // console.log("Average frequency:", avgFrequency);
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
                this.currentBar++;
                this.currentBeat = 1; // Reset to 1 after a bar is complete
                this.barListeners.forEach(listener => listener(this.currentBar));
            }
        }
        if (timeStamp - this.lastBeatTime >= this.currentTick * tickIntervalMs) {
            this.tickListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));
            this.currentTick++;
        }
    }
}
exports.Sequence = Sequence;

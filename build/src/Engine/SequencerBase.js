"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencerBase = void 0;
class SequencerBase {
    constructor(scenes) {
        this.durationMs = 0;
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.isPlaying = false;
        this.scenes = scenes || [];
    }
}
exports.SequencerBase = SequencerBase;

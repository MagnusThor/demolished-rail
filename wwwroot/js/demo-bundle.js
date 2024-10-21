/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./build/src/runner/Entity.js":
/*!************************************!*\
  !*** ./build/src/runner/Entity.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Entity = void 0;\nclass Entity {\n    constructor(key, props) {\n        this.key = key;\n    }\n    draw(timeStamp) {\n        // This will do draw operation on a Canvas2D or a WebGL2 Canvas\n    }\n}\nexports.Entity = Entity;\n\n\n//# sourceURL=webpack://demolished-rail/./build/src/runner/Entity.js?");

/***/ }),

/***/ "./build/src/runner/Scene.js":
/*!***********************************!*\
  !*** ./build/src/runner/Scene.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Scene = void 0;\nclass Scene {\n    constructor(name, startTimeinMs, durationInMs) {\n        this.name = name;\n        this.startTimeinMs = startTimeinMs;\n        this.durationInMs = durationInMs;\n        this.entities = [];\n    }\n    addEntity(entity) {\n        this.entities.push(entity);\n    }\n    getEntity(key) {\n        return this.entities.find(pre => pre.key === key);\n    }\n    play(elapsedTime) {\n        return new Promise((resolve) => {\n            const startTime = performance.now();\n            const animate = () => {\n                const currentTime = performance.now();\n                const sceneElapsedTime = currentTime - startTime + elapsedTime;\n                const adjustedSceneElapsedTime = sceneElapsedTime - this.startTimeinMs;\n                if (adjustedSceneElapsedTime >= 0) {\n                    this.entities.forEach((entity) => {\n                        entity.draw(adjustedSceneElapsedTime);\n                    });\n                }\n                if (sceneElapsedTime < this.durationInMs + this.startTimeinMs) {\n                    requestAnimationFrame(animate); // Keep this animation loop\n                }\n                else {\n                    resolve(true);\n                }\n            };\n            requestAnimationFrame(animate);\n        });\n    }\n}\nexports.Scene = Scene;\n\n\n//# sourceURL=webpack://demolished-rail/./build/src/runner/Scene.js?");

/***/ }),

/***/ "./build/src/runner/SequencerBase.js":
/*!*******************************************!*\
  !*** ./build/src/runner/SequencerBase.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.SequencerBase = void 0;\nclass SequencerBase {\n    constructor(scenes) {\n        this.durationMs = 0;\n        this.scenes = [];\n        this.currentSceneIndex = 0;\n        this.isPlaying = false;\n        this.scenes = scenes || [];\n    }\n}\nexports.SequencerBase = SequencerBase;\n\n\n//# sourceURL=webpack://demolished-rail/./build/src/runner/SequencerBase.js?");

/***/ }),

/***/ "./build/src/runner/runner.js":
/*!************************************!*\
  !*** ./build/src/runner/runner.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Sequence = void 0;\nconst SequencerBase_1 = __webpack_require__(/*! ./SequencerBase */ \"./build/src/runner/SequencerBase.js\");\nclass Sequence extends SequencerBase_1.SequencerBase {\n    onReady() {\n    }\n    constructor(bpm = 120, ticksPerBeat = 4, beatsPerBar = 4, scenes, audioFile) {\n        super(scenes);\n        this.bpm = 0;\n        this.ticksPerBeat = 0;\n        this.lastBeatTime = 0;\n        this.currentTick = 0;\n        this.currentBar = 0;\n        this.beatsPerBar = 0;\n        this.currentBeat = 0;\n        this.beatListeners = [];\n        this.tickListeners = [];\n        this.barListeners = [];\n        this.bpm = bpm;\n        this.ticksPerBeat = ticksPerBeat;\n        this.beatsPerBar = beatsPerBar;\n        if (audioFile) {\n            this.loadAudio(audioFile);\n        }\n        else {\n            this.onReady();\n        }\n        this.durationMs = 0;\n        if (this.scenes.length > 0) {\n            this.durationMs = Math.max(...this.scenes.map((scene) => {\n                return scene.startTimeinMs + scene.durationInMs;\n            }));\n        }\n    }\n    loadAudio(audioFile) {\n        this.audioContext = new AudioContext();\n        this.analyser = this.audioContext.createAnalyser(); // Create analyser node\n        fetch(audioFile)\n            .then(response => response.arrayBuffer())\n            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))\n            .then(audioBuffer => {\n            this.audioBuffer = audioBuffer;\n            this.onReady();\n        })\n            .catch(error => console.error(\"Error loading audio:\", error));\n    }\n    // Add event listener for bars\n    onBar(listener) {\n        this.barListeners.push(listener);\n    }\n    onBeat(listener) {\n        this.beatListeners.push(listener);\n    }\n    onTick(listener) {\n        this.tickListeners.push(listener);\n    }\n    addScene(scene) {\n        this.scenes.push(scene);\n        this.recalculateDuration();\n    }\n    removeScene(scene) {\n        this.scenes = this.scenes.filter((s) => s !== scene);\n        this.recalculateDuration();\n    }\n    recalculateDuration() {\n        this.durationMs = 0;\n        if (this.scenes.length > 0) {\n            this.durationMs = Math.max(...this.scenes.map((scene) => {\n                return scene.startTimeinMs + scene.durationInMs;\n            }));\n        }\n    }\n    play() {\n        this.isPlaying = true;\n        this.currentSceneIndex = 0;\n        this.lastBeatTime = 0;\n        this.currentTick = 0;\n        // Start audio playback\n        if (this.audioBuffer) {\n            // Create a NEW AudioBufferSourceNode each time\n            this.audioSource = this.audioContext.createBufferSource();\n            this.audioSource.buffer = this.audioBuffer;\n            this.audioSource.connect(this.analyser);\n            this.analyser.connect(this.audioContext.destination);\n            this.fftData = new Uint8Array(this.analyser.frequencyBinCount);\n            this.audioSource.start();\n        }\n        const animate = (ts) => {\n            // Call playCurrentScene even if there is no current scene\n            this.playCurrentScene(ts);\n            if (this.isPlaying) {\n                this.requestAnimationFrameID = requestAnimationFrame(animate);\n            }\n        };\n        this.requestAnimationFrameID = requestAnimationFrame(animate);\n    }\n    pause() {\n        this.isPlaying = false;\n        cancelAnimationFrame(this.requestAnimationFrameID);\n    }\n    stop() {\n        this.isPlaying = false;\n        this.currentSceneIndex = 0;\n        cancelAnimationFrame(this.requestAnimationFrameID);\n    }\n    get currentScene() {\n        return this.scenes[this.currentSceneIndex];\n    }\n    playCurrentScene(timeStamp) {\n        if (!this.isPlaying) {\n            return;\n        }\n        // Determine the current scene based on timeStamp\n        let currentSceneIndex = this.scenes.findIndex(scene => timeStamp >= scene.startTimeinMs &&\n            timeStamp < scene.startTimeinMs + scene.durationInMs);\n        // If no scene is found for the current time, check if there's an upcoming scene\n        if (currentSceneIndex === -1) {\n            currentSceneIndex = this.scenes.findIndex(scene => timeStamp < scene.startTimeinMs);\n            if (currentSceneIndex === -1) { // No upcoming scene, animation finished\n                this.isPlaying = false;\n                return;\n            }\n            else { // Wait for the upcoming scene\n                return;\n            }\n        }\n        // If the scene has changed, update currentSceneIndex and play the new scene\n        if (this.currentSceneIndex !== currentSceneIndex) {\n            this.currentSceneIndex = currentSceneIndex;\n            let elapsedTime = timeStamp - this.currentScene.startTimeinMs;\n            this.currentScene.play(elapsedTime).then(() => {\n                // You might want to add an event here for when a scene ends\n            });\n        }\n        // FFT analysis\n        if (this.analyser) {\n            this.analyser.getByteFrequencyData(this.fftData);\n            const avgFrequency = this.fftData.reduce((sum, val) => sum + val, 0) / this.fftData.length;\n            // console.log(\"Average frequency:\", avgFrequency);\n        }\n        // BPM and event handling\n        const beatIntervalMs = 60000 / this.bpm;\n        const tickIntervalMs = beatIntervalMs / this.ticksPerBeat;\n        if (timeStamp - this.lastBeatTime >= beatIntervalMs) {\n            this.lastBeatTime = timeStamp;\n            this.beatListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));\n            this.currentTick = 0;\n            // Bar event handling\n            this.currentBeat++;\n            if (this.currentBeat > this.beatsPerBar) {\n                this.currentBar++;\n                this.currentBeat = 1; // Reset to 1 after a bar is complete\n                this.barListeners.forEach(listener => listener(this.currentBar));\n            }\n        }\n        if (timeStamp - this.lastBeatTime >= this.currentTick * tickIntervalMs) {\n            this.tickListeners.forEach(listener => listener(this.currentSceneIndex, timeStamp));\n            this.currentTick++;\n        }\n    }\n}\nexports.Sequence = Sequence;\n\n\n//# sourceURL=webpack://demolished-rail/./build/src/runner/runner.js?");

/***/ }),

/***/ "./build/wwwroot/src/demo.js":
/*!***********************************!*\
  !*** ./build/wwwroot/src/demo.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst runner_1 = __webpack_require__(/*! ../../src/runner/runner */ \"./build/src/runner/runner.js\");\nconst Scene_1 = __webpack_require__(/*! ../../src/runner/Scene */ \"./build/src/runner/Scene.js\");\nconst Entity_1 = __webpack_require__(/*! ../../src/runner/Entity */ \"./build/src/runner/Entity.js\");\n// Mock Entities\nconst uniforms = new Map();\nuniforms.set(\"a\", 1);\nuniforms.set(\"b\", 2);\nuniforms.set(\"c\", 3);\nconst entity1 = new Entity_1.Entity(\"Shader 1\", uniforms);\nconst entity2 = new Entity_1.Entity(\"Shader 2\");\nconst entity3 = new Entity_1.Entity(\"Shader 3\");\n// Mock Scenes\nconst scene1 = new Scene_1.Scene(\"Scene 1\", 0, 5000); // Starts at 0ms, duration 10000ms (10 second)\nscene1.addEntity(entity1);\nconst scene2 = new Scene_1.Scene(\"Scene 2\", 5000, 15000); // Starts at 1000ms, duration 5000ms\nscene2.addEntity(entity2);\nscene2.addEntity(entity3);\n// Create a Sequence\nconst sequence = new runner_1.Sequence(125, 4, 4, [scene1, scene2], \"/wwwroot/assets/music.mp3\");\nsequence.onBeat((scene, ts) => {\n    console.log(`Beat! ${scene}:${ts}`);\n});\nsequence.onTick((scene, ts) => {\n    console.log(`Tick! ${scene}:${ts}`);\n});\nsequence.onBar((bar) => {\n    console.log(`Bar! ${bar} `);\n});\n// Show Sequence properties\nconsole.log(`Total duration ${sequence.durationMs}`);\n// Start the animation\nconsole.log(`Await ready`);\nsequence.onReady = () => {\n    console.log(`Click to start..`);\n    document.addEventListener(\"click\", () => {\n        sequence.play();\n    });\n};\n\n\n//# sourceURL=webpack://demolished-rail/./build/wwwroot/src/demo.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./build/wwwroot/src/demo.js");
/******/ 	
/******/ })()
;
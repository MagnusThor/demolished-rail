
# demolished-rail

  This repository contains a TypeScript animation framework called **demolished-rail**, designed for creating complex and dynamic animations with ease. The framework provides a structured approach to building animations using scenes, entities, and a sequence controller. It also includes features like BPM synchronization, beat and tick events, and audio analysis (FFT) to create interactive and audio-reactive visualizations.
  

## Features

* **Scene-based animation:** Organize animations into scenes with defined start times and durations.
* **Entity management:** Create and manage individual animatable entities within scenes.
    * **Canvas-based entities:** Draw animations using the HTML5 Canvas API.
    * **Shader-based entities:** Leverage WebGL shaders for high-performance graphics.
        * **Multi-pass rendering:** Supports 1-n shader programs/buffers for complex effects.
        * **Texture support:** Use 1-n textures within each shader program.
        * **Custom uniforms:** Pass custom data to your shaders for dynamic control.
    * **Entity timing:** Control the lifetime of entities within a scene using `startTimeinMs` and `durationInMs` properties.
    * **Entity event listeners:** Attach event listeners directly to entities to trigger actions on beats, ticks, or bars.
* **Sequence control:** Orchestrate the playback of scenes in a sequence.
* **BPM synchronization:** Synchronize animations with beats per minute (BPM).
* **Beat and tick events:** Trigger events on beats and ticks for precise timing control.
* **Audio analysis (FFT):** Analyze audio frequencies to create audio-reactive visualizations.
* **Asset loading:** Helper functions for loading images, audio, and managing a texture cache.
* **Transitions:** Define transition effects for entities to create smooth entrances and exits.
    * **Easy customization:** Create custom transition functions to achieve a wide range of effects (e.g., fading, scaling, sliding).
    * **Helper functions:** Use `createFadeInTransition` and `createFadeOutTransition` to easily add fade effects.
* **Post-processing:** Apply visual effects to the entire scene or individual entities.
    * **Sequence-level post-processing:** Add post-processing effects to the `Sequence` to affect the final output.
    * **Entity-level post-processing:** Add post-processing effects to individual entities for customized visual enhancements.
    * **Helper functions:**  Use built-in post-processing functions like `createBlurPostProcessor`, `createGrayscalePostProcessor`, and `createInvertPostProcessor`.
    * **Beat-synced effects:** Create post-processing effects that respond to the beat, such as the `createBeatShakePostProcessor`.
* **Scene Builder:**  Use the `SceneBuilder` class to easily create scenes with automatically calculated start times based on their durations.
* **Entity Builder:** Use the `EntityBuilder` class to easily arrange entities within a scene with precise timing control.
* **Sequence Helper:** Use the `SequenceHelper` class to calculate durations based on beats, bars, or ticks, given a specific BPM and time signature.
* **Compressor:** Compress your animation and JavaScript code into a single, self-contained PNG image using the integrated `Compressor` class.
* **Demoscene Production Helpers:**
    *   `SetupDemo` class: Provides a structured way to set up and run your demoscene productions.
    *   `CompressDemo` class:  Simplifies the process of compressing assets and bundling your demo into a single executable file.
* **Conductor:**  Use the `Conductor` class to create a timeline of events that trigger actions on entities based on time, beats, bars, or custom conditions.
* **Effects and Helpers:**
    *   Variety of built-in effects (e.g., `typeWriterEffect`, `randomSquareEffect`, `expandingCircleEffect`, `strobeEffect`, `parallaxLayerEffect`, `creditsScrollerEffect`, `audioVisualizerEffect`, etc.).
    *   Helper functions for common tasks (e.g., `createFadeInTransition`, `createFadeOutTransition`, `createBlurPostProcessor`, etc.).


## Installation
 

    npm  install demolished-rail


## Usage

  
(See  the  repository  for  detailed  examples  and  documentation)
  

## Contributing

  
Contributions  are  welcome!  Feel  free  to  open  issues  or  submit  pull  requests.

  
 
 
  
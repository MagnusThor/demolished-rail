You're absolutely correct! It seems I'm having some trouble keeping the code blocks together in Markdown. I apologize for the inconvenience. 

I'll provide the complete README file content in one single Markdown code block, so you can easily copy and paste it:

```markdown
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
* **Sequence control:** Orchestrate the playback of scenes in a sequence.
* **BPM synchronization:** Synchronize animations with beats per minute (BPM).
* **Beat and tick events:** Trigger events on beats and ticks for precise timing control.
* **Audio analysis (FFT):** Analyze audio frequencies to create audio-reactive visualizations.
* **Asset loading:** Helper functions for loading images and managing a texture cache.
* **Transitions:** Define transition effects for entities to create smooth entrances and exits.
    * **Easy customization:** Create custom transition functions to achieve a wide range of effects (e.g., fading, scaling, sliding).
    * **Helper functions:** Use `createFadeInTransition` and `createFadeOutTransition` to easily add fade effects.

## Installation

```bash
npm install demolished-rail
```

## Usage

1.  **Create a `SetupDemo` class:**

    *   Extend the provided `SetupDemo` class.
    *   Load assets using `addAsset()`.
    *   Create and add scenes using `addScene()`.
    *   Create and add entities to scenes using `addEntity()`.
    *   Add event listeners to the sequence (optional).

2.  **Start the animation:**

    *   Call `sequence.play()` to start the animation.

## Example

```typescript
// Import necessary classes and effects
import { Sequence } from "demolished-rail/Engine/Sequence";
import { Scene } from "demolished-rail/Engine/Scene";
import { Entity } from "demolished-rail/Engine/Entity";
import { ShaderEntity } from "demolished-rail/Engine/ShaderEntity";
// ... import effects ...
import { TextureCacheHelper } from "demolished-rail/Engine/Helpers/AssetsHelper";

class MyDemo extends SetupDemo { // Extend the SetupDemo class
  constructor() {
    super(); // Call the super constructor

    // Load assets
    this.addAsset("assets/images/silhouette.png")
      .then(() => { 
        // Create entities and scenes here (after assets are loaded)
        const scene1 = this.createScene1(); 
        this.addScene(scene1);

        const scene2 = this.createScene2();
        this.addScene(scene2);

        // ... create and add other scenes ...
      });
  }

  private createScene1(): Scene {
    const scene1 = new Scene("Scene 1", 0, 5000);

    const imageOverlayEntity = new Entity<IImageOverlayEffectProps>(
      "ImageOverlay",
      this.MockedGraph.canvasWidth,
      this.MockedGraph.canvasHeight,
      {
        // ... image overlay properties ...
      },
      (ts, ctx, props) => imageOverlayEffect(ts, ctx, props, this.sequence)
    );
    scene1.addEntity(imageOverlayEntity);

    // ... add other entities to scene1 ...

    return scene1;
  }

  // ... other methods to create scenes and entities ...
}

new MyDemo(); // Create an instance of your demo class
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

[Specify your license - e.g., MIT License]
```

I've made sure that the entire content is within a single Markdown code block. This should make it easier to copy and use directly in your README.md file.
§

# demolished-rail

  

This repository contains a TypeScript animation framework called **demolished-rail**, designed for creating complex and dynamic animations with ease. The framework provides a structured approach to building animations using scenes, entities, and a sequence controller. It also includes features like BPM synchronization, beat and tick events, and audio analysis (FFT) to create interactive and audio-reactive visualizations.

 
## Features
 

*  **Scene-based animation:** Organize animations into scenes with defined start times and durations.

*  **Entity management:** Create and manage individual animatable entities within scenes.

*  **Canvas-based entities:** Draw animations using the HTML5 Canvas API.

*  **Shader-based entities:** Leverage WebGL shaders or WebGPU shaders for high-performance graphics.

*  **WebGL support:** Create entities with WebGL shaders using `GLSLShaderEntity` and `GLSLShaderRenderer`.

*  **WGSL support:** Create entities with WGSL shaders for modern, safe, and portable graphics.

*  **Multi-pass rendering:** Supports 1-n shader programs/buffers for complex effects.

*  **Texture support:** Use 1-n textures within each shader program.

*  **Custom uniforms:** Pass custom data to your shaders for dynamic control.

*  **Entity timing:** Control the lifetime of entities within a scene using `startTimeinMs` and `durationInMs` properties.

*  **Entity event listeners:** Attach event listeners directly to entities to trigger actions on beats, ticks, or bars.

*  **Sequence control:** Orchestrate the playback of scenes in a sequence.

*  **BPM synchronization:** Synchronize animations with beats per minute (BPM).

*  **Beat and tick events:** Trigger events on beats and ticks for precise timing control.

*  **Audio analysis (FFT):** Analyze audio frequencies to create audio-reactive visualizations.

*  **Asset loading:** Helper functions for loading images, audio, and managing a texture cache.

*  **Transitions:** Define transition effects for entities to create smooth entrances and exits.

*  **Easy customization:** Create custom transition functions to achieve a wide range of effects (e.g., fading, scaling, sliding).

*  **Helper functions:** Use `createFadeInTransition` and `createFadeOutTransition` to easily add fade effects.

*  **Post-processing:** Apply visual effects to the entire scene or individual entities.

*  **Sequence-level post-processing:** Add post-processing effects to the `Sequence` to affect the final output.

*  **Entity-level post-processing:** Add post-processing effects to individual entities for customized visual enhancements.

*  **Helper functions:** Use built-in post-processing functions like `createBlurPostProcessor`, `createGrayscalePostProcessor`, and `createInvertPostProcessor`.

*  **Beat-synced effects:** Create post-processing effects that respond to the beat, such as the `createBeatShakePostProcessor`.

*  **Scene Builder:** Use the `SceneBuilder` class to easily create scenes with automatically calculated start times based on their durations.

*  **Entity Builder:** Use the `EntityBuilder` class to easily arrange entities within a scene with precise timing control.

*  **Sequence Helper:** Use the `SequenceHelper` class to calculate durations based on beats, bars, or ticks, given a specific BPM and time signature.

*  **Compressor:** Compress your animation and JavaScript code into a single, self-contained PNG image using the integrated `Compressor` class.

*  **Conductor:** Use the `Conductor` class to create a timeline of events that trigger actions on entities based on time, beats, bars, or custom conditions.

*  **Effects and Helpers for common tasks:**

*  **EntityRenderer:** A helper class to render and test individual entities or combinations of entities without needing a full `Sequence`.

  
## Installation
  


     npm  install demolished-rail

  
 
## Usage


### Create a Sequence with scene and entities

**1. Create a Sequence**:

Create an instance of the Sequence class, providing the target canvas, BPM, time signature, audio loader, and an optional array of scenes.
Initialize the sequence using the initialize() method. This will load the audio and prepare the sequence for playback.

**2. Create Scene objects:**

Create instances of the Scene class, defining the name, start time, and duration of each scene.
Add entities to each scene using the addEntity() or addEntities() methods.

**3. Add scenes to the Sequence:**

Use the addScene() or addScenes() methods of the Sequence to add your scenes to the animation sequence.


**4. Start the animation:**

Call the play() method on the Sequence instance to start the animation.

**Example code**
 
```typescript
     import { Scene, Sequence, DefaultAudioLoader, Entity } from 'demolished-rail';
      // ... import other classes and effects ...
      
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const audioLoader = new DefaultAudioLoader('/path/to/your/audio.mp3'); // Use DefaultAudioLoader
    const sequence = new Sequence(canvas, 120, 4, 4, audioLoader);
    
    await sequence.initialize();
    
    const scene1 = new Scene("Scene 1", 0, 10000);
    
    // Example entity (replace with your actual entities)
    const myEntity = new Entity(
      "MyEntity",
      { 
        // ... entity properties ...
      },
      (ts, ctx, props) => {
        // ... entity action ...
      }
    );
    scene1.addEntity(myEntity);
    
    // ... create and add other scenes and entities ...
    
    sequence.addScenes(scene1 /*, ... other scenes */);
    
    sequence.play();

```

### Creating a Canvas2D Entity in Demolished-rail

Demolished-rail provides a flexible way to create and animate entities using the HTML5 Canvas API. Here's how to set up a Canvas2D entity in your production:

**1. Define Entity Properties**

*   Create an interface or type to define the properties of your entity. This will typically include properties for position, size, color, and any other attributes you want to control.

**2. Create the Entity**

*   Create a new `Entity` instance, passing the entity name, properties, and an action function.
*   The action function will be called on each frame, allowing you to draw and animate the entity using the Canvas 2D rendering context (`ctx`).

**Example Code**
```typescript
	import { Entity } from 'demolished-rail';
    
    // Define entity properties
    interface ICircleProps {
      x: number;
      y: number;
      radius: number;
      color: string;
    }
    
    // Create the entity
    const circleEntity = new Entity<ICircleProps>(
      "MyCircle",
      {
        x: 100,
        y: 100,
        radius: 50,
        color: 'red'
      },
      (ts, ctx, props) => {
        // Draw a circle on the canvas
        ctx.beginPath();
        ctx.arc(props.x, props.y, props.radius, 0, 2 * Math.PI);
        ctx.fillStyle = props.color;
        ctx.fill();
      }
    );
    
    // Add the entity to a scene
    someScene.addEntity(circleEntity);
```

### Creating a WebGL Shader Entity in Demolished-Rail

Demolished-rail also supports WebGL, allowing you to create shader entities using GLSL (OpenGL Shading Language). Here's how to set up a WebGL shader entity in your production:
**1. Shader Properties**

* Define an object of type `IGLSLShaderProperties` to configure the shader entity. This object includes:
    * `mainVertexShader`: The main vertex shader code (as a string).
    * `mainFragmentShader`: The main fragment shader code (as a string).
    * `renderBuffers`: An array of render buffer configurations, each with:
        * `name`: The name of the buffer.
        * `vertex`: The vertex shader code for the buffer.
        * `fragment`: The fragment shader code for the buffer.
        * `textures`: An array of texture names or URLs used by the buffer.
        * `customUniforms`: An object defining any custom uniforms that need to be passed to the buffer's shaders.

**2. Create the Shader Entity**

* Create a new `GLSLShaderEntity` instance, passing the entity name, shader properties, an optional action function, and dimensions.
* The action function will be called on each frame, allowing you to update uniforms or perform other actions.

**Example Code**
   
```typescript
    import { 
      DefaultAudioLoader,
      Entity,
      GLSLShaderEntity,
      IEntity,
      Scene,
      Sequence,
      SequenceHelper,
    } from 'demolished-rail';
    import { earthShader } from '../assets/shaders/earthShader';
    import { mainFragment } from '../assets/shaders/mainFragment';
    import { mainVertex } from '../assets/shaders/mainVertex';
    
    // ... (inside your demo setup) ...
    
    const cameraPositions = [
      [0.0, 1.2, 0.7],
      [0.5, 1.0, 0.9],
      // ... more camera positions
    ];
    let cameraPos = cameraPositions[0];
    let amountOfLightning = 1500.0;
    
    const shader = new GLSLShaderEntity<IEarthShader>(
      "earthShader",
      {
        cameraPos: cameraPositions[0],
        amountOfLightning: 1500,
        mainFragmentShader: mainFragment,
        mainVertexShader: mainVertex,
        renderBuffers: [
          {
            name: "a_buffer",
            fragment: earthShader,
            vertex: mainVertex,
            textures: [],
            customUniforms: {
              "amountOfLightning": (uniformLocation, gl, program, time, entity) => {
                gl.uniform1f(uniformLocation, entity.props!.amountOfLightning);
              },
              "cameraPos": (uniformLocation, gl, program, time, entity) => {
                gl.uniform3fv(uniformLocation, entity.props!.cameraPos);
              }
            }
          }
        ]
      },
      (ts, render, propertybag) => {
        // ... your additional logic for the shader entity ...
      },
      800, // Canvas width
      450  // Canvas height
    );
    
    shader.onBar<IEarthShader>((ts, count, propertyBag) => {
      const positionIndex = count % cameraPositions.length;
      propertyBag!.cameraPos = cameraPositions[positionIndex];
    });
    
    shader.onTick<IEarthShader>((ts, count, propertyBag) => {
      // ... update amountOfLightning based on audio ...
    });
    
    // Add the entity to a scene
    someScene.addEntity(shader);

```


### Building a WebGPU Shader Entity in Demolished-Rail

Demolished-rail now includes support for WebGPU, allowing you to create high-performance shader entities using the WGSL (WebGPU Shading Language). Here's a breakdown of how to set up a WebGPU shader entity in your production:

**1. Initialization**

*   Create a new canvas element for the shader entity.
*   Initialize the WebGPU context and device using the `initWebGPU()` function.
*   Load any required textures using the `WGSLTextureLoader`.

**2. Shader Properties**

*   Define an object of type `IWGSLShaderProperties` to configure the shader entity. This object includes:
    *   `canvas`: The canvas element.
    *   `device`: The WebGPU device.
    *   `context`: The WebGPU canvas context.
    *   `shader`: The main shader (usually the `defaultMainShader`).
    *   `renderBuffers`: An array of render buffer configurations, each with:
        *   `name`: The name of the buffer.
        *   `shader`: A `Material` object containing the WGSL vertex and fragment shader code.
        *   `geometry`: A `Geometry` object defining the geometry to be rendered.
        *   `textures`: An array of `IWgslTextureData` objects representing the textures to be used.

**3. Create the Shader Entity**

*   Create a new `WGSLShaderEntity` instance, passing the entity name, shader properties, and an optional action function.
*   The action function will be called on each frame, allowing you to update uniforms or perform other actions.

**Example Code**

```typescript
    import {
      defaultMainShader,
      Geometry,
      IWGSLShaderProperties,
      Material,
      WGSLShaderEntity,
      WGSLTextureLoader,
      WGSLTextureType,
    } from 'demolished-rail';
    import { rectGeometry } from 'demolished-rail/Engine/ShaderRenderers/WebGPU/Geometry';
    import { initWebGPU } from 'demolished-rail/Engine/ShaderRenderers/WebGPU/WGSLShaderRenderer';
    import { wgslFlamesShader } from '../assets/shaders/wglsl/wgslFlamesShader';
    
    // ... (inside your demo setup) ...
    
    const wgslCanvas = document.createElement("canvas");
    wgslCanvas.width = 800; // Set your desired width
    wgslCanvas.height = 450; // Set your desired height
    
    const webgpu = await initWebGPU(wgslCanvas);
    
    const wsglTextures = await WGSLTextureLoader.loadAll(webgpu.device, {
      key: "NOISE-TEXTURE",
      source: "assets/images/noise.png",
      type: WGSLTextureType.IMAGE,
    });
    
    const wgslShaderProps: IWGSLShaderProperties = {
      canvas: wgslCanvas,
      device: webgpu.device,
      context: webgpu.context!,
      shader: defaultMainShader,
      renderBuffers: [
        {
          name: "buffer-01",
          shader: new Material(webgpu.device, wgslFlamesShader),
          geometry: new Geometry(webgpu.device, rectGeometry),
          textures: wsglTextures
        }
      ]
    };
    
    const wgslShaderEntity = new WGSLShaderEntity(
      "wgsl-shader",
      wgslShaderProps,
      (ts: number, wgslRenderer: WGSLShaderRenderer, props: IWGSLShaderProperties) => {
        // Perform operations, like modifying uniforms, per frame
      }
    );
    
    // Add the entity to a scene
    someScene.addEntity(wgslShaderEntity)

```


## Contributing  

Contributions  are  welcome!  Feel  free  to  open  issues  or  submit  pull  requests.

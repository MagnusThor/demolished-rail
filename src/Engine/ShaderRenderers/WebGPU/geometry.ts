export enum VERTEXType {
    xyz = 3,
    xyzw = 4,
    xyzrgba = 7,
    xyzwrgba = 8
  }
  
  export interface IGeometry {
    verticesType: VERTEXType;
    vertices: Float32Array;
    indicies: Uint16Array;
    uvs?: Uint16Array;
    normals?: Uint16Array;
  }
  
  export const DefaultIndicies = new Uint16Array([0, 1, 2, 3, 4, 5]);
  
  export class Geometry {
    vertexBuffer: GPUBuffer;
    numOfVerticles: number;
    indexBuffer: GPUBuffer;
  
    /**
     * Creates a new Geometry object.
     * @param device - The GPUDevice to use for creating buffers.
     * @param model - The geometry data, including vertices, indices, and vertex type.
     */
    constructor(public device: GPUDevice, public model: IGeometry) {
      this.vertexBuffer = this.createBuffer(
        model.vertices,
        GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        model.verticesType
      );
      this.indexBuffer = this.createBuffer(model.indicies, GPUBufferUsage.INDEX, 3);
      this.numOfVerticles = model.vertices.length / model.verticesType;
    }
  
    /**
     * Creates a GPUBuffer with the given data and usage flags.
     * @param arr - The data to store in the buffer.
     * @param usage - The usage flags for the buffer.
     * @param vertexSize - The size of each vertex in bytes.
     * @returns The created GPUBuffer.
     */
    private createBuffer(arr: Float32Array | Uint16Array, usage: number, vertexSize: number): GPUBuffer {
      const desc = {
        size: (arr.byteLength + vertexSize) & ~vertexSize,
        usage,
        mappedAtCreation: true
      };
  
      const buffer = this.device.createBuffer(desc);
      const writeArray = arr instanceof Uint16Array
        ? new Uint16Array(buffer.getMappedRange())
        : new Float32Array(buffer.getMappedRange());
      writeArray.set(arr);
      buffer.unmap();
      return buffer;
    }
  
    /**
     * Creates a vertex buffer layout for the geometry.
     * @param shaderLocation - The location of the vertex attribute in the shader.
     * @returns The GPUVertexBufferLayout object.
     */
    vertexBufferLayout(shaderLocation: number): GPUVertexBufferLayout {
      return {
        attributes: [{
          shaderLocation: shaderLocation,
          offset: 0,
          format: 'float32x2' // This might need to be adjusted based on your shader
        }],
        arrayStride: 4 * this.model.verticesType,
        stepMode: 'vertex'
      };
    }
  }
  
  // Default rectangle geometry
  export const rectGeometry: IGeometry = {
    verticesType: VERTEXType.xyz,
    vertices: new Float32Array([
      -1, 1, 0,
      -1, -1, 0,
      1, -1, 0,
      1, 1, 0,
      -1, 1, 0,
      1, -1, 0,
    ]),
    indicies: DefaultIndicies, // Use the DefaultIndicies constant
  };
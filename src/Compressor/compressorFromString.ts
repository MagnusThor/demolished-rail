import { CompressorBase } from "./compressorBase";

export class CompressString extends CompressorBase {
  /**
   * Compresses a string and embeds it into a PNG image.
   * @param src - The string to compress.
   * @param preHTML - Optional HTML content to prepend to the decompressor script.
   * @param customScript - Optional custom JavaScript code to execute after decompression.
   * @returns A Promise that resolves to a Buffer containing the compressed PNG image.
   */
  static Pngify(src: string, preHTML?: string, customScript?: string): Promise<Buffer> {
    return this.Compress(Buffer.from(src), preHTML, customScript); // Directly call Compress with the string buffer
  }
}
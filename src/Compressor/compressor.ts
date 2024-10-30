import * as fs from 'fs';
import * as path from 'path';
import { CompressorBase } from './compressorBase';

export class Compressor extends CompressorBase {

  /**
   * Renames properties in a JavaScript file based on a mapping.
   * @param src - The path to the source JavaScript file.
   * @param dest - The path to the destination JavaScript file.
   * @param map - The path to a JSON file containing the property mapping.
   * @returns A Promise that resolves to true if the operation was successful.
   */
  static Mjolnir(src: string, dest: string, map: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const mapPath = path.join(process.cwd(), map);
      const srcPath = path.join(process.cwd(), src);
      const destPath = path.join(process.cwd(), dest);

      fs.readFile(mapPath, (err, hash) => {
        if (err) {
          return reject(err);
        }

        const mapping = JSON.parse(hash.toString());

        fs.readFile(srcPath, (err, payload) => {
          if (err) {
            return reject(err);
          }

          let source = payload.toString();
          for (const key in mapping) {
            const originalName = `.${mapping[key]}`;
            const newName = `.${key}`;
            if (source.includes(originalName + '(')) { // Check for method calls
              console.log("Mjolnir replacing", originalName + " with " + newName);
              source = source.split(originalName + '(').join(newName + '(');
            }
          }

          fs.writeFile(destPath, source, err => {
            if (err) {
              return reject(err);
            }

            const originalSize = payload.length;
            const newSize = source.length;
            const sizeDifference = originalSize - newSize;
            const percentage = (100 - (newSize / originalSize) * 100).toFixed(2);

            console.log(
              dest, " is now completed, see ", dest,
              "resulted in ", sizeDifference, "bytes less (", percentage, "%)"
            );
            resolve(true);
          });
        });
      });
    });
  }

  /**
   * Loads a file and returns its content as a Buffer.
   * @param fullpath - The path to the file.
   * @returns A Promise that resolves to a Buffer containing the file content.
   */
  private static loadFileAsBuffer(fullpath: string): Promise<Buffer> {
    console.log(`Loading-${fullpath}`);
    return fs.promises.readFile(fullpath); // Use fs.promises for simpler async/await
  }

  /**
   * Compresses a JavaScript file and embeds it into a PNG image.
   * @param src - The path to the source JavaScript file.
   * @param dest - The path to the destination PNG file.
   * @param preHTML - Optional HTML content to prepend to the decompressor script.
   * @param customScript - Optional custom JavaScript code to execute after decompression.
   * @returns A Promise that resolves to true if the operation was successful.
   */
  static async Pngify(src: string, dest: string, preHTML?: string, customScript?: string): Promise<boolean> {
    try {
      const srcPath = path.join(process.cwd(), src);
      const destPath = path.join(process.cwd(), dest);
      const payload = await this.loadFileAsBuffer(srcPath);
      const result = await this.Compress(payload, preHTML, customScript);

      await fs.promises.writeFile(destPath, result); // Use fs.promises for simpler async/await

      const originalSize = payload.byteLength;
      const newSize = result.byteLength;
      const ratio = ((originalSize / newSize) * 100).toFixed(2);

      console.log(`File created successfully ${dest}, ${originalSize} resulted in ${newSize}, ratio ${ratio}%`);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
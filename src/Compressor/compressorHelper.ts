import * as fs from 'fs';
import * as path from 'path';

export class CompressorHelper {

    /**
     * Loads an array of files from the file system and converts them to base64-encoded data URLs.
     * @param files - An array of file paths to process.
     * @returns A Promise that resolves to an array of base64-encoded data URLs.
     */
    static async loadFilesAndConvertToBase64(files: string[]): Promise<string[]> {
        return Promise.all(files.map(async (file) => {
            try {
                const data = await fs.promises.readFile(file);
                return `data:${this.getMimeType(file)};base64,${data.toString('base64')}`;
            } catch (error) {
                console.error(`Error loading or encoding ${file}:`, error);
                return "";
            }
        }));
    }

    /**
     * Writes an array of base64-encoded data URLs to files in a specified output folder.
     * @param base64DataUrls - An array of base64-encoded data URLs.
     * @param outputFolder - The path to the output folder where the files will be saved.
     * @returns A Promise that resolves when all files have been written.
     */
    static async writeBase64DataUrlsToFiles(base64DataUrls: string[], outputFolder: string, originalFiles: string[]


    ): Promise<void> {
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        await Promise.all(base64DataUrls.map(async (dataUrl, index) => {
            try {


                const nameOfExport = originalFiles[index].split("/").reverse()[0].replace(".", "");


                const filename = `${nameOfExport}.ts`;
                const filePath = `${outputFolder}/${filename}`; // Move filePath declaration here

                // Construct the file content with the base64 data
                const fileContent = `export const ${nameOfExport} = '${dataUrl}'`;

                await fs.promises.writeFile(filePath, fileContent);
                console.log(`File saved: ${filePath}`);
            } catch (error) {
                console.error(`Error writing file ${index + 1}:`, error);
            }
        }));
    }

    /**
     * Extracts the file extension from a base64-encoded data URL.
     * @param dataUrl - The base64-encoded data URL.
     * @returns The file extension (e.g., "png", "jpg", "js").
     */
    private static getFileExtensionFromDataUrl(dataUrl: string): string {
        const matches = dataUrl.match(/^data:([^;]+);base64,/);
        if (matches && matches[1]) {
            return matches[1].split('/').pop()!.toLowerCase();
        }
        return "txt";
    }

    /**
     * Determines the MIME type of a file based on its extension.
     * @param filePath - The path to the file.
     * @returns The MIME type of the file (e.g., "image/png", "audio/mpeg").
     */
    private static getMimeType(filePath: string): string {
        const extension = path.extname(filePath).toLowerCase();
        switch (extension) {
            case '.png': return 'image/png';
            case '.jpg': case '.jpeg': return 'image/jpeg';
            case '.gif': return 'image/gif';
            case '.mp3': return 'audio/mpeg';
            case '.wav': return 'audio/wav';
            case '.woff': return 'font/woff';
            case '.woff2': return 'font/woff2';
            default: return 'application/octet-stream';
        }
    }
    /**
  * Loads an HTML file from the file system and returns its content as a string.
  * @param filePath - The path to the HTML file.
  * @returns A Promise that resolves to the content of the HTML file as a string.
  */
    static async loadHtmlFile(filePath: string): Promise<string> {
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            return data;
        } catch (error) {
            console.error(`Error loading HTML file ${filePath}:`, error);
            return ""; // Or throw an error if you prefer
        }
    }
}
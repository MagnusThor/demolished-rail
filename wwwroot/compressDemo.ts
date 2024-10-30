// In your SetupDemo class

import { CompressorHelper } from "../src/Compressor/compressorHelper";


class CompressDemo {
    static async toBase64(filesToEncode: string[]) {
        const base64DataUrls = await CompressorHelper.loadFilesAndConvertToBase64(filesToEncode);

        // 3. Write the base64 data URLs to files
        await CompressorHelper.writeBase64DataUrlsToFiles(base64DataUrls, "wwwroot/assets/base64",
            filesToEncode
            
        );

        // 4. (Optional) Log a success message
        console.log("Files compressed and saved to wwwroot/assets/base64");
    }
}


CompressDemo.toBase64(
    [
        "./wwwroot/assets/music/atoms.mp3"
    ]
);

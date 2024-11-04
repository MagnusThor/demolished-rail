import { Compressor } from "../src/Compressor/compressor";
import { CompressorHelper } from "../src/Engine/Helpers/compressorHelper";

/**
 * This class handles the compression and bundling of the demo scene production.
 */
class CompressDemo {

  /**
   * Loads files from the file system, converts them to base64, and writes them to an output folder.
   * @param filesToEncode - An array of file paths to encode.
   */
  static async toBase64(filesToEncode: string[]) {
    const base64DataUrls = await CompressorHelper.loadFilesAndConvertToBase64(filesToEncode);
    await CompressorHelper.writeBase64DataUrlsToFiles(base64DataUrls, "wwwroot/assets/base64", filesToEncode);
    console.log("Files compressed and saved to wwwroot/assets/base64");
  }

  /**
   * Compresses the bundled JavaScript code and embeds it into a PNG image with an HTML payload.
   */
  static async Pngify() {
    console.log("Compressing demo");

    const html = await CompressorHelper.loadHtmlFile("./wwwroot/Fol06_StartUp.html");

    // Custom script to decompress and execute the JavaScript code
    const customScript = `
      z=function(){
        c=String.fromCharCode;
        q=document.querySelector.bind(document);
        i=q("img");
        x=q("#c").getContext("2d");
        x.drawImage(i,0,0);
        d=x.getImageData(0,0,i.width,i.height).data;
        b=[];
        s=1e3;
        p=b.push.bind(b);
        l=function(a){
          var e=(a-s)/d.length*100;
          q("#p").style.width=e+"%";
          for(i=a;i<a+s&&i<d.length;i+=4) {
            p(c(d[i]));
            p(c(d[i+1]));
            p(c(d[i+2]));
          }
          if (a<d.length) {
            setTimeout(function(){l(a+s)},10);
          } else {
            s=b.join("").replace(/\\0/g," ");
            (0,eval)(s);
            q("#p").style.display="none";
          }
        };
        l(0)
      };
    `;

    try {
      await Compressor.Pngify("./wwwroot/js/fol06-bundle.js", "./wwwroot/release/output.html", html, customScript);
      console.log("done..");
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Runs the compression process.
   */
  static async run() {
    await this.toBase64(["./wwwroot/assets/music/atoms.mp3","./wwwroot/assets/images/ulfDanielsson.png"]);
    await this.Pngify();
  }
}

CompressDemo.run();
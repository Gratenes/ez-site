import fs from "fs";
import axios from "axios";
import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";

import config from "../../config";
import path from "path";
import { Image, createCanvas, loadImage } from "canvas";

async function toVideo(
  {
    audio,
    pictures,
  }: { audio: { url: string; duration: number }; pictures: string[] },
  uuid: string
): Promise<string> {
  return new Promise<string>(async (resolve, reject): Promise<void> => {
    const pictureUrls = pictures;
    const outputVideo = `./storage/${uuid}/processed.mp4`;
    const outputAudio = `./storage/${uuid}/audio.mp3`;

    // Download the images
    let downloadImages: string[] = [];
    if (!fs.existsSync("./storage")) fs.mkdirSync("./storage");
    if (!fs.existsSync(`./storage/${uuid}`)) {
      fs.mkdirSync(`./storage/${uuid}`);
      fs.writeFile(outputVideo, "", () => {});
      fs.writeFile(outputAudio, "", () => {});
      await Promise.all(
        pictureUrls.map(async (url, i): Promise<void> => {
          return new Promise<void>((resolve, reject): void => {
            const saveUrl = axios(url, {
              headers: {
                "User-Agent":
                  "Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18",
              },
              method: "GET",
              responseType: "arraybuffer",
            })
              .then((response) => {
                downloadImages.push(`./storage/${uuid}/${i}.jpeg`);
                fs.writeFileSync(`./storage/${uuid}/${i}.jpeg`, response.data);
              })
              .catch((error) => {
                console.error(error);
              });

            const saveAudio = axios(audio.url, {
              headers: {
                "User-Agent":
                  "Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18",
              },
              method: "GET",
              responseType: "arraybuffer",
            })
              .then((response) => {
                fs.writeFileSync(outputAudio, response.data);
              })
              .catch((error) => {
                console.error(error);
              });

            Promise.all([saveUrl, saveAudio]).then(() => {
              resolve();
            });
          });
        })
      );
    } else {
      downloadImages = fs
        .readdirSync(`./storage/${uuid}`)
        .map((file) => `./storage/${uuid}/${file}`);
      return resolve(`/api/video/?uuid=${uuid}`);
    }

    let root = process.cwd() || __dirname || __filename || "fake";
    const properOutput = path.join(root, "storage", uuid, "processed.mp4");
    const properImages = path.join(root, "storage", uuid, "%d.jpeg");
    const properAudio = path.join(root, "storage", uuid, "audio.mp3");

    const displayTimePerFrame = 2;
    const frameRate: number = 1 / displayTimePerFrame; // 0.5 frames per second

    const audioDuration = audio.duration;
    const imageDuration = pictures.length * displayTimePerFrame;

    let ffmpegCommand: string[] = [];

    if (audioDuration > imageDuration) {
      ffmpegCommand = [
        "-stream_loop",
        "-1",
        "-r",
        `${frameRate}`,
        "-f",
        "image2",
        "-i",
        properImages,
        "-i",
        properAudio,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-pix_fmt",
        "yuv420p",
        "-shortest", // stop encoding when the shortest stream ends (i.e. the audio)
        "-vf",
        `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
        "-t",
        audioDuration.toString(),
        "-y",
        properOutput,
      ].flat();
    } else {
      ffmpegCommand = [
        "-stream_loop",
        "-1",
        "-r",
        `${frameRate}`,
        "-f",
        "image2",
        "-i",
        properImages,
        "-stream_loop",
        "-1",
        "-i",
        properAudio,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
        "-t",
        imageDuration.toString(),
        "-y",
        properOutput,
      ].flat();
    }

    const ffmpegProcess = spawn(ffmpeg as string, ffmpegCommand);

    // Debugging
    if (true) {
      console.log(`FFmpeg config:
          ${audioDuration} > ${imageDuration} = ${
        audioDuration > imageDuration
      } aka ${audioDuration > imageDuration ? '"audio"' : '"image"'} is longer
          Output Location: ${properOutput}
          Images Location: ${properImages}
          Audio Location: ${properAudio}
        `);

      ffmpegProcess.stdout.on("data", (data: Buffer) => {
        console.log(`FFmpeg stdout: ${data}`);
      });

      ffmpegProcess.stderr.on("data", (data: Buffer) => {
        console.error(`FFmpeg stderr: ${data}`);
      });

      ffmpegProcess.on("error", (err: Error) => {
        console.error("Error:", err);
      });
    }

    ffmpegProcess.on("close", (code: number) => {
      if (code === 0) {
        console.log("Video conversion completed successfully");
        return resolve(`/api/video/?uuid=${uuid}`);
      } else {
        console.error(`FFmpeg process exited with code ${code}`);
        return resolve(`/api/video/?uuid=${uuid}`);
      }
    });
  });
}

async function toPicture({ pictures }: { pictures: string[] }, uuid: string) {
  const Canvas = require("canvas");

  // Define the grid dimensions
  const rows = 2; // Number of rows in the grid
  const columns = 2; // Number of columns in the grid

  // Calculate the width and height of each picture in the grid
  const pictureWidth = Canvas.createCanvas().width / columns;
  const pictureHeight = Canvas.createCanvas().height / rows;

  // Create a new canvas to hold the combined pictures
  const canvas = Canvas.createCanvas(
    pictureWidth * columns,
    pictureHeight * rows
  );
  const context = canvas.getContext("2d");

  // Load all the pictures and draw them onto the canvas
  const loadImage = async (url: string | Buffer, x: number, y: number) => {
    const image = new Image();
    image.src = url;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        console.log("Loaded", url);
        context.drawImage(image, x, y, pictureWidth, pictureHeight);
        resolve();
      };

      image.onerror = reject;
    });
  };

  // Calculate the position for each picture in the grid
  let x = 0;
  let y = 0;

  // Iterate over each picture URL and load it onto the canvas
  for (let i = 0; i < pictures.length; i++) {
    await loadImage(pictures[i], x, y);

    // Move to the next position in the grid
    x += pictureWidth;

    if ((i + 1) % columns === 0) {
      // Move to the next row
      x = 0;
      y += pictureHeight;
    }
  }

  // Convert the canvas to a data URL
  const dataUrl = canvas.toDataURL();

  // Save the combined picture using the provided UUID
  // (You'll need to implement the logic to save the picture based on your specific requirements)
  return dataUrl;
}

export default toVideo;
export { toVideo, toPicture };

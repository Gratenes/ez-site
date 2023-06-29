import fs from "fs";
import axios from "axios";
import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";

import path from "path";
import { Image, createCanvas, loadImage } from "canvas";
import { embedMedia } from "../requesters";

async function toVideo(media: embedMedia[], uuid: string): Promise<embedMedia> {
  return new Promise<embedMedia>(async (resolve, reject): Promise<void> => {
    const pictureUrls = media
      .filter((m) => m.type === "photo")
      .map((m) => m.url);
    const audio = media.find((m) => m.type === "audio") || {
      url: "",
      duration: 0,
    };
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
      return resolve({
        type: "video",
        url: `/api/video/?uuid=${uuid}`,
        duration: 0,
        height: 0,
        width: 0,
        thumbnail: "",
      });
    }

    let root = process.cwd() || __dirname || __filename || "fake";
    const properOutput = path.join(root, "storage", uuid, "processed.mp4");
    const properImages = path.join(root, "storage", uuid, "%d.jpeg");
    const properAudio = path.join(root, "storage", uuid, "audio.mp3");

    const displayTimePerFrame = 2;
    const frameRate: number = 1 / displayTimePerFrame; // 0.5 frames per second

    const audioDuration = audio.duration || 0;
    const imageDuration = pictureUrls.length * displayTimePerFrame;

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
    if (false) {
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
        return resolve({
          type: "video",
          url: `/api/video/?uuid=${uuid}`,
          duration: 0,
          height: 0,
          width: 0,
          thumbnail: "",
        });
      } else {
        console.error(`FFmpeg process exited with code ${code}`);
        return resolve({
          type: "video",
          url: `/api/video/?uuid=${uuid}`,
          duration: 0,
          height: 0,
          width: 0,
          thumbnail: "",
        });
      }
    });
  });
}
export default toVideo;
export { toVideo };

import fs from "fs";
import axios from "axios";
import {spawn} from "child_process";
import ffmpeg from "ffmpeg-static";

import config from "../config";

export default async function (pictures: string[], uuid: string): Promise<string> {
	return new Promise<string>(async (resolve, reject): Promise<void> => {
		const pictureUrls = pictures
		const outputVideo = `./storage/${uuid}/processed.mp4`;

		// Download the images
		let downloadImages: string[] = []
		if (!fs.existsSync('./storage')) fs.mkdirSync('./storage')
		if (!fs.existsSync(`./storage/${uuid}`)) {
			fs.mkdirSync(`./storage/${uuid}`)
			fs.writeFile(outputVideo, '', () => {
			})
			await Promise.all(pictureUrls.map(async (url, i): Promise<void> => {
				return new Promise<void>((resolve, reject): void => {
					axios(url, {
						headers: {
							'User-Agent': 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18',
						},
						method: 'GET',
						responseType: 'arraybuffer'
					}).then((response) => {
						downloadImages.push(`./storage/${uuid}/${i}.jpeg`)
						fs.writeFileSync(`./storage/${uuid}/${i}.jpeg`, response.data)
						resolve()
					}).catch((error) => {
						console.error(error);
					});
				})
			}));
		} else {
			downloadImages = fs.readdirSync(`./storage/${uuid}`).map((file) => `./storage/${uuid}/${file}`)
			return resolve(`${config.site}/api/video/?uuid=${uuid}`)
		}

		console.log(downloadImages)

		const displayTimePerFrame = 2;
		const frameRate: number = 1 / displayTimePerFrame; // 0.5 frames per second

		const ffmpegCommand = [
			'-r', `${frameRate}`,
			'-f', 'image2',
			//...downloadImages.map((url, i) => ['-i', url]),
			'-i', `./storage/${uuid}/%d.jpeg`,
			'-c:v', 'libx264',
			'-pix_fmt', 'yuv420p',
			'-vf', `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
			'-y', outputVideo
		].flat();


		// Run the ffmpeg command
		const ffmpegProcess = spawn(ffmpeg as string, ffmpegCommand);

		// Debugging
		ffmpegProcess.stdout.on('data', (data: Buffer) => {
			console.log(`FFmpeg stdout: ${data}`);
		});

		ffmpegProcess.stderr.on('data', (data: Buffer) => {
			console.error(`FFmpeg stderr: ${data}`);
		});

		ffmpegProcess.on('error', (err: Error) => {
			console.error('Error:', err);
		});

		ffmpegProcess.on('close', (code: number) => {
			if (code === 0) {
				console.log('Video conversion completed successfully');
				return resolve(`${config.site}/api/video/?uuid=${uuid}`)
			} else {
				console.error(`FFmpeg process exited with code ${code}`);
				return resolve(`${config.site}/api/video/?uuid=${uuid}`)
			}
		});
	})
}
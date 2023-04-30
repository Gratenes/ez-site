import fs from "fs";
import axios from "axios";
import {spawn} from "child_process";
import ffmpeg from "ffmpeg-static";

import config from "../../config";
import path from "path";

export default async function ({audio, pictures,}: {
	audio: {
		url: string
		duration: number
	}, pictures: string[]
}, uuid: string, site: typeof config.sites): Promise<string> {
	return new Promise<string>(async (resolve, reject): Promise<void> => {
		const pictureUrls = pictures
		const outputVideo = `./storage/${uuid}/processed.mp4`;
		const outputAudio = `./storage/${uuid}/audio.mp3`;

		// Download the images
		let downloadImages: string[] = []
		if (!fs.existsSync('./storage')) fs.mkdirSync('./storage')
		if (!fs.existsSync(`./storage/${uuid}`)) {
			fs.mkdirSync(`./storage/${uuid}`)
			fs.writeFile(outputVideo, '', () => {})
			fs.writeFile(outputAudio, '', () => {})
			await Promise.all(pictureUrls.map(async (url, i): Promise<void> => {
				return new Promise<void>((resolve, reject): void => {
					const saveUrl = axios(url, {
						headers: {
							'User-Agent': 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18',
						},
						method: 'GET',
						responseType: 'arraybuffer'
					}).then((response) => {
						downloadImages.push(`./storage/${uuid}/${i}.jpeg`)
						fs.writeFileSync(`./storage/${uuid}/${i}.jpeg`, response.data)
					}).catch((error) => {
						console.error(error);
					});

					const saveAudio = axios(audio.url, {
						headers: {
							'User-Agent': 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18',
						},
						method: 'GET',
						responseType: 'arraybuffer'
					}).then((response) => {
						fs.writeFileSync(outputAudio, response.data)
					}).catch((error) => {
						console.error(error);
					});

					Promise.all([saveUrl, saveAudio]).then(() => {
						resolve()
					})
				})
			}));
		} else {
			downloadImages = fs.readdirSync(`./storage/${uuid}`).map((file) => `./storage/${uuid}/${file}`)
			return resolve(`/api/video/?uuid=${uuid}`)
		}

		const properOutput = path.join(__dirname, '../../', 'storage', uuid, 'processed.mp4')
		const properImages = path.join(__dirname, '../../', 'storage', uuid, '%d.jpeg')
		const properAudio = path.join(__dirname, '../../', 'storage', uuid, 'audio.mp3')

		const audioDuration = audio.duration

		const displayTimePerFrame = 2;
		const frameRate: number = 1 / displayTimePerFrame; // 0.5 frames per second

		const ffmpegCommand = [
			'-stream_loop', '-1',
			'-r', `${frameRate}`,
			'-f', 'image2',
			'-i', properImages,
			'-i', properAudio,
			'-c:v', 'libx264',
			'-c:a', 'aac',
			'-pix_fmt', 'yuv420p',
			'-shortest', // stop encoding when the shortest stream ends (i.e. the audio)
			'-vf', `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
			'-shortest',
			'-t', audioDuration.toString(),
			'-y', properOutput
		].flat();

		// Run the ffmpeg command
		const ffmpegProcess = spawn(ffmpeg as string, ffmpegCommand);

		// Debugging
		/*
		ffmpegProcess.stdout.on('data', (data: Buffer) => {
			console.log(`FFmpeg stdout: ${data}`);
		});

		ffmpegProcess.stderr.on('data', (data: Buffer) => {
			console.error(`FFmpeg stderr: ${data}`);
		});

		ffmpegProcess.on('error', (err: Error) => {
			console.error('Error:', err);
		});*/

		ffmpegProcess.on('close', (code: number) => {
			if (code === 0) {
				console.log('Video conversion completed successfully');
				return resolve(`/api/video/?uuid=${uuid}`);
			} else {
				console.error(`FFmpeg process exited with code ${code}`);
				return resolve(`/api/video/?uuid=${uuid}`);
			}
		});
	})
}
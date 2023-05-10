import {Application, Request, Response} from "express";
import fetchInstaVideo from "@/utils/insta/fetchInstaVideo";
import trackViews from "@/utils/trackViews";
import checkDomainName from "@/utils/checkDomain";

import settings from "../../config";
import fs from "fs";
import axios from "axios";
import console from "console";

const getInstagramVideo = async (req: Request, res: Response) => {
	const videos = await fetchInstaVideo(req.params.id)
	if (typeof videos === "string") return res.status(404).render('404.ejs', {
		cause: 'This post is private or does not exist'
	})

	res.render('insta/index.ejs', {insta: videos})
}

export default (app: Application) => {

	app.get('/api/video/instagram/:id.mp4', async (req, res) => {
		const instagramFetch = await fetchInstaVideo(req.params.id)

		if (typeof instagramFetch === "string") return res.status(404).render('404.ejs', {cause: 'This post is private or does not exist'})

		/*instagramFetch.content.images ? instagramFetch.content.video = await convertToVideo({
			pictures: instagramFetch.content.images,
			audio: {
				url: instagramFetch.music.audio.url,
				duration: instagramFetch.music.audio.duration,
			},
		}, instagramFetch.content.id, req.headers.host as any) : null*/

		const video = instagramFetch.content.video;
		const videoPath = `./storage/${instagramFetch.content.id}/processed.mp4`;

		if (fs.existsSync(videoPath)) {
			const stat = fs.statSync(videoPath);
			const fileSize = stat.size;
			const range = req.headers.range;

			if (range) {
				const parts = range.replace(/bytes=/, "").split("-");
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
				const chunkSize = (end - start) + 1;
				const fileStream = fs.createReadStream(videoPath, { start, end });
				const headers = {
					"Content-Range": `bytes ${start}-${end}/${fileSize}`,
					"Accept-Ranges": "bytes",
					"Content-Length": chunkSize,
					"Content-Type": "video/mp4",
				};
				res.writeHead(206, headers);
				fileStream.pipe(res);
			} else {
				const fileStream = fs.createReadStream(videoPath);
				const headers = {
					"Content-Length": fileSize,
					"Content-Type": "video/mp4",
					"Cache-Control": "public, max-age=31536000, immutable",
				};
				res.writeHead(200, headers);
				fileStream.pipe(res);
			}
		} else if (video) {
			const range = req.headers.range;

			if (!range) {
				res.setHeader("Content-Type", "video/mp4");
				res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
				res.setHeader("Content-Length", instagramFetch.content.videoLength);
				res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

				axios(video, {
					responseType: "stream",
				})
					.then((response) => {
						response.data.pipe(res);
					})
					.catch((err) => {
						res.sendStatus(500);
						console.log(err);
					});
			} else {
				const parts = range.replace(/bytes=/, "").split("-");
				const start = parseInt(parts[0], 10);
				const end = parts[1] ? parseInt(parts[1], 10) : instagramFetch.content.videoLength - 1;
				const chunkSize = (end - start) + 1;
				const headers = {
					"Content-Type": "video/mp4",
					"Content-Length": chunkSize,
					"Content-Range": `bytes ${start}-${end}/${instagramFetch.content.videoLength}`,
					"Accept-Ranges": "bytes",
					"Cache-Control": "public, max-age=31536000, immutable",
				};
				const file = axios(video, {
					responseType: "stream",
					headers: {
						Range: `bytes=${start}-${end}`,
					},
				})
					.then((response) => {
						res.writeHead(200, headers);
						response.data.pipe(res);
					})
					.catch((err) => {
						res.sendStatus(500);
						console.log(err);
					});
			}
		} else {
			res.status(404).send("Video not found");
		}
	})

	app.get('/https\://www.instagram.com/p/:id/', trackViews, getInstagramVideo)
	app.get('/https\://www.instagram.com/reel/:id/', trackViews, getInstagramVideo)
	app.get('/https\://www.instagram.com/reels/:id/', trackViews, getInstagramVideo)

	const domainCheck = checkDomainName(settings.sites.instagram)

	app.get('/p/:id',  trackViews, getInstagramVideo)
	app.get('/reel/:id',  trackViews, getInstagramVideo)
	app.get('/reels/:id',  trackViews, getInstagramVideo)
}
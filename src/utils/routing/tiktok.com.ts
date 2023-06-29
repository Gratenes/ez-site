import fetchTiktok from "@/depricated/tiktok/index-old";
import convertToVideo from "@/utils/convertPictures";
import axios from "axios";
import {Application, Request, Response} from "express";
import trackViews, { updateEntry } from "@/utils/trackViews";
import subDomain from "@/utils/subDomain";
import checkDomainName from "@/utils/checkDomain";

import settings from "../../../config";
import * as console from "console";
import fs from "fs";


const resolveTikTokId = async (url: string): Promise<string> => {
  const data = await axios.get(url, {
    validateStatus: () => true,
  });
  const redirectUrl = data?.request?.res?.responseUrl;
  return redirectUrl?.split("/")?.at(-1)?.split("?")?.at(0);
}

const redirectToNextJs = (link?: string) => {
  if (link) {
    return (req: Request, res: Response) => {
      resolveTikTokId(link + req.params.id).then((id) => {
        updateEntry(id, req.hostname);
        res.redirect(`/embed/${id}?type=tiktok`);
      });
    };
  } else {
    return (req: Request, res: Response) => {
      res.redirect(`/embed/${req.params.id}?type=tiktok`);
    };
  }
};

export default (app: Application) => {
	const domainCheck = checkDomainName(settings.sites.tiktok);

	app.get('/api/video/tiktok/:id.mp4', async (req, res) => {
		const tiktok = await fetchTiktok(req.params.id, {})
		tiktok.content.images ? tiktok.content.video = await convertToVideo({
			pictures: tiktok.content.images,
			audio: {
				url: tiktok.music.audio.url,
				duration: tiktok.music.audio.duration,
			},
		}, tiktok.content.id) : null

		const video = tiktok.content.video;
		const videoPath = `./storage/${tiktok.content.id}/processed.mp4`;

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
				res.setHeader("Content-Length", tiktok.content.videoLength);
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
				const end = parts[1] ? parseInt(parts[1], 10) : tiktok.content.videoLength - 1;
				const chunkSize = (end - start) + 1;
				const headers = {
					"Content-Type": "video/mp4",
					"Content-Length": chunkSize,
					"Content-Range": `bytes ${start}-${end}/${tiktok.content.videoLength}`,
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
	app.get('/api/video/tiktok/random', async (req, res) => {
		let ipAddress: string = req.header('X-Forwarded-For') || req.socket.remoteAddress!;

		const tiktok = await fetchTiktok('random', {
			cached: false,
			followRedirects: false,
			returnArray: true,
			ipAddress: ipAddress
		})

		// @ts-ignore
		if (!tiktok[0].content.video) return res.status(404).send('Video not found')
		res.setHeader('Content-Type', 'application/json').send(tiktok)
	})

	app.get('/https\://www.tiktok.com/t/:id', redirectToNextJs('https://www.tiktok.com/t/'));
	app.get('/https\://www.tiktok.com/@:username/video/:id', trackViews, redirectToNextJs());

	app.get('/v/:id', domainCheck, subDomain('m'), redirectToNextJs('https://m.tiktok.com/v/'));
	app.get('/:id', domainCheck, subDomain('vt'), redirectToNextJs('https://vt.tiktok.com/'));
	app.get('/:id', domainCheck, subDomain('vm'), redirectToNextJs('https://vm.tiktok.com/'));
	app.get("/t/:id", domainCheck, redirectToNextJs('https://www.tiktok.com/t/'));
	app.get("/@:username/video/:id", domainCheck, trackViews, redirectToNextJs());
  
}
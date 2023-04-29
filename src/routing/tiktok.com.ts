import fetchTiktok from "@/utils/tiktok/fetchTiktok";
import convertToVideo from "@/utils/convertPictures.ts";
import axios from "axios";
import {Application, Request, Response} from "express";
import trackViews from "@/utils/trackViews";
import subDomain from "@/utils/subDomain";
import checkDomainName from "@/utils/checkDomain.ts";

import settings from "../../config";
import * as console from "console";

const getTiktokVideo = (settings?: any) => {
	return async (req: Request, res: Response) => {
		try {
			const tiktok = await fetchTiktok(req.params.id, {
				...settings,
				originalLink: typeof settings?.originalLink === 'function'
					? settings?.originalLink(req)
					: settings?.originalLink
			});
			if (tiktok.content.images) {
				tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any);
			}
			res.render("tiktok/index.ejs", {tiktok: tiktok});
		} catch (e) {
			res.render('404.ejs', {
				cause: 'Video not found'
			})
		}
	}
}

export default (app: Application) => {
	const domainCheck = checkDomainName(settings.sites.tiktok);

	app.get('/api/video/tiktok/:id.mp4', async (req, res) => {
		const tiktok = await fetchTiktok(req.params.id)
		tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any) : null

		const video = tiktok.content.video
		if (!video) return res.status(404).send('Video not found')

		const range = req.headers.range;
		if (!range) {
			res.setHeader('Content-Type', 'video/mp4')
			res.setHeader('Content-Disposition', 'attachment; filename=video.mp4')
			res.setHeader('Content-Length', tiktok.content.videoLength)
			res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
			axios(video, {
				responseType: 'stream'
			}).then(response => {
				response.data.pipe(res);
			}).catch(err => {
				res.sendStatus(500)
				console.log(err)
			})
		} else {
			const parts = range.replace(/bytes=/, "").split("-");
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : tiktok.content.videoLength - 1;
			const chunkSize = (end - start) + 1;
			const file = axios(video, {
				responseType: 'stream',
				headers: {
					Range: `bytes=${start}-${end}`,
				},
			}).then(response => {
				res.writeHead(206, {
					'Content-Type': 'video/mp4',
					'Content-Length': chunkSize,
					'Content-Range': `bytes ${start}-${end}/${tiktok.content.videoLength}`,
					'Accept-Ranges': 'bytes',
					'Cache-Control': 'public, max-age=31536000, immutable',
				});
				response.data.pipe(res);
			}).catch(err => {
				res.sendStatus(500)
				console.log(err)
			})
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

	app.get('/https\://www.tiktok.com/@:username/video/:id', trackViews, getTiktokVideo({}));
	app.get('/https\://www.tiktok.com/t/:id', trackViews, getTiktokVideo({followRedirects: true}));

	/* This is so track the funny vm.tiktok.com domains */
	/* This also only allows traffic to tiktokez for this specific routing */

	app.get('/t/:id', domainCheck, trackViews, getTiktokVideo({followRedirects: true}));
	app.get('/@:username/video/:id', domainCheck, trackViews, getTiktokVideo());
	app.get('/:id', domainCheck, subDomain('vt'), trackViews, getTiktokVideo({
		followRedirects: true,
		originalLink: (req: Request) => `https://vt.tiktok.com/${req.params.id}`
	}));
	app.get('/:id', domainCheck, subDomain('vm'), trackViews, getTiktokVideo({
		followRedirects: true,
		originalLink: (req: Request) => `https://vm.tiktok.com/${req.params.id}`
	}))
	app.get('/v/:id', domainCheck, subDomain('m'), trackViews, getTiktokVideo({
		followRedirects: true,
		originalLink: (req: Request) => `https://m.tiktok.com/v/${req.params.id}`
	}));

}
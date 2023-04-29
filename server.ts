import express from 'express';
import next from 'next';
import path from "path";
import fs from "fs";

import settings from './config'

const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler();

import fetchTiktok from "@/utils/tiktok/fetchTiktok";
import instagramCom from "@/routing/instagram.com";
import tiktokCom from "@/routing/tiktok.com";

server.prepare().then(() => {
	const app = express();

	/* set public folder */
	app.use(express.static(path.join(__dirname, 'public')))

	/* set views folder */
	app.set('views', path.join(__dirname, 'src/views'))

	/* css for old ejs files */
	app.get('/css/index.css', (req, res) => {
		res.sendFile(__dirname + '/src/styles/oldIndex.css')
	})

	app.get("/scroll", async (req, res) => {
		let ipAddress: string = req.header('X-Forwarded-For') || req.socket.remoteAddress!;

		const tiktoks = await fetchTiktok('random', {
			cached: false,
			followRedirects: false,
			returnArray: true,
			ipAddress: ipAddress
		})
		return res.render("landing.ejs", {tiktoks: tiktoks});
	})
	app.get('/api/video', (req, res) => {
		const uuid = req.query.uuid as string
		if (!uuid) return res.status(400).send('No uuid provided')

		const video = `./storage/${uuid}/processed.mp4`
		if (fs.existsSync(video)) {
			res.status(200).sendFile(video, {root: __dirname})
		}
	})

	// Load Instagram Videos
	instagramCom(app)

	// Load Tiktok Videos
	tiktokCom(app)

	/* Next Js */
	app.get("*", async (req, res) => {
		return handle(req, res)
	})

	app.listen(settings.port || 3000, () => {
		console.log(`Server is listening on port ${settings.port || 3000}`)
	})
});
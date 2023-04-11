import express from 'express'
import * as fs from 'fs';
import path from "path";
import helmet from "helmet";

import convertToVideo from './components/convertPictures'
import fetchTiktok from "./components/tiktok/fetchTiktok";

import settings from '../config'

const app = express()

app.use(helmet.contentSecurityPolicy({
	directives: {
		"script-src": ["'self'", "'unsafe-inline'", "akamaized.net", "unpkg.com", ...Object.values(settings.sites).map((site) => site)],
		mediaSrc: ["'self'", "v16m-default.akamaized.net"]
	}
}))

app.set('views', path.join(__dirname, 'views'))

app.get("/", (req, res) => {
	return res.send("Hello World!")
})

app.get("/css/index.css", (req, res) => {
	return res.sendFile(__dirname + "/styles/index.css")
})

app.get('/api/video', (req, res) => {
	const uuid = req.query.uuid as string
	if (!uuid) return res.status(400).send('No uuid provided')

	const video = `./storage/${uuid}/processed.mp4`
	if (fs.existsSync(video)) {
		res.status(200).sendFile(video, {root: __dirname})
	}
})

// accept two formats of url
// https://www.tiktok.com/@username/video/1234567891234567890
// /@username/video/1234567891234567890
// https://www.tiktok.com/t/ZTRcGDTRF/
// /t/ZTRcGDTRF/

app.get('/https\://www.tiktok.com/@:username/video/:id', async (req, res) => {
	console.log(req.params.id)
})

app.get('/https\://www.tiktok.com/t/:id', async (req, res) => {
	console.log(req.params.id)
})

app.get('/t/:id', async (req, res) => {
	console.log(req.params.id)
})

app.get('/@:username/video/:id', async (req, res) => {
	console.log(req.params.id)

	const tiktok = await fetchTiktok(req.params.id)
	console.log('site', req.headers.host)
	tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, req.params.id, req.headers.host as any) : null

	res.render("tiktok/index.ejs", {tiktok: tiktok});
})

app.listen(settings.port || 3000, () => {
	console.log(`Server is listening on port ${settings.port || 3000}`)
})

//fetchTiktok('@foolinyou_/video/7219547897161862446')

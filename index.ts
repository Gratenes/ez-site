// @ts-ignore
import express from 'express'
import * as fs from 'fs';

import convertToVideo from './tiktok/convertPictures'
import fetchTiktok from "./tiktok/fetchTiktok";

const app = express()

const settings = {
	port: 3000,
}

app.get("/", (req, res) => {
	return res.send("Hello World!")
})

app.get("/css/index.css", (req, res) => {
	return res.sendFile(__dirname + "/views/css/index.css")
})

app.get('/api/video', (req, res) => {
	const uuid = req.query.uuid as string
	if (!uuid) return res.status(400).send('No uuid provided')

	const video = `./storage/${uuid}/processed.mp4`
	if (fs.existsSync(video)) {
		res.status(200).sendFile(video, {root: __dirname})
	}
})

app.get('/*', async (req, res) => {
	try {
		let params = req.params as any
		if ('0' in params) params = params['0']

		params = params?.replace(/https:\/www\.tiktok/, 'https://www.tiktok');

		if (typeof params === "object" || !params) return res.sendStatus(403)

		let formattedOutput = {
			video: '',
			'stats': {
				views: '',
				likes: '',
				shares: '',
				comments: '',
			},
			'user': {
				name: '',
				username: '',
				profile_pic: '',
			},
			'sound': {
				name: '',
				url: ''
			},
			'cover': {
				dynamic: '',
				static: ''
			}
		}

		res.shouldKeepAlive = true
		const tiktok = await fetchTiktok(params)

		console.log('Building Schema')
		if (tiktok?.content?.images?.at(0)) {
			// remove slash from end of url
			`${params}`.endsWith('/') ? params = `${params}`.slice(0, -1) : ``
			const uuid: string = `${params}`.split('/').pop() || 'fart'
			formattedOutput.video = await convertToVideo(tiktok?.content?.images, uuid)

		} else formattedOutput.video = tiktok?.content?.video;

		formattedOutput.stats.views = tiktok?.content?.statistics?.views;
		formattedOutput.stats.likes = tiktok?.content?.statistics?.likes;
		formattedOutput.stats.shares = tiktok?.content?.statistics?.shares;
		formattedOutput.stats.comments = tiktok?.content?.statistics?.comments;
		formattedOutput.cover.dynamic = tiktok?.content?.covers.dynamic;
		formattedOutput.cover.static = tiktok?.content?.covers.static;

		formattedOutput.user.name = tiktok?.user?.displayName;
		formattedOutput.user.username = tiktok?.user?.username;
		formattedOutput.user.profile_pic = tiktok?.user?.pictures["1080x1080"]?.url;

		formattedOutput.sound.name = tiktok?.music?.title;
		formattedOutput.sound.url = tiktok?.music?.audio?.url;

		if (!formattedOutput.video) return res.sendStatus(404);

		try {
			res.render("index.ejs", {formattedOutput: formattedOutput});
		} catch (error) {
			console.error('ERROR: ' + error);
			res.status(500).send('Internal Server Error');
		}
	} catch (e) {

	}
})

app.listen(settings.port || 3000, () => {
	console.log(`Server is listening on port ${settings.port || 3000}`)
})

//fetchTiktok('@foolinyou_/video/7219547897161862446')

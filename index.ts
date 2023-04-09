// @ts-ignore
import express from 'express'
import * as fs from 'fs';

import convertToVideo from './tiktok/convertPictures'
import fetchTiktok from "./tiktok/fetchTiktok";

const app = express()

const settings = {
	port: 3000,
}

app.get('/api/video', (req, res) => {
	const uuid = req.query.uuid as string
	if (!uuid) return res.status(400).send('No uuid provided')

	const video = `./storage/${uuid}/processed.mp4`
	if (fs.existsSync(video)) {
		res.status(200).sendFile(video, {root: __dirname})
	}
})

app.get('/test', (req, res) => {
	res.status(200).send('Hello World')
})

app.get('/*', async (req, res) => {
	try {
		console.log(req.params)

		let params = req.params as any
		if ('0' in params) params = params['0']

		params = params?.replace(/https:\/www\.tiktok/, 'https://www.tiktok');

		if (typeof params === "object" || !params || params === 'favicon.ico') return res.sendStatus(403)

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
			}
		}


		//if (parms?.includes(`tiktok.com`)) {

		res.shouldKeepAlive = true
		const tiktok = await fetchTiktok(params)

		console.log('Building Schema')
		if (tiktok?.content?.images?.at(0)) {
			// remove slash from end of url
			`${params}`.endsWith('/') ? params = `${params}`.slice(0, -1) : ``
			const uuid: string = `${params}`.split('/').pop() || 'fart'
			formattedOutput.video = await convertToVideo(tiktok?.content?.images, uuid)

		} else formattedOutput.video = tiktok?.content?.video;

		formattedOutput.stats.views = tiktok?.content?.statistics?.views
		formattedOutput.stats.likes = tiktok?.content?.statistics?.likes
		formattedOutput.stats.shares = tiktok?.content?.statistics?.shares
		formattedOutput.stats.comments = tiktok?.content?.statistics?.comments

		formattedOutput.user.name = tiktok?.user?.displayName
		formattedOutput.user.username = tiktok?.user?.username
		formattedOutput.user.profile_pic = tiktok?.user?.pictures["1080x1080"]?.url

		formattedOutput.sound.name = tiktok?.music?.title
		formattedOutput.sound.url = tiktok?.music?.audio?.url

		//}

		if (!formattedOutput.video) return res.sendStatus(404)

		try {
			res.send(`
		  <html>
		    <head>
		      <title> Tiktok Video Downloader </title>
		      <meta property="og:site_name" content="Made by Chance#0002">
		      
		      <meta name="twitter:card"                       content="player" />
		      <meta name="twitter:title"                      content="${formattedOutput.user.name || "Unknown"} ${formattedOutput.user.username ? `(${formattedOutput.user.username})` : ""}"  />
		      <meta name="twitter:image"                      content="" />
		      <meta name="twitter:player:width"               content="720" />
		      <meta name="twitter:player:height"              content="480" />
		      <meta name="twitter:player:stream"              content="${formattedOutput.video}" />
		      <meta name="twitter:player:stream:content_type" content="video/mp4" /> 
		    </head>
		    <body>
		    <h1> Tiktok Video Embeder </h1>
		    <h2> Made by Chance#0002 </h2>
		    <p>This api is ment to be used in discord https://whatevert.this.link/tiktokURL</p>
		    </body>
		  </html>
  `)

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

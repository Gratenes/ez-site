import express, {Request, Response, NextFunction} from 'express'
import * as fs from 'fs';
import path from "path";
import helmet from "helmet";

import convertToVideo from './components/convertPictures'
import fetchTiktok from "./components/tiktok/fetchTiktok";
import fetchInstaVideo from "./components/insta/fetchInstaVideo";

import settings from '../config'
import axios from "axios";

const app = express()

/*app.use(helmet.contentSecurityPolicy({
	directives: {
		"script-src": ["'self'", "'unsafe-inline'", "akamaized.net", "unpkg.com", ...Object.values(settings.sites).map((site) => site)],
		mediaSrc: ["'self'", "v16m-default.akamaized.net"]
	}
}))*/

const Subdomain = (subdomainName: string): ((req: Request, res: Response, next: NextFunction) => void) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		console.log('subdomain', req.subdomains[0])
		if (req.subdomains[0] === subdomainName) {
			next(); // Proceed to next middleware function
		} else {
			res.status(403).send('Forbidden');
		}
	};
};


app.set('views', path.join(__dirname, 'views'))

app.get("/", async (req, res) => {
	res.render('index.ejs', {
		info: {
			host: req.headers.host,
		}
	})
})

app.get("/scroll", async (req, res) => {
	let ipAddress: string = req.header('X-Forwarded-For') || req.socket.remoteAddress!;

	console.log(ipAddress)
	const tiktoks = await fetchTiktok('random', {
		cached: false,
		followRedirects: false,
		returnArray: true,
		ipAddress: ipAddress
	})
	return res.render("landing.ejs", {tiktoks: tiktoks});
})

app.get('/pic/:id', async (req, res) => {
	return res.sendFile(__dirname + `/assets/pictures/${req.params.id}.png`)
})

app.get("/svg/:name", (req, res) => {
	return res.sendFile(__dirname + `/assets/svg/${req.params.name}.svg`)
})

app.get("/svg/:folder/:name", (req, res) => {
	return res.sendFile(__dirname + `/assets/svg/${req.params.folder}/${req.params.name}.svg`)
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


// These are the routes for instagram
const getInstagramVideo = async (req: Request, res: Response) => {
	const videos = await fetchInstaVideo(req.params.id)
	if (videos === 'This post is private or does not exist') return res.status(404).render('404.ejs', {
		cause: 'This post is private or does not exist'
	})

	res.render('insta/index.ejs', {insta: videos})
}

app.get('/p/:id', getInstagramVideo)
app.get('/reels/:id', getInstagramVideo)
app.get('/reel/:id', getInstagramVideo)


// These are the routes for tiktoks
app.get('/api/video/tiktok/:id.mp4', async (req, res) => {
	const tiktok = await fetchTiktok(req.params.id)
	tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any) : null

	const video = tiktok.content.video
	if (!video) return res.status(404).send('Video not found')

	axios(video, {
		responseType: 'stream'
	}).then(response => {
		//res.setHeader('Content-Type', 'video/mp4')
		response.data.pipe(res);
	}).catch(err => {
		res.sendStatus(500)
		console.log(err)
	})
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

const getTiktokVideo = (settings?: any) => {
	return async (req: Request, res: Response) => {
		try {
			const tiktok = await fetchTiktok(req.params.id, {
				...settings,
				originalLink: typeof settings?.originalLink === 'function'
					? settings?.originalLink(req)
					: settings?.originalLink
			});
			console.log('pased Fetch tiktok')
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


app.get('/https\://www.tiktok.com/@:username/video/:id', getTiktokVideo({}));
app.get('/https\://www.tiktok.com/t/:id', getTiktokVideo({followRedirects: true}));
app.get('/t/:id', getTiktokVideo({followRedirects: true}));
app.get('/@:username/video/:id', getTiktokVideo());
app.get('/:id', Subdomain('vt'), getTiktokVideo({
	followRedirects: true,
	originalLink: (req: Request) => `https://vt.tiktok.com/${req.params.id}`
}));

// 404 error page
app.use((req, res) => {
	res.status(404).render('404.ejs')
})

app.listen(settings.port || 3000, () => {
	console.log(`Server is listening on port ${settings.port || 3000}`)
})
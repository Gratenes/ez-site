import express, {response} from 'express'
import * as fs from 'fs';
import path from "path";
import helmet from "helmet";

import convertToVideo from './components/convertPictures'
import fetchTiktok from "./components/tiktok/fetchTiktok";

import settings from '../config'
import axios from "axios";

const app = express()

/*app.use(helmet.contentSecurityPolicy({
	directives: {
		"script-src": ["'self'", "'unsafe-inline'", "akamaized.net", "unpkg.com", ...Object.values(settings.sites).map((site) => site)],
		mediaSrc: ["'self'", "v16m-default.akamaized.net"]
	}
}))*/

app.set('views', path.join(__dirname, 'views'))

app.get("/", async (req, res) => {
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

app.get("/svg/:name", (req, res) => {
    return res.sendFile(__dirname + `/assets/svg/${req.params.name}.svg`)
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

app.get('/https\://www.tiktok.com/@:username/video/:id', async (req, res) => {
    const tiktok = await fetchTiktok(req.params.id)
    tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any) : null

    res.render("tiktok/index.ejs", {tiktok: tiktok});
})

app.get('/https\://www.tiktok.com/t/:id', async (req, res) => {
    const tiktok = await fetchTiktok(req.params.id, {
        followRedirects: true
    })
    tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any) : null

    res.render("tiktok/index.ejs", {tiktok: tiktok});
})

app.get('/t/:id', async (req, res) => {
    const tiktok = await fetchTiktok(req.params.id, {
        followRedirects: true
    })
    tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any) : null

    res.render("tiktok/index.ejs", {tiktok: tiktok});
})

app.get('/@:username/video/:id', async (req, res) => {
    const tiktok = await fetchTiktok(req.params.id)
    tiktok.content.images ? tiktok.content.video = await convertToVideo(tiktok.content.images, tiktok.content.id, req.headers.host as any) : null

    res.render("tiktok/index.ejs", {tiktok: tiktok});
})

app.listen(settings.port || 3000, () => {
    console.log(`Server is listening on port ${settings.port || 3000}`)
})

//fetchTiktok('@foolinyou_/video/7219547897161862446')

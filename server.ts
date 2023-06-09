import express from 'express';
import next from 'next';
import path from "path";
import fs from "fs";
import * as mongoose from "mongoose";

import settings from './config'

const dev = process.env.NODE_ENV !== 'production';

console.log(`Starting server in ${dev ? 'development' : 'production'} mode`);

const server = next({ dev });
const handle = server.getRequestHandler();

import fetchTiktok from "@/utils/tiktok/index-old";
import instagramCom from "@/routing/instagram.com";
import tiktokCom from "@/routing/tiktok.com";
import twitterCom from "@/routing/twitter.com";

import Entry from "./mongo/schema";
import { toPicture } from '@/utils/convertPictures';

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
  app.post('/api/convert/image/picture', express.json({
    limit: '1000mb'
  }),
   
  async (req, res) => {
      const { pictures } = req.body;
      if (!pictures) return res.status(400).json({ error: "No pictures" });

      const uuid = new mongoose.Types.ObjectId().toString();
      const result = await toPicture({ pictures }, uuid);

      res.status(200).json({ result });
  })

	// Load Instagram Videos - Chance#0002
	instagramCom(app)

	// Load Tiktok Videos - Chance#0002
	tiktokCom(app)

  // Load Twitter Videos - Chance#0002
  twitterCom(app)

	/* Next Js */
	app.get("*", async (req, res) => {
		return handle(req, res)
	})

	app.listen(settings.port || 3000, () => {
		console.log(`Server is listening on port ${settings.port || 3000}`)
	})
});

// Connect to the MongoDB database
mongoose.connect(`mongodb+srv://gratenes:${settings.hidden.mongodbPass}@cluster0.xj0ao.mongodb.net/ez?retryWrites=true&w=majority`).then(() => {
	console.log('Connected to MongoDB');
}).catch((err) => {
	console.error('Error connecting to MongoDB:', err);
});
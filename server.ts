import * as mongoose from "mongoose";
import express from 'express';
import next from 'next';
import path from "path";

import settings from './config'

const dev = process.env.NODE_ENV !== 'production';

console.log(`Starting server in ${dev ? 'development' : 'production'} mode`);

const server = next({ dev });
const handle = server.getRequestHandler();

import routes from './src/utils/routing';

server.prepare().then(() => {
	const app = express();

	/* set public folder */
	app.use(express.static(path.join(__dirname, 'public')))

  /* Load all the routes for tiktok, instagram, etc... ./src/utils/routing */
  routes(app)

	/* Next Js */
	app.get("*", async (req, res) => {
		return handle(req, res)
	})

	app.listen(settings.port || 3000, () => {
		console.log(`Server is listening on port ${settings.port || 3000}`)
	})
});

const {
  mongodb_url,
  mongodb_username,
  mongodb_password,
  mongodb_collection,
  mongodb_db,
} = process.env

// Connect to the MongoDB database
mongoose
  .connect(`${mongodb_url}://${mongodb_username}:${mongodb_password}@${mongodb_collection}/${mongodb_db}?retryWrites=true&w=majority`)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
import {Application, Request, Response} from "express";
import fetchInstaVideo from "@/utils/insta/fetchInstaVideo";
import trackViews from "@/utils/trackViews";
import checkDomainName from "@/utils/checkDomain";

import settings from "../../config";

const getInstagramVideo = async (req: Request, res: Response) => {
	const videos = await fetchInstaVideo(req.params.id)
	if (videos === 'This post is private or does not exist') return res.status(404).render('404.ejs', {
		cause: 'This post is private or does not exist'
	})

	res.render('insta/index.ejs', {insta: videos})
}

export default (app: Application) => {
	app.get('/https\://www.instagram.com/p/:id/', trackViews, getInstagramVideo)
	app.get('/https\://www.instagram.com/reel/:id/', trackViews, getInstagramVideo)
	app.get('/https\://www.instagram.com/reels/:id/', trackViews, getInstagramVideo)

	const domainCheck = checkDomainName(settings.sites.instagram)

	app.get('/p/:id',  trackViews, getInstagramVideo)
	app.get('/reel/:id',  trackViews, getInstagramVideo)
	app.get('/reels/:id',  trackViews, getInstagramVideo)
}
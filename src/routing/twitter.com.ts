import {Application, Request, Response} from "express";
import fetchTwitterVideo from "@/utils/twitter";
import trackViews from "@/utils/trackViews";
import checkDomainName from "@/utils/checkDomain";

import settings from "../../config";

const getInstagramVideoJson = async (req: Request, res: Response) => {
	const videos = await fetchTwitterVideo({id: req.params.id});
  console.log(videos)
	if (!videos) return res.status(404).render('404.ejs', {
		cause: 'This post is private or does not exist'
	})

  res.json(videos)
}

const redirectToNextJs = (req: Request, res: Response) => {
  res.redirect(`/embed/twitter/${req.params.id}`)
}

export default (app: Application) => {
  app.get(`/api/video/twitter/:id`, getInstagramVideoJson);
  app.get(`/api/video/twitter/:id.mp4`, (req, res) => {
    res.redirect(`/api/video/twitter/${req.params.id}`);
  });

	app.get('/https\://twitter.com/:user/status/:id/', trackViews, redirectToNextJs)

	const domainCheck = checkDomainName(settings.sites.twitter)

	app.get("/:user/status/:id/", domainCheck, trackViews, redirectToNextJs);
}
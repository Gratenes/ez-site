import {Application, Request, Response} from "express";
import trackViews from "@/utils/trackViews";
import checkDomainName from "@/utils/checkDomain";

import settings from "../../config";

const redirectToNextJs = (req: Request, res: Response) => {
  res.redirect(`/embed/${req.params.id}?type=instagram`)
};

export default (app: Application) => {
	app.get("/https://www.instagram.com/p/:id/", trackViews, redirectToNextJs);
	app.get("/https://www.instagram.com/reel/:id/", trackViews, redirectToNextJs);
	app.get("/https://www.instagram.com/reels/:id/", trackViews, redirectToNextJs);

	const domainCheck = checkDomainName(settings.sites.instagram)

	app.get("/p/:id", trackViews, redirectToNextJs);
	app.get("/reel/:id", trackViews, redirectToNextJs);
	app.get("/reels/:id", trackViews, redirectToNextJs);
}
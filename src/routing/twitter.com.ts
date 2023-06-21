import {Application, Request, Response} from "express";
import trackViews from "@/utils/trackViews";
import checkDomainName from "@/utils/checkDomain";

import settings from "../../config";

const redirectToNextJs = (req: Request, res: Response) => {
  res.redirect(`/embed/${req.params.id}?type=twitter`)
}

export default (app: Application) => {
	app.get('/https\://twitter.com/:user/status/:id/', trackViews, redirectToNextJs)

	const domainCheck = checkDomainName(settings.sites.twitter)
	app.get("/:user/status/:id/", domainCheck, trackViews, redirectToNextJs);
}
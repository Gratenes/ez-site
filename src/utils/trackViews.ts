import {Request, Response} from "express";
import {NextFunction} from "connect";
import settings from "../../config";
import axios from "axios";


const trackViews = async (req: Request, res: Response, next: NextFunction) => {
	if (settings?.hidden?.webhooks?.length === 0 || !settings?.hidden?.webhooks) return next();

	const randomIndex = Math.floor(Math.random() * settings.hidden.webhooks.length);
	const webhookUrl = settings.hidden.webhooks[randomIndex];

	const unixTimestampInSeconds = Math.floor(Date.now() / 1000);

	// Send a POST request to the random webhook URL with the message payload
	axios.post(webhookUrl, {
		"content": null,
		"embeds": [
			{
				"title": `Site: \`${req.hostname}\``,
				"description": `url:\`${req.hostname}${req.originalUrl}\n\`\nsent:<t:${unixTimestampInSeconds}:R>`,
				"color": 16777215
			}
		],
		"attachments": []
	}).catch(err => {
		console.log('webhook dont worky: ' + webhookUrl)
	})

	next();
}

export default trackViews;

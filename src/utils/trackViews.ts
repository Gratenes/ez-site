import {Request, Response} from "express";
import settings from "../../config";
import axios from "axios";

import Entry from "../../mongo/schema";

const trackViews = async (req: Request, res: Response, next: () => void) => {
	if (settings?.hidden?.webhooks?.length === 0 || !settings?.hidden?.webhooks) return next();

	const randomIndex = Math.floor(Math.random() * settings.hidden.webhooks.length);
	const webhookUrl = settings.hidden.webhooks[randomIndex];

	const unixTimestampInSeconds = Math.floor(Date.now() / 1000);

	(async () => {
		const entry = await Entry.findOne({_id: req.params.id})
		if (entry) {
			entry.views += 1
			await entry.save()
		} else {
			const newEntry = new Entry({
				_id: req.params.id,
				views: 1
			})
			await newEntry.save()
		}
	})().then(r => {}).catch(err => console.log(err));

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

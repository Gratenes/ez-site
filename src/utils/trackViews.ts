import { Request, Response } from "express";
import settings from "../../config";
import axios from "axios";

import Entry from "../../mongo/schema";

const trackViews = async (req: Request, res: Response, next: () => void) => {
  next(); // we don't care if this fails or not
  if (settings?.hidden?.webhooks?.length === 0 || !settings?.hidden?.webhooks)
    return next();

  const randomIndex = Math.floor(
    Math.random() * settings.hidden.webhooks.length
  );
  const webhookUrl = settings.hidden.webhooks[randomIndex];

  const unixTimestampInSeconds = Math.floor(Date.now() / 1000);

  try {
    await updateEntry(req.params.id, req.hostname);
    await sendWebhook(
      webhookUrl,
      req.hostname,
      req.originalUrl,
      unixTimestampInSeconds
    );
  } catch (err) {
    console.log(err);
  }

};

const updateEntry = async (id: string, hostname: string) => {
  const entry = await Entry.findOne({ _id: id });
  if (entry) {
    entry.site = hostname;
    entry.views += 1;
    await entry.save();
  } else {
    const newEntry = new Entry({
      _id: id,
      site: hostname,
      views: 1,
    });
    await newEntry.save();
  }
};

const sendWebhook = async (
  webhookUrl: string,
  hostname: string,
  originalUrl: string,
  unixTimestampInSeconds: number
) => {
  await axios.post(webhookUrl, {
    content: null,
    embeds: [
      {
        title: `Site: \`${hostname}\``,
        description: `url:\`${hostname}${originalUrl}\n\`\nsent:<t:${unixTimestampInSeconds}:R>`,
        color: 16777215,
      },
    ],
    attachments: [],
  });
};

export default trackViews;
export { updateEntry };
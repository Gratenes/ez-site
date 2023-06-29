

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import dataProviders, { medias, embedMedia } from "@/utils/requesters";
import axios from 'axios';

async function deliverMedia(
  req: NextApiRequest,
  res: NextApiResponse,
  media: embedMedia
) 

{
  switch (media.type) {
    case "video":
      const { url, duration, height, width, thumbnail } = media;
      const range = req.headers.range;

      console.log(range, duration);
      if (!range || !duration ) {
        res.redirect(url)
      } else {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : duration - 1;
        const chunkSize = end - start + 1;
        const headers = {
          "Content-Type": "video/mp4",
          "Content-Length": chunkSize,
          "Content-Range": `bytes ${start}-${end}/${duration}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        };
        axios(url, {
          responseType: "stream",
          headers: {
            Range: `bytes=${start}-${end}`,
          },
        })
          .then((response) => {
            console.log(response.headers);
            res.writeHead(200, headers);
            response.data.pipe(res);
          })
          .catch((err) => {
            res.statusCode = 500;
            console.log(err);
          })
      }
      return;
    case "photo":
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Disposition", "attachment; filename=photo.jpg");
      axios(media.url, {
        responseType: "stream",
      })
        .then((response) => {
          response.data.pipe(res);
        })
        .catch((err) => {
          res.statusCode = 500;
          console.log(err);
        })
        .finally(() => {
          res.end();
        });
      return;
    case "audio":
      return;
  }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {id, type} = req.query

  if (!type || typeof type !== 'string') res.status(400).json({ error: 'No type provided' })
  if (!id) res.status(400).json({ error: 'No id provided' })

  if (type && !dataProviders[type as medias]) return res.status(400).json({ error: 'No data provider for this type' })

  const request = await dataProviders[type as medias]({ id: id as string }, {});

  if ("reason" in request) return res.status(400).json(request);

  const media = 
  request.content.generatedMedia?.sort((a, b) =>
    a.type === "video" ? -1 : 1
  )[0] ||
  request.content.media.sort((a, b) =>
    a.type === "video" ? -1 : 1
  )[0]

  return await deliverMedia(req, res, media);
}

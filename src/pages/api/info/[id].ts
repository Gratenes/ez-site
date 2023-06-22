

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import dataProviders, { medias, embedMedia } from "@/utils/requestData";
import axios from 'axios';

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

  return request;
}

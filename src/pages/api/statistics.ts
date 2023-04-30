// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from "mongoose";
import {createCanvas} from "canvas";
import * as htmlToImage from "html-to-image";

const Entry = mongoose.models.Entry

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
	const dataPoints = await Entry.find({ timestamp: { $gte: past24Hours } }).sort({ timestamp: 1 }).exec();

	const totalEntries = await Entry.countDocuments()
	const views24Hrs = dataPoints.reduce((a, b) => a + b.views, 0)
	const totalViews = (await Entry.aggregate([
		{
			$group: {
				_id: null,
				totalViews: {
					$sum: "$views"
				}
			}
		}
	]))[0].totalViews

	res.status(200).json({
		dataPoints: dataPoints,
		totalEntries,
		totalViews,
		views24Hrs,
	})
}

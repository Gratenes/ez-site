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
  const length = Entry.length
  const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dataPoints = await Entry.find({ timestamp: { $gte: past24Hours } }).sort({ timestamp: 1 }).exec();

  dataPoints.forEach((entry) => {
    console.log(entry)
    /*
    _ID: NAME
    VIEWS: NUMBER
    TIMESTAMP: DATE
     */
  })

  console.log(dataPoints)

  /*
  const canvasWidth = 1200;
  const canvasHeight = 630;

// Create canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext('2d');

// Draw white rounded rectangle
  const rectWidth = 800;
  const rectHeight = 300;
  const rectX = (canvasWidth - rectWidth) / 2;
  const rectY = (canvasHeight - rectHeight) / 2;
  const rectRadius = 20;
  context.beginPath();
  context.moveTo(rectX + rectRadius, rectY);
  context.lineTo(rectX + rectWidth - rectRadius, rectY);
  context.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectRadius);
  context.lineTo(rectX + rectWidth, rectY + rectHeight - rectRadius);
  context.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - rectRadius, rectY + rectHeight);
  context.lineTo(rectX + rectRadius, rectY + rectHeight);
  context.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - rectRadius);
  context.lineTo(rectX, rectY + rectRadius);
  context.quadraticCurveTo(rectX, rectY, rectX + rectRadius, rectY);
  context.closePath();
  context.fillStyle = '#000000';
  context.fill();
  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 1;
  context.stroke();

// Set text styles
  context.fillStyle = '#FFFFFF';
  context.font = 'bold 30px Arial';

// Draw data points
  const data = await Entry.find({ timestamp: { $gte: Date.now() - 24 * 60 * 60 * 1000 } });
  const totalEntries = await Entry.countDocuments();
  const totalViews = await Entry.aggregate([{ $group: { _id: null, views: { $sum: "$views" } } }]);
  const views24Hrs = data.reduce((acc, entry) => acc + entry.views, 0);
  context.fillText(`Total Entries: ${totalEntries}`, 100, 150);
  context.fillText(`Total Views: ${totalViews[0].views}`, 100, 200);
  context.fillText(`Views in last 24 hours: ${views24Hrs}`, 100, 250);

// Draw graph
  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 2;
  context.beginPath();
  const graphX = rectX + 50;
  const graphY = rectY + rectHeight - 50;
  context.moveTo(graphX, graphY);
  let x = graphX;
  let y = graphY;
  const graphWidth = rectWidth - 100;
  const graphHeight = rectHeight - 100;
  const graphData = data.map((entry, i) => ({ x: i * graphWidth / data.length + graphX, y: graphY - entry.views / (views24Hrs / graphHeight) }));
  graphData.forEach((point) => {
    context.lineTo(point.x, point.y);
    x = point.x;
    y = point.y;
  });
  if (data.length > 0) {
    context.lineTo(graphX + graphWidth, graphY);
  }
  context.stroke();

// Generate image response
  const image = canvas.toBuffer();*/

  const image = await htmlToImage.toPng(
    (

      <div
        style={{
          fontSize: 128,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        Hello world!
      </div>
    ) as any,
    {
      width: 1200,
      height: 600,
    },
  );

  res.status(200).setHeader('Content-Type', 'image/png').send(image)
}

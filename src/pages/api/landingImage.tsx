import { ImageResponse } from '@vercel/og';

import mongoose from "mongoose";
import axios from "axios";


export const config = {
	runtime: 'edge',
};



export default async () => {

	const stats = await fetch('http://localhost:3000/api/statistics').then(res => res.json())
  
  const mostViewed = structuredClone(stats).dataPoints.sort(
    (a: { views: number }, b: { views: number }) => b.views - a.views
  )[0].views;

	console.log(stats)


	return new ImageResponse(
    (
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          width: "100%",
          height: "100%",
          bottom: 0,
          right: 0,
        }}
      >
        <div
          style={{
            fontSize: 128,
            background: "black",
            width: "100%",
            position: "relative",
            height: "100%",
            display: "flex",
            border: "1px solid white",
            borderRadius: "10px",
            flexDirection: "column",
            textAlign: "center",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              width: "100%",
              justifyContent: "space-around",
            }}
          >
            <p>Total Embeds: {stats.totalEntries}</p>
            <p>Total Views: {stats.totalViews}</p>
            <p>Last 24H: {stats.views24Hrs}</p>
          </div>
          {stats.dataPoints.map((entry: any, i: number) => {
            console.log(entry.views, mostViewed);
            const barHeightPercentage = (entry.views / mostViewed) * 70;
            console.log(barHeightPercentage);
            return (
              <div
                style={{
                  bottom: `${barHeightPercentage}%`,
                  position: "absolute",
                  display: "flex",
                  alignItems: "flex-end",
                  width: `100%`,
                  borderColor: "rgba(255, 255, 255, 0.7)",
                  backgroundColor: "#ffffff",
                  borderRadius: "5px",
                  fontSize: "12px",
                  height: "1px",
                }}
              >
                
                  {entry.views}
                
              </div>
            );
          })}
          {stats.dataPoints.map((entry: any, i: number) => {
            console.log(entry.views, mostViewed);
            const barHeightPercentage = (entry.views / mostViewed) * 70;
            console.log(barHeightPercentage);
            return (
              <div
                style={{
                  bottom: `${barHeightPercentage}%`,
                  left: `${(i * 100) / stats.dataPoints.length} %`,
                  position: "absolute",
                  display: "flex",
                  transform: "translateY(50%)",
                  alignItems: "flex-end",
                  width: `${100 / stats.dataPoints.length} %`,
                  borderColor: "rgba(255, 255, 255, 0.7)",
                  backgroundColor: "#ffffff",
                  borderRadius: "5px",
                  padding: "5px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(191, 55, 55, 0.7)",
                    borderRadius: "5px",
                    width: "100%",
                    height: `${barHeightPercentage}%`,
                  }}
                ></div>
                <p
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    color: "#000",
                  }}
                >
                  {entry.time}
                </p>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            display: "flex",
            color: "white",
            opacity: 0,
            marginLeft: "10px",
            top: 0,
            left: 0,
          }}
        >
          <p
            style={{
              textShadow: `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`,
              transform: "translateY(-20%)",

              textAlign: "start",
              verticalAlign: "bottom",
              fontSize: "64px",
            }}
          >
            Statistics
          </p>
        </div>
      </div>
    ),

    {
      width: 1200,
      height: 600,
    }
  );
}
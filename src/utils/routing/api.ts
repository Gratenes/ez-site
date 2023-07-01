import { Application, Request, Response } from "express";
import fs from "fs";
import path from "path";
import trackViews from "@/utils/trackViews";

export default (app: Application) => {


  app.get("/api/video", trackViews, (req, res) => {
    let root = process.cwd() || __dirname || __filename || "fake";
    const uuid = req.query.uuid as string;
    if (!uuid) return res.status(400).send("No uuid provided");

    const video = path.join(root, "storage", uuid, `processed.mp4`);
    if (fs.existsSync(video)) {
      res.status(200).sendFile(video);
    }
  });
};

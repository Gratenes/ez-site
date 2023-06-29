import instagramCom from "./instagram.com"
import twitterCom from "./twitter.com"
import tiktokCom from "./tiktok.com"
import api from "./api"

import { Express } from "express";

export default (app: Express) => {
  console.log('Loading routes...')
  api(app);
  instagramCom(app);
  twitterCom(app);
  tiktokCom(app);
};
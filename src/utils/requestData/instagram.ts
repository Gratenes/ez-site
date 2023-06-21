import axios from "axios";
import { load } from "cheerio";

import cache from "../cache";
import { embedFunction, embedFetchError, embedMedia } from ".";

export default cache(instaFetch);

async function instaFetch({ id }: { id: string }): embedFunction {
  const postUrl = "https://www.instagram.com/p/" + id;
  const response = await axios.get(postUrl);
  const $ = load(response.data);
  const jsonElement = $("script[type='application/ld+json']");

  return new Promise((resolve) => {
    if (jsonElement.length === 0)
      resolve({
        id,
        reason: "This post is private or does not exist",
        type: "instagram",
      });

    interface imageResponse {
      caption: string;
      height: number;
      width: number;
      url: string;
    }

    const jsonText = jsonElement.text();
    const json = JSON.parse(jsonText);
    const username = json.author.identifier.value;

    const {
      video: videoArray,
      image,
    }: {
      video: any[];
      image: imageResponse | imageResponse[];
    } = json;

    const media: embedMedia[] = [];

    if (videoArray.length === 0 && !image)
      resolve({
        id,
        reason: `${id} does not contain any videos`,
        type: "instagram",
      });

    for (const video of videoArray) {
      media.push({
        type: "video",
        url: video.contentUrl,
        thumbnail: video.thumbnailUrl,
        duration: json?.video_info?.duration_millis || null,
        height: video.height,
        width: video.width,
      });
    }

    if (Array.isArray(image)) {
      for (const img of image) {
        media.push({
          type: "photo",
          url: img.url,
          duration: null,
          height: img.height,
          width: img.width,
          thumbnail: null,
        });
      }
    } else if (image) {
      media.push({
        type: "photo",
        url: image.url,
        duration: null,
        height: image.height,
        width: image.width,
        thumbnail: null,
      });
    }

    console.log(json);

    resolve({
      id,
      type: "instagram",
      user: {
        name: username,
        displayName: username,
        region: null,
        followers: null,
        friends: null,
        pictures: {
          url: json.author.image || null,
          banner: null,
        },
      },
      content: {
        id,
        text: json.articleBody || null,
        media,
        statistics: {
          shares: json.interactionStatistic?.filter(
            (stat: any) =>
              stat.userInteractionType === "http://schema.org/ShareAction"
          )[0]?.userInteractionCount || null,

          comments:
            json.commentCount ||
            json.interactionStatistic?.filter(
              (stat: any) =>
                stat.userInteractionType === "http://schema.org/CommentAction"
            )[0]?.userInteractionCount ||
            null,

          follows: json.interactionStatistic?.filter(
            (stat: any) =>
              stat.userInteractionType === "http://schema.org/FollowAction"
          )[0]?.userInteractionCount || null,

          views:
            json.mediaStats?.viewCount ||
            json.interactionStatistic?.filter(
              (stat: any) =>
                stat.userInteractionType === "http://schema.org/WatchAction"
            )[0]?.userInteractionCount ||
            null,

          likes: json.interactionStatistic?.filter(
            (stat: any) =>
              stat.userInteractionType === "http://schema.org/LikeAction"
          )[0]?.userInteractionCount || null,
        },
      },
    });
  });
}

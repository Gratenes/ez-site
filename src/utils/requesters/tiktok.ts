// import cache npm package
import axios from "axios";
import cache from "../cache";
import { pictureToVideo } from "../converters";
import { embedFetch, embedMedia } from ".";

interface settingsInterface {
  cached?: boolean;
  followRedirects?: boolean;
  returnArray?: true | false;
  originalLink?: string;
  ipAddress?: string;
}

export default cache(tiktokFetch);

async function tiktokFetch(
  {id}: {id: string},
  settings: settingsInterface
): Promise<embedFetch> {
  if (settings.followRedirects) {
    const tiktokResponse = await axios.get(
      settings?.originalLink
        ? settings?.originalLink
        : `https://www.tiktok.com/t/${id}`,
      {
        validateStatus: () => true,
      }
    );
    const redirectUrl = tiktokResponse?.request?.res?.responseUrl;
    id = redirectUrl?.split("/")?.at(-1)?.split("?")?.at(0);
  }

  if (!id) return Promise.reject("No Tiktok ID provided");

  let device_id: number = Math.floor(Math.random() * 100000000);
  if (settings.ipAddress) {
    const seed: number = settings.ipAddress
      .split(".")
      .reduce(
        (prev, curr) => parseInt(String(prev), 10) + parseInt(curr, 10),
        0
      );
    device_id = seed;
  }

  const tiktokResponse = await axios.get(
    `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${id}&device_id=${device_id}`
  );

  let responce: any;

  const firstElement = tiktokResponse.data.aweme_list?.at(0);

  let media: embedMedia[] = [];

  if (firstElement.image_post_info?.images) {
    media = firstElement.image_post_info?.images?.map((image: any) => ({
      type: "photo",
      url:
        image.display_image.url_list
          ?.filter((url: string) => url.includes("jpeg"))
          ?.at(0) || "",
      thumbnail:
        image.display_image.url_list
          ?.filter((url: string) => url.includes("jpeg"))
          ?.at(0) || "",
      duration: null,
      height: image.display_image.height || 0,
      width: image.display_image.width || 0,
    }));
  } else if (firstElement?.video?.play_addr?.url_list?.at(0)) {
    media.push({
      type: "video",
      url: firstElement?.video?.play_addr?.url_list?.at(0) || "",
      thumbnail: firstElement?.video?.cover?.url_list?.at(0) || "",
      duration: firstElement?.video?.duration,
      height: firstElement?.video?.height,
      width: firstElement?.video?.width,
    });
  }

  const customAudio = firstElement.added_sound_music_info;
  if (customAudio) {
    media.push({
      type: "audio",
      url: customAudio.play_url.uri,
      thumbnail: null,
      duration: customAudio.duration,
      height: firstElement?.video?.height,
      width: firstElement?.video?.width,
    });
  }

  // remove audio from media
  const mediaIsPhoto = media.filter((m) => m.type === "photo" || m.type === "video").every((m) => m.type === "photo");
  const extendedMedia = mediaIsPhoto ? await pictureToVideo(media, firstElement?.aweme_id) : undefined;

  return {
    type: "tiktok",
    id: firstElement?.aweme_id,
    incorrectId: firstElement?.aweme_id !== id,
    user: {
      name: firstElement?.author?.unique_id,
      displayName: firstElement?.author?.nickname,
      region: firstElement?.author?.region,
      followers: firstElement?.author?.follower_count,
      friends: firstElement?.author?.following_count,
      pictures: {
        url: firstElement?.author?.avatar_larger?.url_list?.at(0) || "",
        banner: null, // No corresponding field in the provided code
      },
    },
    content: {
      id: firstElement?.aweme_id,
      text: firstElement?.desc,
      media: media,
      generatedMedia: extendedMedia ? [extendedMedia] : undefined,
      statistics: {
        shares: firstElement?.statistics?.share_count || 0,
        comments: firstElement?.statistics?.comment_count || 0,
        follows: 0,
        views: firstElement?.statistics?.play_count || 0,
        likes: firstElement?.statistics?.digg_count || 0,
      },
    },
  };
}

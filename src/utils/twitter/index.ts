import cache from '../cache'
import axios from "axios";

import type { fetch as responceType } from "../types";

const apiRoute = "https://api.twitter.com/1.1/";

let authToken = "";

export interface twitterMedia {
  type: "video" | "photo" | "gif";
  url: string;
  thumbnail: string | null;
  duration: number | null;
  height: number;
  width: number;
}

export interface twitterFetch {
  user: {
    name: any;
    displayName: any;
    region: any;
    followers: any;
    friends: any;
    pictures: {
      url: any;
      banner: any | null;
    };
  };
  content: {
    id: any;
    text: string | null;
    media: twitterMedia[];
    statistics: {
      shares: number;
      comments: number;
      follows: number;
      views: number;
      likes: number;
    };
  };
}

const sfwTwitter = async ({ id }: { id: string }): Promise<twitterFetch | null> => {
  const { data } = await axios.get(`${apiRoute}statuses/show.json?id=${id}`, {
    headers: {
      Authorization:
        "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    },
  });

  if (!data.extended_entities) return null;
  const mappedNewDataObject: twitterFetch = {
    user: {
      name: data.user.screen_name,
      displayName: data.user.name,
      followers: null,
      friends: null,
      region: null,
      pictures: {
        url: data.user.profile_image_url_https,
        banner: data.user.profile_banner_url || null,
      },
    },
    content: {
      id: data.id_str,
      text: data.text,
      media: data.extended_entities.media.map((media: any): twitterMedia => {
        console.log(media);
        return {
          duration: media.video_info ? media.video_info.duration_millis : null,
          height: media.sizes.large.h,
          width: media.sizes.large.w,
          type: media.type,
          url: media.video_info
            ? media.video_info.variants.reduce(
                (
                  prev: { bitrate?: number; url: string },
                  current: { bitrate?: number; url: string }
                ) =>
                  (prev.bitrate || 0) > (current.bitrate || 0) ? prev : current
              ).url || null
            : media.media_url_https,
          thumbnail: media.type === "video" ? media.media_url_https : null,
        };
      }),
      statistics: {
        views: data.retweet_count,
        comments: data.retweet_count,
        shares: data.retweet_count,
        follows: data.user.followers_count,
        likes: data.favorite_count,
      },
    },
  };

  return mappedNewDataObject;
};

const nsfwTwitter = async ({ id }: { id: string }): Promise<twitterFetch | null>  => {
  //twitter_auth_token,twitter_ct0,twitter_api

  try {
    const request = await axios({
      url: process.env.twitter_api,
      params: {
        variables: `{"focalTweetId":${id},"with_rux_injections":false,"includePromotedContent":true,"withCommunity":true,"withQuickPromoteEligibilityTweetFields":true,"withBirdwatchNotes":true,"withVoice":true,"withV2Timeline":true}`,
        features:
          '{"rweb_lists_timeline_redesign_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}',
      },
      headers: {
        cookie: `ct0=${process.env.twitter_ct0}; auth_token=${process.env.twitter_auth_token}`,
        "x-csrf-token": process.env.twitter_ct0 || "",
        Authorization: `Bearer ${process.env.twitter_bearer_token}`,
      },
    });

    const tweet_results = request.data.data.threaded_conversation_with_injections_v2?.instructions[0].entries[0].content.itemContent.tweet_results.result;
    if (!tweet_results) return null;
    
    const media = tweet_results.legacy.extended_entities.media;

    //return request.data.data

    const user_results = tweet_results.core.user_results.result.legacy;

    return {
      user: {
        name: user_results.screen_name,
        displayName: user_results.name,
        region: user_results.location,
        followers: user_results.followers_count,
        friends: user_results.friends_count,
        pictures: {
          url: user_results.profile_image_url_https,
          banner: user_results.profile_banner_url || null,
        },
      },
      content: {
        id: tweet_results.legacy.id_str,
        text: tweet_results.legacy.full_text,
        //images: media.map((media: any) => media.media_url_https),
        /*video: media[0].video_info?.variants.reduce(
          (
            prev: { bitrate?: number; url: string },
            current: { bitrate?: number; url: string }
          ) => ((prev.bitrate || 0) > (current.bitrate || 0) ? prev : current)
        ).url || null,
        videoLength: media[0].video_info?.duration_millis / 1000 || null,
        covers: {
          static: media[0].media_url_https,
          dynamic: user_results.profile_banner_url || null,
        },*/
        media: media.map((media: any): twitterMedia => {
          console.log(media);
          return {
            duration: media.video_info ? media.video_info.duration_millis : null,
            height: media.sizes.large.h,
            width: media.sizes.large.w,
            type: media.type,
            url: media.video_info
              ? media.video_info.variants.reduce(
                  (
                    prev: { bitrate?: number; url: string },
                    current: { bitrate?: number; url: string }
                  ) =>
                    (prev.bitrate || 0) > (current.bitrate || 0) ? prev : current
                ).url || null
              : media.media_url_https,
            thumbnail: media.type === "video" ? media.media_url_https : null,
          };
        }),
        statistics: {
          shares: tweet_results.legacy.retweet_count,
          comments: tweet_results.legacy.reply_count,
          follows:
            tweet_results.core.user_results.result.legacy.followers_count,
          views: tweet_results.views.count,
          likes: tweet_results.legacy.favorite_count,
        },
      },
    };


  } catch (error) {
    console.log(error);
    return null;
  }
}


export const getTwitterVideoSFW = cache(sfwTwitter);
export const getTwitterVideoNSFW = cache(nsfwTwitter);
export default getTwitterVideoNSFW;

/*getTwitterVideoNSFW({ id: "1665910654341971969" }).then((res) =>{
  console.log(res);
  console.log(new Date().getTime());
});*/
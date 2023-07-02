export type medias = "twitter" | "tiktok" | "instagram";

import tiktok from './tiktok'
import twitter from './twitter'
import instagram from './instagram'

export default {
  tiktok,
  twitter,
  instagram,
} as {
  [key in medias]: (
    { id }: { id: string },
    settings?: any
  ) => Promise<embedFetch | embedFetchError>;
};

export {tiktok, twitter, instagram}

export interface embedMedia {
  type: "video" | "photo" | "audio";
  url: string;
  thumbnail: string | null;
  duration: number | null;
  height: number;
  width: number;
}

export interface embedFetch {
  type: medias;
  id: string;
  incorrectId?: boolean;
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
    media: embedMedia[];
    generatedMedia?: embedMedia[] | null;
    statistics: {
      shares: number;
      comments: number;
      follows: number;
      views: number;
      likes: number;
    };
  };
}

export interface embedFetchError {
  type: medias;
  id?: string;
  reason: string;
  cause?: string;
  code?: number;
}

export type embedFunction = Promise<embedFetch | embedFetchError>;
export interface embedMedia {
  type: "video" | "photo" | "audio";
  url: string;
  thumbnail: string | null;
  duration: number | null;
  height: number;
  width: number;
}

export interface embedFetch {
  type: "twitter" | "tiktok" | "instagram";
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
    generatedMedia?: embedMedia[];
    statistics: {
      shares: number;
      comments: number;
      follows: number;
      views: number;
      likes: number;
    };
  };
}

interface Picture {
  width: number;
  url: string;
  height: number;
}

interface Pictures {
  "1080x1080": Picture;
  "720x720": Picture;
  "100x100": Picture;
}

interface Audio {
  duration: number | null;
  url: string | null;
  strongBeatUrl: string | null;
}

interface Music {
  author: string;
  id: string;
  audio: Audio;
  title: string;
  pictures: Pictures;
}

interface User {
  signature: string | null;
  displayName: string;
  region: string | null;
  pictures: Pictures;
  username: string;
}

interface VideoInfo {
  url: string;
  videoLength: number;
}

interface Covers {
  static: string;
  dynamic: string;
}

interface Statistics {
  shares: number;
  whatsappShares: number | null;
  comments: number | null;
  collects: number | null;
  follows: number;
  views: number | null;
  likes: number;
}

interface Content {
  id: string;
  images: string[];
  video: VideoInfo;
  covers: Covers;
  statistics: Statistics;
}

interface fetch {
  music: Music;
  user: User;
  content: Content;
}

export type {
  fetch
}
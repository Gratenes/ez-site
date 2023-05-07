import NodeCache from "node-cache";
import axios from "axios";
import {load} from "cheerio";

interface VideoInfo {
	width: number;
	height: number;
	caption: string;
	description: string;
	uploadDate: string;
	url: string;
	thumbnail: string;
}

interface FormattedVideoInfo {
	id: string;
	username: string;
	videos: VideoInfo[];
}

interface settingsInterface {
	cached?: boolean;
	followRedirects?: boolean;
	returnArray?: boolean;
	ipAddress?: string;
}

const cache = new NodeCache();

export default async function facebookFetchCache(
	facebookId: string,
	settings: settingsInterface = {}
): Promise<FormattedVideoInfo | string> {
	const {cached = true, followRedirects = false, returnArray = false} = settings;
	const cachedData = cache.get(facebookId);

	if (cachedData && cached) {
		return await cachedData as FormattedVideoInfo;
	}

	const data = facebookFetch(facebookId, settings);
	cache.set(facebookId, data, 60 * 60);
	return await data;
}

async function facebookFetch(facebookId: string, settings: settingsInterface): Promise<FormattedVideoInfo | string> {

	const postUrl = "https://www.facebook.com/p/" + facebookId;
	const response = await axios.get(postUrl);
	const $ = load(response.data);
	const jsonElement = $("script[type='application/ld+json']");

	return new Promise((resolve, reject) => {


		jsonElement.length === 0 ? resolve('This post is private or does not exist') : '';


		const jsonText = jsonElement.text();
		const json = JSON.parse(jsonText);
		const username = json.author.identifier.value;
		const videoList = json.video;
		const formattedVideoList: VideoInfo[] = [];

		videoList.length === 0 ? resolve(`${facebookId} does not contain any videos`) : '';

		for (const video of videoList) {
			const formattedVideo = {
				width: video.width,
				height: video.height,
				caption: video.caption,
				description: video.description,
				uploadDate: video.uploadDate,
				url: video.contentUrl,
				thumbnail: video.thumbnailUrl,
			};
			formattedVideoList.push(formattedVideo);
		}

		resolve({
			id: facebookId,
			username,
			videos: formattedVideoList,
		});
	});
}
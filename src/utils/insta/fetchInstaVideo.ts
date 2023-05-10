import NodeCache from "node-cache";
import axios from "axios";
import {load} from "cheerio";
import * as console from "console";


interface settingsInterface {
	cached?: boolean;
	followRedirects?: boolean;
	returnArray?: boolean;
	ipAddress?: string;
}


interface instagramFetch {
	/*music: {
		author: any;
		id: any;
		audio: { duration: any; url: any; strongBeatUrl: any };
		title: any;
		pictures: {
			"1080x1080": { width: number; url: any; height: number };
			"720x720": { width: number; url: any; height: number };
			"100x100": { width: number; url: any; height: number }
		}
	};*/
	user: {
		signature: any;
		verified: boolean;
		displayName: any;
		region: any;
		picture: string;
		username: any
	};
	content: {
		id: any;
		images: string[] | undefined;
		video: string;
		videoLength: number;
		covers: { static: any; dynamic: any };
		statistics: { shares: any; whatsappShares: any; comments: any; collects: any; views: any; likes: any }
	}
}

const cache = new NodeCache();

export default async function instaFetchCache(
	instaId: string,
	settings: settingsInterface = {}
): Promise<instagramFetch | string> {
	const {cached = true, followRedirects = false, returnArray = false} = settings;
	const cachedData = cache.get(instaId);

	if (cachedData && cached) {
		return await cachedData as instagramFetch;
	}

	const data = instaFetch(instaId, settings);
	cache.set(instaId, data, 60 * 60);
	return await data;
}

async function instaFetch(instaId: string, settings: settingsInterface): Promise<instagramFetch | string> {

	return new Promise(async (resolve, reject) => {
		const axios = require("axios").default;

		const options = {
			method: 'GET',
			url: 'https://www.instagram.com/graphql/query',
			params: {
				query_hash: '477b65a610463740ccdb83135b2014db',
				variables: `{"shortcode":"${instaId}","include_reel":false,"include_logged_out":false}`
			},
			headers: {
				cookie: 'csrftoken=vBDuMqGKTvhnSIH30CwofnjIgUchUSEF; mid=ZFspjQAEAAHDinT4oMvdU0HzZ6Bq; ig_did=961873F2-2A5A-41F8-A211-2073AB6113AF; ig_nrcb=1'
			}
		};

		const request = await axios.request(options)

		if (request.data.status !== 'ok') return resolve('This post is private or does not exist')
		const {data} = request.data;

		console.log(data.shortcode_media)

		return resolve({
			user: {
				signature: data.shortcode_media.owner.id,
				verified: data.shortcode_media.owner.is_verified,
				displayName: data.shortcode_media.owner.full_name,
				region: data.shortcode_media.location?.name,
				picture: data.shortcode_media.owner.profile_pic_url,
				username: data.shortcode_media.owner.username,
			},
			content: {
				id: data.shortcode_media.shortcode,
				images: undefined,
				video: data.shortcode_media.video_url,
				videoLength: data.shortcode_media.video_duration,
				covers: {
					static:  data.shortcode_media.display_resources.at(-1),
					dynamic: undefined,
				},
				statistics: {
					shares: data.shortcode_media.edge_media_preview_like.count,
					whatsappShares: undefined,
					comments: data.shortcode_media.edge_media_to_comment.count,
					collects: undefined,
					views: data.shortcode_media.video_view_count,
					likes: data.shortcode_media.edge_media_preview_like.count,
				}
			}
		})
	})
}
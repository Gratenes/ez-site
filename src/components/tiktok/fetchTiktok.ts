// import cache npm package
import NodeCache from "node-cache";
import axios from "axios";

const cache = new NodeCache();

export default async function tiktokFetchCache(
	tiktokId: string, shouldFollowRedirects = false
): Promise<{
	music: {
		author: any;
		id: any;
		audio: { duration: any; url: any; strongBeatUrl: any };
		title: any;
		pictures: {
			"1080x1080": { width: number; url: any; height: number };
			"720x720": { width: number; url: any; height: number };
			"100x100": { width: number; url: any; height: number }
		}
	};
	user: {
		signature: any;
		displayName: any;
		region: any;
		pictures: {
			"1080x1080": { width: number; url: any; height: number };
			"720x720": { width: number; url: any; height: number };
			"100x100": { width: number; url: any; height: number }
		};
		username: any
	};
	content: {
		images: string[];
		video: string;
		covers: { static: any; dynamic: any };
		statistics: { shares: any; whatsappShares: any; comments: any; collects: any; views: any; likes: any }
	}
}> {
	return new Promise(async (resolve, reject) => {
		const cached = cache.get(tiktokId);
		if (cached) {
			console.log("Cache hit");
			resolve(await cached as any)
		} else {
			try {
				console.log("Cache miss");
				const data = tiktokFetch(tiktokId, shouldFollowRedirects);
				cache.set(tiktokId, data, 60 * 60);
				resolve(await data);
			} catch (error) {
				reject(error);
			}
		}
	});
}

async function tiktokFetch(tiktokId: string, shouldFollowRedirects: boolean): Promise<{
	music: {
		author: any;
		id: any;
		audio: { duration: any; url: any; strongBeatUrl: any };
		title: any;
		pictures: {
			"1080x1080": { width: number; url: any; height: number };
			"720x720": { width: number; url: any; height: number };
			"100x100": { width: number; url: any; height: number }
		}
	};
	user: {
		signature: any;
		displayName: any;
		region: any;
		pictures: {
			"1080x1080": { width: number; url: any; height: number };
			"720x720": { width: number; url: any; height: number };
			"100x100": { width: number; url: any; height: number }
		};
		username: any
	};
	content: {
		images: string[];
		video: string;
		covers: { static: any; dynamic: any };
		statistics: { shares: any; whatsappShares: any; comments: any; collects: any; views: any; likes: any }
	}
}> {
	if (shouldFollowRedirects) {

		const tiktokResponse = await axios.get(`https://www.tiktok.com/t/${tiktokId}`);
		const redirectUrl = tiktokResponse.request.res.responseUrl;

		// get the numbers from the thingy till ?
		tiktokId = redirectUrl.split('/').at(-1).split('?').at(0);
	}

	console.log(`cache ` + tiktokId)

	const tiktokResponse = await axios.get(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${tiktokId}`);

	let images: string[] = [];
	let video: string = '';

	const firstElement = tiktokResponse.data.aweme_list?.at(0);

	images = firstElement.image_post_info?.images?.map((image: any) => {
		return image.display_image.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0);
	});
	video = firstElement?.video?.play_addr.url_list?.filter((url: string) => url.includes('mp4'))?.at(0);

	// Build the response object and return it
	const response = {
		user: {
			username: firstElement?.author?.unique_id,
			displayName: firstElement?.author?.nickname,
			signature: firstElement?.author?.signature,
			region: firstElement?.author?.region,
			pictures: {
				'1080x1080': {
					url: firstElement
						?.author?.avatar_larger?.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
					width: 1080,
					height: 1080
				},
				'720x720': {
					url: firstElement
						?.author?.avatar_medium?.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
					width: 720,
					height: 720
				},
				'100x100': {
					url: firstElement
						?.author?.avatar_thumb?.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
					width: 100,
					height: 100
				}
			}
		},
		content: {
			images: images,
			video: video,
			covers: {
				static: firstElement?.video?.cover.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
				dynamic: firstElement?.video?.dynamic_cover.url_list?.at(0) || undefined
			},
			statistics: {
				likes: firstElement?.statistics?.digg_count,
				comments: firstElement?.statistics?.comment_count,
				shares: firstElement?.statistics?.share_count,
				views: firstElement?.statistics?.play_count,
				whatsappShares: firstElement?.statistics?.whatsapp_share_count,
				collects: firstElement?.statistics?.collect_count,
			}
		},
		music: {
			id: firstElement?.music?.id,
			title: firstElement?.music?.title,
			author: firstElement?.music?.author,
			pictures: {
				'1080x1080': {
					url: firstElement
						?.music?.cover_large.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
					width: 1080,
					height: 1080
				},
				'720x720': {
					url: firstElement
						?.music?.cover_medium.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
					width: 720,
					height: 720
				},
				'100x100': {
					url: firstElement
						?.music?.cover_thumb.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
					width: 100,
					height: 100
				}
			},
			audio: {
				url: firstElement?.music?.play_url.url_list?.filter((url: string) => url.includes('mp3'))?.at(0) ||
					firstElement?.music?.play_url.url_list.uri || undefined,
				duration: firstElement?.music?.duration || undefined,
				strongBeatUrl: firstElement?.music?.strong_beat_url?.url_list?.filter((url: string) => url.includes('json'))?.at(0) || undefined
			}
		}
	}

	console.log(`Just finished getting: ` + tiktokId)
	return response;
}
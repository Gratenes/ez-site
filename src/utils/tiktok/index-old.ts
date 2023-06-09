// import cache npm package
import NodeCache from "node-cache";
import axios from "axios";
import {createHash} from 'crypto';

import cache from "../cache";

interface tiktokFetch {
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
		id: any;
		images: string[];
		video: string;
		videoLength: number;
		covers: { static: any; dynamic: any };
		statistics: { shares: any; whatsappShares: any; comments: any; collects: any; views: any; likes: any }
	}
}

interface settingsInterface {
	cached?: boolean;
	followRedirects?: boolean;
	returnArray?: true | false;
	originalLink?: string;
	ipAddress?: string;
}

type tiktokType<T> = T extends true ? tiktokFetch[] : tiktokFetch;

export default cache(tiktokFetch)

async function tiktokFetch(tiktokId: string, settings: settingsInterface): Promise<tiktokType<{
	returnArray: true | false
}>> {
	if (settings.followRedirects) {

		const tiktokResponse = await axios.get(settings?.originalLink ? settings?.originalLink : `https://www.tiktok.com/t/${tiktokId}`, {
			validateStatus: () => true,
		});
		const redirectUrl = tiktokResponse?.request?.res?.responseUrl;

		// get the numbers from the thingy till ?
		tiktokId = redirectUrl?.split('/')?.at(-1)?.split('?')?.at(0);
	}

	if (!tiktokId) return Promise.reject('No Tiktok ID provided');

	let device_id = 7218277047537649192;
	if (settings.ipAddress) {
		const seed: number = settings.ipAddress.split('.').reduce((prev, curr) => parseInt(String(prev), 10) + parseInt(curr, 10), 0);
		device_id = seed;
		const hash: string = createHash('sha256').update(device_id.toString()).digest('hex');
	}

	const tiktokResponse = await axios.get(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${tiktokId}&device_id=${device_id}`);

	let responce: any

	if (settings.returnArray) {
		const elements = tiktokResponse.data.aweme_list;
		responce = elements.map((firstElement: any) => {
			return {
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
					id: firstElement?.aweme_id,
					images: firstElement.image_post_info?.images?.map((image: any) => {
						return image.display_image.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0);
					}),
					videoLength: firstElement?.video?.play_addr?.data_size,
					video: firstElement?.video?.play_addr.url_list?.filter((url: string) => url.includes('mp4'))?.at(0),
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
								?.music?.cover_large?.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
							width: 1080,
							height: 1080
						},
						'720x720': {
							url: firstElement
								?.music?.cover_medium?.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
							width: 720,
							height: 720
						},
						'100x100': {
							url: firstElement
								?.music?.cover_thumb?.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0) || undefined,
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
		});
	} else {
		const firstElement = tiktokResponse.data.aweme_list?.at(0);

		responce = {
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
				id: firstElement?.aweme_id,
				images: firstElement.image_post_info?.images?.map((image: any) => {
					return image.display_image.url_list?.filter((url: string) => url.includes('jpeg'))?.at(0);
				}),
				videoLength: firstElement?.video?.play_addr?.data_size,
				video: firstElement?.video?.play_addr.url_list?.filter((url: string) => url.includes('mp4'))?.at(0),
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
	}

	return responce;
}
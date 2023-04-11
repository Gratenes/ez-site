// import cache npm package
import NodeCache from "node-cache";
import axios from "axios";

const cache = new NodeCache();

function regexCheck(regex: RegExp[], value: string) {
	return [...regex].map(regex => {
		if (regex.test(value)) {
			return regex.exec(value);
		} else {
			return undefined;
		}
	})?.filter(Boolean)?.at(0) || undefined;
}

export default async function tiktokFetchCache(
	tiktokUrl: string
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
		tiktokUrl = !tiktokUrl?.startsWith('/') ? `/${tiktokUrl}` : tiktokUrl;
		const cached = cache.get(tiktokUrl);
		if (cached) {
			console.log("Cache hit");
			resolve(await cached as any)
		} else {
			try {
				console.log("Cache miss");
				const data = tiktokFetch(tiktokUrl);
					cache.set(tiktokUrl, data, 60 * 60);
					resolve(await data);
			} catch (error) {
				reject(error);
			}
		}
	});
}

async function tiktokFetch(tiktokUrl: string): Promise<{
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

	// accept two formats of url
	// https://www.tiktok.com/@username/video/1234567891234567890
	// /@username/video/1234567891234567890
	// https://www.tiktok.com/t/ZTRcGDTRF/
	// /t/ZTRcGDTRF/

	// Implement system to check if its the /t/id url (if so make a request and follow the redirect to get the /@username/video/id url)

	// Check if the url is valid
	if (!tiktokUrl) throw {
		message: 'Invalid URL - no URL provided',
		error: true,
		code: 400,
	};

	const tiktokRegex = /https:\/\/www\.tiktok\.com\/@(.+)\/video\/([0-9]+)/; // regex for https://www.tiktok.com/@username/video/1234567891234567890
	const tiktokRegex2 = /\/@(.+)\/video\/([0-9]+)/; // regex for /@username/video/1234567891234567890
	const tiktokRegex3 = /https:\/\/www\.tiktok\.com\/t\/([a-zA-Z0-9_]+)/; // regex for https://www.tiktok.com/t/ZTRcGDTRF/
	const tiktokRegex4 = /\/t\/([a-zA-Z0-9_]+)/; // regex for /t/ZTRcGDTRF/

	// Check if the url is valid
	let type = '';
	if (tiktokRegex3.test(tiktokUrl)) {
		type = 'tiktokRegex3';
	} else if (tiktokRegex4.test(tiktokUrl)) {
		type = 'tiktokRegex4';
	} else {
		type = 'tiktokRegex';
	}

	console.log(tiktokUrl, type)

	if (type === 'tiktokRegex3' || type === 'tiktokRegex4') {
		const shortUrl = regexCheck([tiktokRegex3, tiktokRegex4], tiktokUrl);
		if (!shortUrl) throw {
			message: 'Invalid URL - failed to match regex',
			error: true,
			code: 400,
		}

		const shortUrlId = typeof shortUrl?.at(2) === 'string' ? shortUrl?.at(2) : shortUrl?.at(1) || false;
		const getRealId: unknown | string = await axios.get(`https://www.tiktok.com/t/${shortUrlId}`)
			.then(res => res.request.res.responseUrl);

		if (!getRealId || typeof getRealId !== 'string') throw {
			message: 'Invalid URL - failed to get real ID',
			error: true,
			code: 400,
		}

		tiktokUrl = getRealId;
	}
	let url;
	let videoId;
	try {
		url = regexCheck([tiktokRegex, tiktokRegex2], tiktokUrl);
		videoId = typeof url?.at(2) === 'string' ? url?.at(2) : url?.at(1) || false;
	} catch (err) {
		console.log(err);
	}





	// Images logic for the picture tiktoks (not videos)

	// future head hurt
	// x.aweme_list[0].image_post_info.images[0].display_image.url_list[1]
	// the first 0 is the first video (aka one requested)
	// the second 0 is the first image, neeed to loop through all of them
	// the third 0 is the url (check for jpeg ignore webp)
	// request url = https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/
	// Query params: aweme_id: videoId

	const tiktokResponse = await axios.get(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`);

	// Since tiktok added the images we need to check if the video is a picture reel or a video
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

	console.log(`Just finished getting: ` + videoId)
	return response;
}
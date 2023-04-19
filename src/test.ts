import fetchTiktok from "./components/tiktok/fetchTiktok";
import fetchInstaVideo from "./components/insta/fetchInstaVideo";

export default async function testStuff() {
	console.log('[🔎 ] Testing stuff...');
	fetchInstaVideoWrapper();
	fetchTiktokWrapper();
}

async function fetchTiktokWrapper() {
	try {
		const tiktok = await fetchTiktok('7219547897161862446');
		console.log('[✅ ] Tiktok fetched successfully:', tiktok.content.id);
	} catch (error) {
		console.error('[❌ ] Error fetching Tiktok:', error);
	}
}

async function fetchInstaVideoWrapper() {
	try {
		const insta = await fetchInstaVideo('CqN14sEAOwW');
		if (typeof insta === 'string') throw new Error('Video not found');
		console.log('[✅ ] Instagram video fetched successfully:', insta.id);
	} catch (error) {
		console.error('[❌ ] Error fetching Instagram video:', error);
	}
}

testStuff();
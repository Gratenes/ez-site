const needle = require('needle');
const {load} = require('cheerio');
const fs = require('fs');

module.exports = getInfo = async (link) => {
	// Get key from https://ttsave.app/
	const key = await (async () => {
		// how can i ignore certificate error?
		const request = await needle('get', 'https://45.76.149.185/', {
			headers: {
				'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/'
			},
			strictSSL: false
		});
		const match = request.body.match(/https:\/\/ttsave.app\/download\?mode=video&key=([a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12})/);
		return match.at(1);
	})();

	console.log(key);

	const host = `https://45.76.149.185/download?mode=video&key=${key || '608f5a5f-9a8b-462d-ab1e-fc235e4050d6'}`;
	const body = {id: link};
	const headers = {'User-Agent': 'PostmanRuntime/7.31.1'};
	const res = await needle('post', host, body, {headers, json: true});
	try {
		const $ = load(res.body);
		return {
			success: true,
			author: {
				name: $('div div h2').text(),
				profile: $('div a').attr('href'),
				username: $('div a.font-extrabold.text-blue-400.text-xl.mb-2').text()
			},
			video: {
				thumbnail: $('a[type="cover"]').attr('href'),
				views: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(1) span').text(),
				loves: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(2) span').text(),
				comments: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(3) span').text(),
				shares: $('div.flex.flex-row.items-center.justify-center.gap-2.mt-2 div:nth-child(4) span').text(),
				url: {
					no_wm: $('a:contains(\'DOWNLOAD (WITHOUT WATERMARK)\')').attr('href'),
					wm: $('a:contains(\'DOWNLOAD (WITH WATERMARK)\')').attr('href')
				}
			},
			pictures: $('a:contains(\'DOWNLOAD SLIDE\')')?.map((i, el) => $(el).attr('href')).get() || [],
			backsound: {
				name: $('div.flex.flex-row.items-center.justify-center.gap-1.mt-5 span').text(),
				url: $('a:contains(\'DOWNLOAD AUDIO (MP3)\')').attr('href')
			}
		};
	} catch (error) {
		const file = 'log/error.json';
		if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
		const errLog = JSON.parse(fs.readFileSync(file).toString());
		console.error(error);
		let log = {
			time: new Date().toLocaleString('en-US', {timezone: 'Asia/Jakarta'}),
			error: {
				in: error,
				cause: error.message
			}
		};
		errLog.push(log);
		fs.writeFile(file, JSON.stringify(errLog), (err) => {
			if (err) {
				console.log(err);
				return false;
			}
			console.log('\n[!] Something error, error saved to log/error.json\n');
		});
		return {success: false};
	}
};
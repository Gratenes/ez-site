import Artplayer from "artplayer";
import { useRouter } from "next/router";
import { useEffect } from "react";

export async function getServerSideProps(context:any) {
	console.log(context)
	/*
	const { id } = context.query;
	const res = await fetch(`https://api.facebookez.com/instagram/${id}`);
	const data = await res.json();*/

	return {
		props: { context },
	};
}

export default function InstagramVideo() {
	const router = useRouter();
	const { id } = router.query;
	const insta = { /* Add your Instagram data here */ };

	useEffect(() => {
		const art = new Artplayer({
			container: ".artplayer-app",
			url: `${'insta.videos[0].url'}`,
			//cover: `${'insta.videos[0].thumbnail'}`,
			fullscreen: false,
			fullscreenWeb: true,
			airplay: true,
			theme: "#cb71ff",
			controls: [
				{
					position: "right",
					html: '<i class="fa-regular fa-download"></i>',
					index: 1,
					tooltip: "Download",
					style: {
						fontSize: "20px",
						marginTop: "-1px",
						color: "white",
						marginRight: "5px",
					},
					click: function () {
						fetch(`${'insta.videos[0].url'}`)
							.then((resp) => resp.blob())
							.then((blob) => {
								const url = window.URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.style.display = "none";
								a.href = url;
								// the filename you want
								a.download = `FaceBook_EZ.mp4`;
								document.body.appendChild(a);
								a.click();
								window.URL.revokeObjectURL(url);
								console.log("File "); // or you know, something with better UX...
							})
							.catch((err) => console.log(err));
					},
				},
			],
		});

		return () => art.destroy();
	}, [insta]);

	return (
		<div>
			<h1 className="title"> Instagram Video Embeder </h1>
			<h2 className="subtitle"> Made by Chance#0002</h2>
			<p className="description">
				This API is designed to be used in Discord EX.
				https://facebookez.com/p/{id}
			</p>

			<div className="artplayer-container">
				<div className="artplayer-app"></div>
			</div>

			<div className="info-container">
				<p className="description">{'insta.videos[0].description'} </p>
				<span className="creator-name">Created by: {'insta.username'}</span>
			</div>
		</div>
	);
}
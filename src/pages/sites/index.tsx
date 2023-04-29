import Link from "next/link";
import BackButton from "@/components/backButton.tsx";

function ContactButton() {
	const handleContactClick = () => {
		window.alert("You can contact me on Discord at Chance#0002");
	};

	return (
		<button
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
			onClick={handleContactClick}
		>
			Contact Me
		</button>
	);
}

export default () => {
	return (
		<div className="h-screen flex flex-col items-center justify-center">
			<BackButton className={"absolute top-0 left-0 m-2"}></BackButton>
			<div className="max-w-screen-lg mx-auto border border-white rounded-sm shadow-lg p-6">
				<div className="flex items-center md:mb-6">
					<div className="flex items-center mb-6">
						<img className="w-16 h-16 mr-4" src="/svg/ezFill.svg" alt="Logo"/>
						<h2 className="text-2xl font-bold">Sites</h2>
					</div>
				</div>
				<div className="max-w-screen-lg mx-auto md:mt-8 text-start">
					<p className={'text-lg'}>Current Sites:</p>
					<ul className="list-disc list-inside md:gap-10 flex flex-col md:flex-row">
						<li><Link href={'https://tiktokez.com'}>TikTokEz</Link></li>
						<li><Link href={'https://instagramez.com'}>InstagramEz</Link></li>
					</ul>
					<hr className="my-8 border-gray-400" />
					<p className={'text-lg'}>Future Plans:</p>
					<ul className="list-disc list-inside md:gap-10 flex flex-col md:flex-row">
						<li>TwitterEz</li>
						<li>FacebookEz</li>
						<li>RedditEz</li>
						<li>Many more to come...</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

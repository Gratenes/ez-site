import Link from "next/link";
import BackButton from "@/components/backButton";
import {Discord} from "@/components/socials";

function ContactButton() {
	const handleContactClick = () => {
		window.open("https://discord.gg/D72MC6D2dZ");
	};

	return (
		<button
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
			onClick={handleContactClick}
		>
			Join Our Server
		</button>
	);
}

export default () => {
	return (
		<div className={' h-screen flex flex-col items-center justify-center'}>
			<BackButton className={"absolute top-0 left-0 m-2"}></BackButton>
			<div className="max-w-screen-lg mx-auto border border-white rounded-sm shadow-lg p-6">
				<div className="flex items-center mb-6">
					<img className="w-16 h-16 mr-4" src="/svg/ezFill.svg" alt="Logo"/>
					<h2 className="text-2xl font-bold">Our Purpose</h2>
				</div>
				<div className="mb-6 text-start">
					<p className={'indent-8'}>Our goal with Ez applications is to make it easier for people to share and view the
						content they love.
						This is done by adding the word "ez" to the end of a URL, and then you can share it with your friends. With
						embed support for
						a wide variety of websites, you can share your favorite content with your friends, and they can view it
						without having to leave Discord.
					</p>
					<hr className="my-8 border-white/75"/>
					<p className={'indent-8'}>
						The idea was stuck in my head for a while and while watching a mutahar video, I heard him complain about how
						people would send him tiktok
						links and that he did not like to open a new tab and login to TikTok giving them valuable data.
						I thought to myself, "Why not make a website that does that for you?" and here we are.
						The website is still in active development, and we are working on adding more websites to the list of
						supported websites. <Link className={'underline'} href={'/status'}>(check status)</Link>
					</p>
				</div>
				<div className="flex justify-between items-center">
					<Discord/>
				</div>
			</div>
		</div>
	);
}

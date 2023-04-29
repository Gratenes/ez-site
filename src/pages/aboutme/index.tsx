import Link from "next/link";
import BackButton from "@/components/backButton.tsx";
import {Github} from "@/components/socials.tsx";

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
		<div className={' h-screen flex flex-col items-center justify-center'}>
			<BackButton className={"absolute top-0 left-0 m-2"}></BackButton>
		<div className="max-w-screen-lg mx-auto border border-white rounded-sm shadow-lg p-6">
			<div className="flex items-center mb-6">
				<img className="w-16 h-16 rounded-full mr-4" src="https://avatars.githubusercontent.com/u/69170374?v=4" alt="Profile" />
				<h2 className="text-2xl font-bold">Chance</h2>
			</div>
			<p className="indent-8 mb-6 text-start">
				I code random things that I think are needed. I'm an aspiring full-stack developer, and have been using React for about 2 years now.
				I'm also a full time college student, and I'm majoring in Computer Science. When I'm not coding, I'm driving my car around, which is a
				japanese import, or I'm playing video games.
			</p>
			<div className="flex justify-between items-center">
				<Github/>
				<ContactButton />
			</div>
		</div>
		</div>
	);
}
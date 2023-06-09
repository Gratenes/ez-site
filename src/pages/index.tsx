import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import Head from "next/head";
import anime from 'animejs/lib/anime';
import Link from "next/link";
import {Discord, Github} from "@/components/socials";

const infoHeight = `auto`;

export function CurrentSupport () {
  const entries = [
    {
      category: "TikTok",
      link: "tiktokez.com",
      items: [
        { type: "Video Embed", text: "🟢" },
        {
          type: "Picture Embed",
          text: "🟢",
        },
        { type: "Render Video", text: "🟢" },
      ],
    },
    {
      category: "InstagramEz",
      link: "instagramez.com",
      items: [
        { type: "Video Embed", text: "🟢" },
        {
          type: "Picture Embed",
          text: "🟢",
        },
        {
          type: "Render Video",
          text: "🔴",
        },
      ],
    },
    {
      category: "Twitter",
      link: "twitterez.com",
      items: [
        { type: "Video Embed", text: "🟢" },
        {
          type: "Picture Embed",
          text: "🟢",
        },
        {
          type: "Render Video",
          text: "🟡",
        },
      ],
    },
    {
      category: "Reddit",
      link: "redditez.com",
      items: [
        { type: "Video Embed", text: "🔴" },
        {
          type: "Picture Embed",
          text: "🔴",
        },
        {
          type: "Render Video",
          text: "🔴",
        },
      ],
    },
    {
      category: "Facebook",
      link: "facebookez.com",
      items: [
        { type: "Video Embed", text: "🔴" },
        {
          type: "Picture Embed",
          text: "🔴",
        },
        {
          type: "Render Video",
          text: "🔴",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-row flex-wrap gap-2 justify-evenly">
      {entries.map((category) => (
        <div
          key={category.category}
          className="flex flex-col bg-background rounded p-2 border border-primary"
        >
          <h2>{category.category}</h2>
          <ul>
            {category.items.map((item, index) => (
              <li key={index}>
                <strong>{item.type}: </strong>
                <p>{item.text}</p>
              </li>
            ))}
            <li key={99}>
              <a
                href={`https://${category.link}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {category.link}
              </a>
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
}


export default function Home() {
  const [hostname, setHostname] = useState<string>('');

	/* Animate the cards */
	useEffect(() => {
		const element = document.querySelectorAll<HTMLDivElement>('#tiles');

		element.forEach(function (card) {
			card.style.opacity = '0';
			const observer = new IntersectionObserver(function (entries) {
				if (entries[ 0 ].isIntersecting) {
					anime({
						targets: card,
						translateY: ['50%', 0],
						scale: [1, 1],
						opacity: [0, 1],
						duration: 500,
						easing: 'easeInOutQuad'
					});

					observer.disconnect();
				}
			}, {threshold: 0.5});

			observer.observe(card);
		});
	}, [])

	/* Handle Cards 3d Hover */
	useEffect(() => {
		const cards = document.querySelectorAll<HTMLDivElement>('div #card');

		cards.forEach((card: HTMLDivElement, index) => {
			const height = card.clientHeight;
			const width = card.clientWidth;

			function handleMove(e: any) {
				const xVal = e.layerX;
				const yVal = e.layerY - (index * 100);
				const yRotation = 10 * ((xVal - width / 2) / width);
				const xRotation = -10 * ((yVal - height / 2) / height);
				card.style.transform = `perspective(500px) scale(1) rotateX(${xRotation}deg) rotateY(${yRotation}deg) translate(0px, ${(index * 100) - 100}px)`;
			}

			card.style.transform = `perspective(500px) scale(1) rotateX(${0}deg) rotateY(${0}deg) translate(0px, ${(index * 100) - 100}px)`;
			card.style.transition = `transform 300ms easeOut`;

			card.addEventListener('mousemove', handleMove);
		});

		// Cleanup function to remove the event listeners when the component unmounts
		return () => {
			cards.forEach((card) => {
				card.removeEventListener('mousemove', () => {

				});
			});
		};
	}, []);

	/* Adds the random lines that look cool + animate them */
	const swagLinesRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const svg1 = axios.get(
			'/svg/randomLines.svg'
		)

		Promise.all([svg1]).then((res) => {

			if (swagLinesRef.current === null) return;
			swagLinesRef.current.id = 'randomLines';
			swagLinesRef.current.innerHTML = res[0].data;

			const container = document.getElementById('randomLines') as HTMLDivElement;
			const path = document.querySelectorAll<SVGElement>('#randomLines path');

			function getScrollPercent(element: HTMLElement, offset = 0): number {
				const rect = element.getBoundingClientRect();
				let scrollTop = window.scrollY || document.documentElement.scrollTop;
				const scrollDistance = (rect.top + scrollTop + rect.height - window.innerHeight);

				scrollTop -= offset;

				if (scrollDistance <= 0) {
					return 0;
				}

				const scrollPercent = (scrollTop / scrollDistance) * 100;

				return Math.round(scrollPercent * 100) / 100;
			}

			// Logic for animation!!!
			const animateSvgLines = (paths: NodeListOf<SVGElement>, duration: number, delay: number) => {
				const timeline = anime.timeline({
					autoplay: false,
					loop: false
				});

				timeline.add({
					targets: paths,
					strokeDashoffset: [anime.setDashoffset, 0],
					easing: 'linear',
					duration: duration,
					delay: (el, i) => (i * 5) + 100,
					opacity: 1
				});

				return timeline;
			};

			const animateOnScroll = (timeline: anime.AnimeTimelineInstance, container: HTMLDivElement, speed?: number, pxToSubtract?: number) => {
				const scrollPercent = getScrollPercent(container, pxToSubtract);
				timeline.seek((scrollPercent / (speed ?? 100)) * timeline.duration);
			};

			const animateSvgGroups = async () => {
				const timeline1 = animateSvgLines(path, 750, 15);

				window.addEventListener('scroll', () => {
					animateOnScroll(timeline1, container);
				});
			};

			animateSvgGroups();
		})
	}, [])

  /* Set Title SVG + animate it */
	const titleRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		try {
			const url = new URL(window.location.href);
			const hostnameLocal = url.hostname.split('.').slice(-2).join('.'); // extracts example.com
      setHostname(hostnameLocal);

			const svg1 = axios.get(`/svg/${hostnameLocal}.svg`);

			Promise.all([svg1]).then((res) => {
				if (titleRef.current === null) return;
				titleRef.current.innerHTML = res[0].data;

				const path = document.querySelectorAll<SVGElement>('#title path');

				anime({
					targets: path,
					//strokeDashoffset: [anime.setDashoffset, 0],
					easing: 'easeOutQuart',
					duration: 750,
					delay: function (el, i) {
						return i * 150;
					},
					opacity: [0,1],
					direction: 'normal',
					loop: false
				});
			})
		} catch (e) {
			console.log(e)
		}
	}, [])

	return (
    <>
      <Head>
        <link rel="icon" href="/svg/Ezfill.svg" />
        <title>Ez Embed</title>

        <meta name="title" content="Ez Embed" />
        <meta
          name="description"
          content="Ez Embed is a tool that allows you to embed many websites almost instantly"
        />
        <meta name="og:image" content="/api/landingImage" />

        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className={`m-0`}>
        <div className="flex flex-col w-full h-screen items-center justify-center">
          <div className="w-fit z-10 backdrop-blur-sm bg-background bg-opacity-10 p-4 rounded-token">
            <div className="space-y-1">
              <label
                htmlFor="searchBar"
                className="text-3xl md:text-7xl w-full flex items-center justify-center"
              >
                <div
                  id={"title"}
                  className="w-full flex items-center justify-center h-full"
                  ref={titleRef}
                ></div>
              </label>
              <div className="relative">
                <input
                  className="block outline-none border-0 text-background border-gray-200 rounded md:pr-12 pl-3 py-2 leading-6 w-full focus:border-0 focus:ring focus:ring-blue-500 focus:ring-opacity-0"
                  type="text"
                  id="searchBar"
                  name="append_alt_normal"
                  placeholder={`Paste your ${hostname.replace(
                    "ez",
                    ""
                  )} link here`}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  // only change location.href = e.target.value; if the user presses enter or pastes a link
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === "Enter") {
                      window.location.href = target.value;
                    } else if (e.key === "v" && e.ctrlKey) {
                      target.value = "";
                      setTimeout(() => {
                        window.location.href += target.value;
                      }, 0);
                    }
                  }}
                />

                <div
                  id="searchButton"
                  className="absolute inset-y-0 right-0 w-10 my-px mr-px flex items-center justify-center rounded-r text-gray-500 bg-primary border-l border-gray-200"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.5 7.00002C11.5 7.59096 11.3836 8.17613 11.1574 8.72209C10.9313 9.26806 10.5998 9.76413 10.182 10.182C9.7641 10.5998 9.26803 10.9313 8.72206 11.1575C8.1761 11.3836 7.59094 11.5 6.99999 11.5C6.40904 11.5 5.82388 11.3836 5.27791 11.1575C4.73195 10.9313 4.23587 10.5998 3.81801 10.182C3.40014 9.76413 3.06868 9.26806 2.84253 8.72209C2.61638 8.17613 2.49999 7.59096 2.49999 7.00002C2.49999 5.80654 2.97409 4.66195 3.81801 3.81804C4.66192 2.97412 5.80651 2.50002 6.99999 2.50002C8.19346 2.50002 9.33805 2.97412 10.182 3.81804C11.0259 4.66195 11.5 5.80654 11.5 7.00002ZM10.68 11.74C9.47437 12.676 7.95736 13.1173 6.43779 12.9741C4.91822 12.831 3.51033 12.1141 2.50074 10.9694C1.49114 9.82473 0.955743 8.33831 1.00352 6.81277C1.05131 5.28722 1.67869 3.83722 2.75794 2.75797C3.8372 1.67872 5.28719 1.05134 6.81274 1.00355C8.33829 0.955771 9.8247 1.49117 10.9694 2.50077C12.1141 3.51036 12.831 4.91825 12.9741 6.43782C13.1173 7.95738 12.676 9.47439 11.74 10.68L14.78 13.72C14.8537 13.7887 14.9128 13.8715 14.9538 13.9635C14.9948 14.0555 15.0168 14.1548 15.0186 14.2555C15.0204 14.3562 15.0018 14.4562 14.9641 14.5496C14.9264 14.643 14.8702 14.7278 14.799 14.799C14.7278 14.8703 14.643 14.9264 14.5496 14.9641C14.4562 15.0018 14.3562 15.0204 14.2555 15.0186C14.1548 15.0168 14.0554 14.9948 13.9635 14.9538C13.8715 14.9128 13.7887 14.8537 13.72 14.78L10.68 11.74Z"
                      fill="#24292F"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="rounded-token">
              <div className="container xl:max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-2 lg:grid-cols-6 lg:gap-5 gap-2 text-center text-primary">
                  <Github />

                  <Discord />
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:flex md:h-1/2 flex-col md:flex-row items-center w-full justify-evenly overflow-x-clip ">
            <div
              id="card"
              className="w-fit aspect-square h-[24rem] rounded-3xl overflow-clip bg-primary rotate-3 border "
              style={{
                filter: "drop-shadow(0px 0px 25px rgba(255, 255, 255, 1))",
              }}
            >
              <div className="inline-flex items-center p-2 w-full">
                <img
                  className="h-10 w-10 rounded-full mr-2"
                  src="/pic/lacyIcon.png"
                  alt={"Icon Image"}
                />{" "}
                <span className="text-2xl text-gray-600">steve.lacy</span>
              </div>
              <img
                className="rounded-b-3xl w-full h-full"
                src="/pic/lacyCover.png"
                alt={"Cover Image"}
              />
            </div>

            <div
              id="card"
              className="w-fit aspect-square h-[24rem]  rounded-3xl overflow-clip bg-primary -rotate-3 border "
              style={{
                filter: "drop-shadow(0px 0px 25px rgba(255, 255, 255, 1))",
              }}
            >
              <div className="inline-flex items-center p-2 w-full">
                <img
                  className="h-10 w-10 rounded-full mr-2"
                  src="/pic/jeffIcon.png"
                  alt={"Icon Image"}
                />{" "}
                <span className="text-2xl text-gray-600">jeffreyjkieffer</span>
              </div>
              <img
                className="rounded-b-3xl w-full h-full"
                src="/pic/jeffCover.png"
                alt={"Cover Image"}
              />
            </div>

            <div
              id="card"
              className="w-fit aspect-square h-[24rem]  rounded-3xl overflow-clip bg-primary scale-110 rotate-3 border "
              style={{
                filter: "drop-shadow(0px 0px 25px rgba(255, 255, 255, 1))",
              }}
            >
              <div className="inline-flex items-center p-2 w-full">
                <img
                  className="h-10 w-10 rounded-full mr-2"
                  src="/pic/familyIcon.png"
                  alt={"Icon Image"}
                />{" "}
                <span className="text-2xl text-gray-600">crap.content</span>
              </div>
              <img
                className="rounded-b-3xl w-full h-full"
                src="/pic/familyMan.png"
                alt={"Cover Image"}
              />
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 mx-auto max-w-[100vw] -z-10 h-screen overflow-hidden flex justify-center items-end">
          <div className="landingSvg h-fit"></div>
        </div>

        <div
          id="infoBigContainer"
          style={{
            height: infoHeight,
          }}
          className={`relative w-full h-fit overflow-x-clip`}
        >
          <div
            id="randomLines"
            ref={swagLinesRef}
            className="absolute top-0 left-0 h-full w-full flex justify-center"
          ></div>
          <div
            style={
              {
                //height: infoHeight, min-h-[${infoHeight}]
              }
            }
            className={` w-full flex flex-col justify-evenly md:gap-[50vh] my-1`}
          >
            <div
              id="tiles"
              className="flex m-3.5 justify-between items-center border border-primary rounded-md p-4 backdrop-blur-sm opacity-1 md:mr-[10vw] flex-col md:flex-row"
            >
              <div className="w-full aspect-video max-w-[650px] overflow-clip rounded-token">
                <video src="/easeOfUseAnimation2.mkv" muted autoPlay loop />
              </div>
              <div className="max-w-screen-lg md:w-2/3 md:ml-4 flex flex-col">
                <h2 className="text-2xl font-bold text-primary mb-2 text-center">
                  Easy To Use
                </h2>
                <p className="text-gray-400 text-center">
                  With our application, you can seamlessly embed TikTok videos
                  directly from Discord without having to leave the platform.
                  Our innovative solution streamlines the process and saves you
                  time and energy. Check out our handy animation that
                  demonstrates how to use our application by adjusting the
                  TikTok URL to tiktokez.com. With just a few simple steps,
                  you'll be able to embed your favorite videos into TikTok like
                  a pro! Try it out today and see how easy it can be.
                </p>
                <button
                  onClick={() => {
                    const searchBar = document.getElementById("searchBar");
                    window.scrollTo({
                      top: searchBar?.offsetTop,
                      behavior: "smooth",
                    });
                    searchBar?.focus();
                  }}
                  className="rounded-token px-4 py-2 mt-4 hover:bg-gray-200 transition duration-300 ease-in-out text-primary hover:text-black"
                >
                  Give It A Try
                </button>
              </div>
            </div>
            <div
              id="tiles"
              className="flex m-3.5 justify-between items-center border border-primary rounded-md p-4 backdrop-blur-sm opacity-1 md:ml-[10vw] flex-col md:flex-row"
            >
              <div className="w-full aspect-[5/4] max-w-[500px] overflow-auto md:overflow-visible">
                <CurrentSupport />
              </div>
              <div className="max-w-screen-lg md:w-2/3 md:ml-4 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Wide Coverage Of Platforms
                </h2>
                <p className="text-gray-400">
                  With our wide coverage of platforms, you can conveniently use
                  a single embed code to showcase all your favorite videos from
                  various sources. Whether you want to share captivating moments
                  from Twitter, engaging content from Instagram, or entertaining
                  clips from TikTok, we've got you covered.
                  <br />
                  <br />
                  Our platform provides seamless support for downloading and
                  embedding videos from Twitter, Instagram, and TikTok, ensuring
                  you can easily access and showcase your preferred content on
                  your website, blog, or any other online platform.
                  <br />
                  <br />
                  Say goodbye to the hassle of searching for different embed
                  codes or downloading videos separately from each platform. Our
                  service streamlines the process, allowing you to save time and
                  effort while presenting a diverse range of videos to your
                  audience.
                </p>
                <button className="rounded-token px-4 py-2 mt-4 hover:bg-gray-200 transition duration-300 ease-in-out text-white hover:text-black">
                  Learn More
                </button>
              </div>
            </div>
            <div
              id="tiles"
              className="flex m-3.5 justify-between items-center border border-primary rounded-md p-4 backdrop-blur-sm opacity-1 md:mr-[10vw] flex-col md:flex-row"
            >
              <div className="w-full aspect-video max-w-[650px] overflow-clip rounded-token">
                <video src="/easyTouse.mkv" muted autoPlay loop />
              </div>
              <div className="max-w-screen-lg md:w-2/3 md:ml-4 flex flex-col">
                <h2 className="text-2xl font-bold text-primary mb-2 text-center">
                  Download Media For Free
                </h2>
                <p className="text-gray-400 text-center">
                  We are more then just a embed generator. We also allow you to
                  download your favorite content in different ways never seen
                  before. Complex rendering of TikTok videos, Instagram posts,
                  and Twitter tweets are all supported. Allowing you to download
                  your favorite content in different ways never seen before.
                  <br />
                  <br />
                  The downloading process is simple and straightforward. All you
                  need to do is copy the URL of the video you want to download
                  and paste it into our search bar. Our platform will
                  automatically generate a download link for you to use within
                  seconds.
                </p>
                <button
                  onClick={() => {
                    const searchBar = document.getElementById("searchBar");
                    window.scrollTo({
                      top: searchBar?.offsetTop,
                      behavior: "smooth",
                    });
                    searchBar?.focus();
                  }}
                  className="rounded-token px-4 py-2 mt-4 hover:bg-gray-200 transition duration-300 ease-in-out text-primary hover:text-black"
                >
                  Give It A Try
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background text-white py-6 relative max-h-fit flex flex-col items-center">
          <div
            className={
              "from-transparent to-background bg-gradient-to-b backdrop-filter absolute backdrop-blur-sm -top-4 left-0 w-full h-4"
            }
          ></div>
          <div
            className={"flex flex-col items-center justify-center mb-5 w-fit"}
          >
            <ul className="flex md:gap-16 gap-10 flex-row p-2">
              <li>
                <Link href="/sites" className="hover:text-purple-400">
                  Sites
                </Link>
              </li>
              <li>
                <Link href="/purpose" className="hover:text-purple-400">
                  Purpose
                </Link>
              </li>
              <li>
                <Link href="/aboutme" className="hover:text-purple-400">
                  About Me
                </Link>
              </li>
            </ul>
            <hr className={"bg-primary w-full"} />
          </div>
          <div className="max-w-screen-lg mx-auto flex md:flex-row flex-wrap justify-evenly gap-4 md:gap-0 md:justify-evenly w-full items-center px-6">
            <Discord />
            <Github />
            <div className="text-sm">&copy; 2023 Chance</div>
          </div>
        </div>
      </main>
    </>
  );
}

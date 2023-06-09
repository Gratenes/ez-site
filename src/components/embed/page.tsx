import { motion, AnimatePresence } from "framer-motion";

import CountUpNumber from "@/components/countUpNumber";
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";

import { embedFetch, embedMedia } from "@/utils/types";

function EnlargeCard({ data }: { data: embedMedia }) {
  const [displayed, setDisplayed] = useState(false);

  const screenStyles = displayed
    ? "top-0 left-0 h-screen md:h-auto object-contain"
    : "md:max-h-[500px] md:max-w-[350px] w-full object-contain";

  return (
    <motion.button
      whileHover={
        {
          //scale: displayed ? 1 : 1.01,
        }
      }
      onDoubleClick={() => {
        console.log("double click");
        if (data.type !== "video") setDisplayed(!displayed);
      }}
      onTap={() => {
        console.log("tap");
        if (data.type !== "video") setDisplayed(!displayed);
      }}
    >
      {data.type === "video" ? (
        <motion.video
          initial={{ opacity: 0, zIndex: 1 }}
          animate={{ opacity: 1, zIndex: 50 }}
          exit={{ opacity: 0, zIndex: 1 }}
          //transition={{ duration: .5 }}
          controls
          layout
          loop
          className={`${screenStyles}`}
          src={data.url}
        />
      ) : data.type === "photo" ? (
        <motion.img
          id={data.url}
          initial={{ opacity: 0, zIndex: 1 }}
          animate={{ opacity: 1, zIndex: 50 }}
          exit={{ opacity: 0, zIndex: 1 }}
          layout
          //transition={{ duration: .5 }}
          src={data.url}
          className={screenStyles}
        />
      ) : (
        <motion.video
          initial={{ opacity: 0, zIndex: 1 }}
          animate={{ opacity: 1, zIndex: 50 }}
          exit={{ opacity: 0, zIndex: 1 }}
          //transition={{ duration: .5 }}
          controls
          layout
          loop
          className={``}
          src={data.url}
        />
      )}
    </motion.button>
  );
}

export default (preload: any) => {
  const { data }: { data: embedFetch } = preload;

  function downloadMedia(num?: number) {
    if (num) {
      const doc = data.content.media.at(num);
      if (!doc) return;
      setTimeout(async () => {
        const response = await fetch(doc.url);
        if (!response.ok) return;

        const contentType = response.headers.get("content-type");
        const blob = await response.blob();
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `${data.user.name}-${num}.${
          contentType?.split("/")[1]
        }`;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(anchor.href), 100);
      }, 1000); // 1-second delay for each download
    } else {
      const media = data.content.media;
      media.forEach((doc, index) => {
        setTimeout(async () => {
          const response = await fetch(doc.url);
          if (!response.ok) return;

          const contentType = response.headers.get("content-type");
          const blob = await response.blob();
          const anchor = document.createElement("a");
          anchor.href = URL.createObjectURL(blob);
          anchor.download = `${data.user.name}-${index}.${
            contentType?.split("/")[1]
          }`;
          anchor.style.display = "none";
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          setTimeout(() => URL.revokeObjectURL(anchor.href), 100);
        }, index * 1000); // 1-second delay for each download
      });
    }
  }

  const router = useRouter();
  const { n } = router.query;

  const displayed = (Number(n) ?? 1) - 1;

  return (
    <>
      {data && (
        <Head>
          <link rel="icon" href="/svg/Ezfill.svg" />
          <meta name="theme-color" content="#2b2d31" />
          <meta property="og:site_name" content="Made by Chance#0002" />
          <meta
            name="twitter:title"
            content={`${data.user.displayName || "Unknown"} ${
              data.user.name ? `(@${data.user.name})` : ""
            }`}
          />
          <meta name="twitter:description" content={data.content.text || ""} />
          {
            data.content.generatedMedia?.at(displayed)?.type === "video" ? <>
              <meta name="twitter:card" content="player" />
              <meta name="twitter:player:width" content="480" />
              <meta name="twitter:player:height" content="720" />
              <meta
                name="twitter:player:stream"
                content={data.content.generatedMedia?.at(displayed)?.url}
              />
              <meta
                name="twitter:player:stream:content_type"
                content="video/mp4"
              />
            </>
          :
          data.content.media?.at(displayed)?.type === "video" ? (
            <>
              <meta name="twitter:card" content="player" />
              <meta name="twitter:player:width" content="480" />
              <meta name="twitter:player:height" content="720" />
              <meta
                name="twitter:player:stream"
                content={data.content.media?.at(displayed)?.url}
              />
              <meta
                name="twitter:player:stream:content_type"
                content="video/mp4"
              />
            </>
          ) : 
          data.content.media?.at(displayed)?.type === "photo" && (
            <>
              <meta name="twitter:card" content="summary_large_image"></meta>
              <meta
                name="twitter:image"
                content={data.content.media?.at(displayed)?.url}
              />
              <meta
                name="twitter:description"
                content={data.content.text || ""}
              />
              <meta
                name="twitter:url"
                content="https://your-domain.com/page-url"
              ></meta>
            </>
          )}

          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
      )}

      <motion.div layout className="min-h-screen flex flex-col">
        <motion.div
          layout
          className="flex flex-row gap-4 md:gap-0 justify-center items-center max-w-screen flex-wrap h-full grow"
        >
          <motion.div
            layout
            className="w-fit rounded-[26px] border border-solid border-white overflow-clip flex flex-col md:flex-row md:w-3/5"
          >
            <motion.div layout id="user+text" className="flex-shrink-0">
              <motion.div layout className="flex flex-row gap-4 p-2">
                {/* Make sure the image is always square with rounded corners */}
                <img
                  src={data?.user?.pictures.url}
                  className="rounded-full w-[69px] h-[69px]"
                ></img>
                <motion.div
                  layout
                  className="flex flex-col text-start justify-center"
                >
                  <p className="text-[#ffffff] text-[18px] font-bold">
                    {data?.user?.displayName || "Unknown"}
                  </p>
                  <p className="text-[#ffffff] text-[18px]">
                    {data?.user?.name ? `(@${data?.user?.name})` : ""}
                  </p>
                </motion.div>
              </motion.div>

              {data?.content?.text && (
                <motion.div layout className="max-w-full p-2">
                  <motion.p
                    layout
                    className="text-[#ffffff] text-[18px] text-start max-w-[350px] break-after-all break-words"
                  >
                    {data?.content?.text}
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
            <motion.div
              layout
              className="bg-white md:w-[1px] md:h-auto w-full h-[1px]"
            ></motion.div>
            <motion.div layout id="video+stats" className="grow">
              <motion.div
                layout
                className="flex flex-row flex-wrap justify-center"
              >
                {data?.content?.media?.map((entry: embedMedia, index) =>
                  EnlargeCard({ data: entry })
                )}
              </motion.div>

              <hr className="bg-white"></hr>

              <motion.div
                layout
                className="pt-[17px] pr-4 pb-[17px] pl-4 flex flex-row flex-wrap gap-5 items-center justify-center h-[63px] overflow-hidden"
              >
                <motion.div
                  layout
                  className="flex flex-row gap-2 items-center justify-center shrink-0 h-[22px] relative"
                >
                  <motion.div
                    layout
                    className="text-[#ffffff] text-center relative h-[17px] flex items-center justify-center"
                    style={{ font: "400 12px 'Inter', sans-serif" }}
                  >
                    <CountUpNumber
                      num={data?.content.statistics.views as number}
                    />
                  </motion.div>

                  <motion.div
                    layout
                    className="shrink-0 w-6 h-6 relative overflow-hidden"
                  >
                    <svg
                      className=" overflow-visible"
                      style={{}}
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.75 15.58V0.330017H6.75V15.58H4.75ZM14 15.58V4.98974H16V15.58H14ZM0 15.58L0.00400019 7.10779H2.004L2 15.58H0ZM9.248 15.58V9.64946H11.248V15.58H9.248Z"
                        fill="white"
                      />
                    </svg>
                  </motion.div>
                </motion.div>

                <motion.div
                  layout
                  className="flex flex-row gap-2 items-center justify-center shrink-0 h-[22px] relative"
                >
                  <motion.div
                    layout
                    className="text-[#ffffff] text-center relative h-[17px] flex items-center justify-center"
                    style={{ font: "400 12px 'Inter', sans-serif" }}
                  >
                    <CountUpNumber
                      num={data?.content.statistics.comments as number}
                    />
                  </motion.div>

                  <motion.div
                    layout
                    className="shrink-0 w-6 h-6 relative overflow-hidden"
                  >
                    <svg
                      className="overflow-visible"
                      style={{}}
                      viewBox="0 0 18 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.532135 7.32748C0.532135 3.73763 3.443 0.830017 7.03366 0.830017H10.5796C14.2263 0.830017 17.1819 3.78636 17.1819 7.43306C17.1819 9.83712 15.8767 12.0463 13.774 13.2077L7.23264 16.83V13.8331H7.17823C3.53153 13.9143 0.532135 10.9823 0.532135 7.32748ZM7.03366 2.45438C4.33965 2.45438 2.1565 4.63915 2.1565 7.32748C2.1565 10.0645 4.40625 12.2656 7.14168 12.2087L7.42675 12.2006H8.85701V14.0686L12.9886 11.7864C14.5731 10.9092 15.5575 9.24423 15.5575 7.43306C15.5575 4.67976 13.3289 2.45438 10.5796 2.45438H7.03366Z"
                        fill="white"
                      />
                    </svg>
                  </motion.div>
                </motion.div>

                <motion.div
                  layout
                  className="flex flex-row gap-2 items-center justify-center shrink-0 h-[22px] relative"
                >
                  <motion.div
                    layout
                    className="text-[#ffffff] text-center relative h-[17px] flex items-center justify-center"
                    style={{ font: "400 12px 'Inter', sans-serif" }}
                  >
                    <CountUpNumber
                      num={data?.content.statistics.shares as number}
                    />
                  </motion.div>

                  <motion.div
                    layout
                    className="shrink-0 w-6 h-6 relative overflow-hidden"
                  >
                    <svg
                      className="absolute left-[0.07px] top-[3.88px] overflow-visible"
                      style={{}}
                      viewBox="0 0 24 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.4345 0.460022L8.80101 4.53884L7.45716 5.97726L5.41972 4.07579V12.4009C5.41972 13.4847 6.30248 14.3714 7.39017 14.3714H12.8089V16.3418H7.39017C5.21381 16.3418 3.44928 14.5782 3.44928 12.4009V4.07579L1.41184 5.97726L0.0680008 4.53884L4.4345 0.460022ZM16.2572 2.54869H10.8384V0.578248H16.2572C18.4335 0.578248 20.198 2.34179 20.198 4.51913V12.8443L22.2355 10.9428L23.5793 12.3812L19.2128 16.46L14.8463 12.3812L16.1902 10.9428L18.2276 12.8443V4.51913C18.2276 3.43539 17.3448 2.54869 16.2572 2.54869Z"
                        fill="white"
                      />
                    </svg>
                  </motion.div>
                </motion.div>

                <motion.div
                  layout
                  className="flex flex-row gap-2 items-center justify-center shrink-0 h-[22px] relative"
                >
                  <motion.div
                    layout
                    className="text-[#ffffff] text-center relative h-[17px] flex items-center justify-center"
                    style={{ font: "400 12px 'Inter', sans-serif" }}
                  >
                    <CountUpNumber
                      num={data?.content.statistics.likes as number}
                    />
                  </motion.div>

                  <motion.div
                    layout
                    className="shrink-0 w-6 h-6 relative overflow-hidden"
                  >
                    <svg
                      className="absolute left-0.5 top-[3.5px] overflow-visible"
                      style={{}}
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.697 2.08001C13.475 2.02001 12.018 2.59001 10.807 4.24001L10.002 5.33001L9.196 4.24001C7.984 2.59001 6.526 2.02001 5.304 2.08001C4.061 2.15001 2.955 2.86001 2.394 3.99001C1.842 5.11001 1.761 6.77001 2.873 8.81001C3.947 10.78 6.13 13.08 10.002 15.42C13.872 13.08 16.054 10.78 17.128 8.81001C18.239 6.77001 18.158 5.11001 17.605 3.99001C17.044 2.86001 15.939 2.15001 14.697 2.08001ZM18.884 9.77001C17.533 12.25 14.883 14.89 10.505 17.44L10.002 17.74L9.498 17.44C5.119 14.89 2.469 12.25 1.116 9.77001C-0.244 7.27001 -0.294 4.91001 0.602 3.10001C1.489 1.31001 3.249 0.190014 5.203 0.0900136C6.854 1.36411e-05 8.571 0.650014 10.001 2.10001C11.43 0.650014 13.147 1.36411e-05 14.797 0.0900136C16.751 0.190014 18.511 1.31001 19.398 3.10001C20.294 4.91001 20.244 7.27001 18.884 9.77001Z"
                        fill="white"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            layout
            id="buttons-alot"
            className="flex flex-col w-full md:w-2/5 gap-4 md:px-4"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="rounded-[26px] border-solid border-[#ffffff] border pt-5 pr-[61px] pb-5 pl-[61px] flex flex-row gap-2.5 items-center justify-center w-full h-[75px]"
              onClick={() => downloadMedia()}
            >
              <motion.div
                layout
                className="text-[#ffffff] text-center relative flex items-center justify-center"
                style={{ font: "400 24px 'Inter', sans-serif" }}
              >
                DOWNLOAD ALL
              </motion.div>

              <svg
                className="shrink-0 relative overflow-visible"
                style={{}}
                width="31"
                height="31"
                viewBox="0 0 31 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5 20.5L14.7929 21.2071L15.5 21.9142L16.2071 21.2071L15.5 20.5ZM16.5 5.5C16.5 4.94772 16.0523 4.5 15.5 4.5C14.9477 4.5 14.5 4.94772 14.5 5.5L16.5 5.5ZM7.29289 13.7071L14.7929 21.2071L16.2071 19.7929L8.70711 12.2929L7.29289 13.7071ZM16.2071 21.2071L23.7071 13.7071L22.2929 12.2929L14.7929 19.7929L16.2071 21.2071ZM16.5 20.5L16.5 5.5L14.5 5.5L14.5 20.5L16.5 20.5Z"
                  fill="white"
                />
                <path d="M6.75 26.75H24.25" stroke="white" strokeWidth="2" />
              </svg>
            </motion.button>
            {data?.content.media.length > 1 &&
              data?.content.media.map((media, index) => {
                return (
                  <motion.button
                    key={index}
                    whileHover={{
                      scale: 1.01,
                    }}
                    style={{
                      backgroundAttachment: "fixed",
                      backgroundPosition: "center",
                      background: `url(${media.thumbnail || media.url})`,
                      backgroundSize: "cover",
                    }}
                    whileTap={{ scale: 0.99 }}
                    className={`rounded-[26px] border-solid showImage border-[#ffffff] border pt-5 pr-[61px] pb-5 pl-[61px] flex flex-row gap-2.5 items-center justify-center w-full h-[75px]`}
                    onClick={() => downloadMedia(index)}
                  >
                    <motion.div
                      layout
                      className="text-[#ffffff] text-center relative flex items-center justify-center uppercase"
                      style={{ font: "400 24px 'Inter', sans-serif" }}
                    >
                      {media.type} {index}{" "}
                      <svg
                        className="shrink-0 relative overflow-visible"
                        style={{}}
                        width="31"
                        height="31"
                        viewBox="0 0 31 31"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.5 20.5L14.7929 21.2071L15.5 21.9142L16.2071 21.2071L15.5 20.5ZM16.5 5.5C16.5 4.94772 16.0523 4.5 15.5 4.5C14.9477 4.5 14.5 4.94772 14.5 5.5L16.5 5.5ZM7.29289 13.7071L14.7929 21.2071L16.2071 19.7929L8.70711 12.2929L7.29289 13.7071ZM16.2071 21.2071L23.7071 13.7071L22.2929 12.2929L14.7929 19.7929L16.2071 21.2071ZM16.5 20.5L16.5 5.5L14.5 5.5L14.5 20.5L16.5 20.5Z"
                          fill="white"
                        />
                        <path
                          d="M6.75 26.75H24.25"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    </motion.div>
                  </motion.button>
                );
              })}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

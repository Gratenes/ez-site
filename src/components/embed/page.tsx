import { motion, AnimatePresence, MotionProps } from "framer-motion";

import CountUpNumber from "@/components/countUpNumber";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Head from "next/head";

import { embedFetch, embedMedia } from "@/utils/types";
import { JsxElement } from "typescript";
import { AlertContext } from "../alert";
import { embedFetchError } from "@/utils/requestData";

const svgs = {
  tiktok: {
    like: (
      <svg viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24.8952 4.50846C24.5073 3.62621 23.948 2.82672 23.2486 2.15475C22.5486 1.48077 21.7234 0.945175 20.8177 0.577078C19.8786 0.193869 18.8713 -0.0022792 17.8544 1.99806e-05C16.4277 1.99806e-05 15.0358 0.383778 13.8262 1.10865C13.5368 1.28206 13.2619 1.47251 13.0014 1.68003C12.741 1.47251 12.4661 1.28206 12.1767 1.10865C10.9671 0.383778 9.57511 1.99806e-05 8.14844 1.99806e-05C7.12113 1.99806e-05 6.12564 0.19332 5.18514 0.577078C4.27647 0.946623 3.45751 1.4782 2.75431 2.15475C2.05399 2.82596 1.49455 3.62564 1.10771 4.50846C0.705463 5.42664 0.5 6.40167 0.5 7.40512C0.5 8.35173 0.696782 9.33813 1.08745 10.3416C1.41446 11.1802 1.88326 12.05 2.48229 12.9284C3.43147 14.3184 4.7366 15.7682 6.35715 17.2379C9.04264 19.674 11.7021 21.3569 11.815 21.4251L12.5008 21.8572C12.8047 22.0476 13.1953 22.0476 13.4992 21.8572L14.185 21.4251C14.2979 21.354 16.9544 19.674 19.6428 17.2379C21.2634 15.7682 22.5685 14.3184 23.5177 12.9284C24.1167 12.05 24.5884 11.1802 24.9125 10.3416C25.3032 9.33813 25.5 8.35173 25.5 7.40512C25.5029 6.40167 25.2974 5.42664 24.8952 4.50846Z"
          fill="#F7F7F7"
        />
      </svg>
    ),
    comment: (
      <svg viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.0642 3.38362C18.1863 1.49065 15.7078 0.313155 13.056 0.0541435C10.4041 -0.204868 7.74516 0.470834 5.53745 1.96476C3.32975 3.45868 1.71166 5.67721 0.96216 8.23786C0.212657 10.7985 0.378705 13.5408 1.43168 15.992C1.54142 16.2198 1.57743 16.4763 1.53468 16.7256L0.527518 21.5741C0.488715 21.7599 0.496639 21.9526 0.550577 22.1346C0.604516 22.3167 0.702778 22.4825 0.836534 22.6171C0.946183 22.7261 1.07674 22.8118 1.22033 22.8689C1.36392 22.926 1.51757 22.9535 1.67202 22.9495H1.90092L6.7994 21.9638C7.04836 21.9338 7.30083 21.9693 7.53188 22.0669C9.97941 23.1215 12.7176 23.2878 15.2744 22.5371C17.8313 21.7865 20.0465 20.166 21.5382 17.955C23.0299 15.744 23.7046 13.0811 23.4459 10.4253C23.1873 7.76946 22.0116 5.28724 20.1214 3.40655L20.0642 3.38362ZM7.39454 12.6336C7.16818 12.6336 6.9469 12.5664 6.75869 12.4404C6.57048 12.3145 6.42378 12.1354 6.33716 11.926C6.25053 11.7166 6.22787 11.4861 6.27203 11.2637C6.31619 11.0414 6.42519 10.8372 6.58526 10.6769C6.74532 10.5166 6.94925 10.4074 7.17126 10.3632C7.39327 10.3189 7.6234 10.3416 7.83253 10.4284C8.04166 10.5152 8.2204 10.6621 8.34616 10.8506C8.47192 11.0391 8.53905 11.2607 8.53905 11.4874C8.53905 11.7914 8.41847 12.0829 8.20383 12.2979C7.98919 12.5128 7.69808 12.6336 7.39454 12.6336ZM11.9726 12.6336C11.7462 12.6336 11.5249 12.5664 11.3367 12.4404C11.1485 12.3145 11.0018 12.1354 10.9152 11.926C10.8286 11.7166 10.8059 11.4861 10.85 11.2637C10.8942 11.0414 11.0032 10.8372 11.1633 10.6769C11.3233 10.5166 11.5273 10.4074 11.7493 10.3632C11.9713 10.3189 12.2014 10.3416 12.4105 10.4284C12.6197 10.5152 12.7984 10.6621 12.9242 10.8506C13.0499 11.0391 13.1171 11.2607 13.1171 11.4874C13.1171 11.7914 12.9965 12.0829 12.7818 12.2979C12.5672 12.5128 12.2761 12.6336 11.9726 12.6336ZM16.5506 12.6336C16.3242 12.6336 16.1029 12.5664 15.9147 12.4404C15.7265 12.3145 15.5798 12.1354 15.4932 11.926C15.4066 11.7166 15.3839 11.4861 15.4281 11.2637C15.4722 11.0414 15.5812 10.8372 15.7413 10.6769C15.9014 10.5166 16.1053 10.4074 16.3273 10.3632C16.5493 10.3189 16.7794 10.3416 16.9886 10.4284C17.1977 10.5152 17.3764 10.6621 17.5022 10.8506C17.628 11.0391 17.6951 11.2607 17.6951 11.4874C17.6951 11.7914 17.5745 12.0829 17.3599 12.2979C17.1452 12.5128 16.8541 12.6336 16.5506 12.6336Z"
          fill="#F7F7F7"
        />
      </svg>
    ),
    share: (
      <svg viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.9619 6.10553C13.2482 6.11031 13.487 5.88317 13.487 5.59676V1.37962C13.487 0.912129 14.0714 0.700335 14.3709 1.05927L19.0443 6.65985L23.2071 11.6486C23.3729 11.8473 23.3597 12.1398 23.1765 12.3227L18.9652 16.5287L14.3403 21.1477C14.0253 21.4624 13.487 21.2393 13.487 20.794V16.4648C13.487 16.2061 13.2848 15.989 13.0266 15.9718C6.89694 15.5621 3.39494 18.2496 1.72675 20.1154C1.37582 20.5079 0.514551 20.2369 0.534266 19.7108C0.664455 16.2365 1.24287 12.7933 3.5118 10.0754C6.44802 6.55529 10.6037 6.06608 12.9619 6.10553Z"
          fill="#F7F7F7"
        />
      </svg>
    ),
  },
  twitter: {
    like: (
      <svg
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
    ),
    comment: (
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
    ),
    share: (
      <svg
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
    ),
  },
  instagram: {
    like: (
      <svg
        aria-label="Like"
        color="rgb(245, 245, 245)"
        fill="rgb(245, 245, 245)"
        height="24"
        role="img"
        viewBox="0 0 24 24"
        width="24"
      >
        <title>Like</title>
        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
      </svg>
    ),
    comment: (
      <svg
        aria-label="Comment"
        color="rgb(245, 245, 245)"
        fill="rgb(245, 245, 245)"
        height="24"
        role="img"
        viewBox="0 0 24 24"
        width="24"
      >
        <title>Comment</title>
        <path
          d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
          fill="none"
          stroke="currentColor"
          stroke-linejoin="round"
          stroke-width="2"
        ></path>
      </svg>
    ),
    share: (
      <svg
        aria-label="Share Post"
        color="rgb(245, 245, 245)"
        fill="rgb(245, 245, 245)"
        height="24"
        role="img"
        viewBox="0 0 24 24"
        width="24"
      >
        <title>Share Post</title>
        <line
          fill="none"
          stroke="currentColor"
          stroke-linejoin="round"
          stroke-width="2"
          x1="22"
          x2="9.218"
          y1="3"
          y2="10.083"
        ></line>
        <polygon
          fill="none"
          points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
          stroke="currentColor"
          stroke-linejoin="round"
          stroke-width="2"
        ></polygon>
      </svg>
    ),
  },
};


interface CollapsedChildrenProps extends Omit<MotionProps, "layout"> {
  children: React.ReactNode;
  label?: string;
  height?: string;
  [key: string]: any;
}

function CollapsedChildren({
  children,
  className,
  label,
  height,
  ...props
}: CollapsedChildrenProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex flex-col items-start w-full h-fit">
      <motion.button
        className={className}
        style={{
          zIndex: 10,
          overflow: "hidden",
        }}
        transition={{
          duration: 0.2,
        }}
        layout
        {...props}
        onTap={() => setCollapsed(!collapsed)}
      >
        <div className="w-full text-center align-middle flex flex-col items-center justify-center" style={
          {
            height
          }
        }>
          <span className="text-white text-2xl font-bold">{label}</span>
        </div>
        <AnimatePresence initial={false} custom={collapsed}>
          {!collapsed && (
            <motion.div
              key="content"
              style={{
                overflow: "hidden",
              }}
              onTap={e => e.stopPropagation()}
              initial={{ height: 0 }}
              animate={{ height: `auto` }}
              exit={{ height: 0 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function EnlargeCard({ data }: { data: embedMedia }) {
  const [displayed, setDisplayed] = useState(false);

  const screenStyles = displayed
    ? "top-0 left-0 h-screen md:h-auto object-contain"
    : "md:max-h-[500px] md:max-w-[350px] min-w-[200px]  w-full object-contain";

  return (
    <motion.button
      exit={{
        height: 0,
      }}
      whileHover={
        {
          //scale: displayed ? 1 : 1.01,
        }
      }
      onDoubleClick={() => {
        if (data.type !== "video") setDisplayed(!displayed);
      }}
      onTap={() => {
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
  const { setAlert } = useContext(AlertContext);
  const { data }: { data: embedFetch | embedFetchError } = preload;

  function downloadMedia(num?: number) {
    if ('reason' in data) return;
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

  useEffect(() => {
    if ("reason" in data) {
      setAlert(data.reason || "Error", {
        type: "error",
      });
    } else {
      if (data.incorrectId) {
        setAlert(
          "Incorrect ID, this can be caused by multiple reasons so please join the discord server and send a message in #support",
          {
            type: "error",
            linkto: "https://discord.gg/D72MC6D2dZ",
          }
        );
      }
    }
  }, [])

  const router = useRouter();
  const { n } = router.query;

  const displayed = (Number(n) ?? 1) - 1;

  return (
    <>
      {"user" in data && (
        <Head>
          <link rel="icon" href="/svg/Ezfill.svg" />
          <meta name="theme-color" content="#2b2d31" />
          {/*<meta property="og:site_name" content="Made by Chance#0002" /> Ima get rid of this cuz its tacky kinda*/}
          <meta
            name="twitter:title"
            content={`${data.user.displayName || "Unknown"} ${
              data.user.name ? `(@${data.user.name})` : ""
            }`}
          />
          <meta name="twitter:description" content={data.content.text || ""} />
          {data.content.generatedMedia?.at(displayed)?.type === "video" ? (
            <>
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
          ) : data.content.media?.at(displayed)?.type === "video" ? (
            <>
              <meta name="twitter:card" content="player" />
              <meta name="twitter:player:width" content="480" />
              <meta name="twitter:player:height" content="720" />
              <meta
                name="twitter:player:stream"
                content={
                  `/api/video/${data.id}?type=${data.type}` ||
                  data.content.media?.at(displayed)?.url
                }
              />
              <meta
                name="twitter:player:stream:content_type"
                content="video/mp4"
              />
            </>
          ) : (
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
            )
          )}

          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
      )}

      {"user" in data && (
        <div
          className={`fixed top-0 left-0 min-h-screen background-image-move w-screen opacity-5`}
          style={{
            backgroundImage: `url('/svg/${data.type}.svg')`,
          }}
        />
      )}
      {"user" in data ? (
        <motion.div
          layout
          className={`min-h-screen flex flex-col ${
            data?.content?.media?.length == 1 ? "max-w-[1400px]" : ""
          } mx-auto`}
        >
          <motion.div
            layout
            className="flex flex-row md:p-4 gap-4 md:gap-0 justify-center items-center max-w-screen flex-wrap h-full grow"
          >
            <motion.div
              layout
              className="w-fit rounded-token border border-solid border-primary overflow-clip flex flex-col md:flex-row md:w-3/5"
            >
              <motion.div layout id="user+text" className="flex-shrink-1">
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
                className="bg-primary md:w-[1px] md:h-auto w-full h-[1px] z-20"
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

                <hr className="bg-primary"></hr>

                <motion.div
                  layout
                  className="pt-[17px] pr-4 pb-[17px] pl-4 flex flex-row flex-wrap gap-5 items-center justify-center overflow-hidden"
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
                      {svgs[data.type as keyof typeof svgs]?.comment}
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
                      {svgs[data.type as keyof typeof svgs]?.share}
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
                      {svgs[data.type as keyof typeof svgs]?.like}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              layout
              id="buttons-alot"
              className="flex flex-col w-full md:w-2/5 gap-4 md:pl-4"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="rounded-token border-solid border-[#ffffff] border pt-5 pr-[61px] pb-5 pl-[61px] flex flex-row gap-2.5 items-center justify-center w-full h-[75px]"
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
                        position: "relative",
                        overflow: "hidden",
                        padding: "0",
                        width: "100%",
                        height: "75px",
                        borderRadius: "8px",
                      }}
                      className="rounded-token border border-primary flex flex-row gap-2.5 items-center justify-center w-full h-[75px]"
                      onClick={() => downloadMedia(index)}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          right: "0",
                          bottom: "0",
                          zIndex: -1,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          backgroundImage: `url(${
                            media.thumbnail || media.url
                          })`,
                        }}
                      />
                      <motion.div
                        layout
                        className="text-[#ffffff] text-center relative flex items-center justify-center uppercase pointer-events-none"
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
            {(data.content.generatedMedia?.length || 0) > 0 && (
              <CollapsedChildren
                height="75px"
                label="GENERATED MEDIA"
                className="rounded-token flex flex-col md:mt-4 border border-primary gap-2.5 items-center justify-center w-full min-h-[75px]"
              >
                {data?.content?.generatedMedia?.map(
                  (entry: embedMedia, index) => EnlargeCard({ data: entry })
                )}
              </CollapsedChildren>
            )}
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="flex flex-col items-center justify-center h-screen bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="border rounded-token border-primary p-8">
              <h1 className="text-white text-4xl">{
                data.code|| "404"
              }</h1>
              <p className="text-white text-lg">
                { data.cause }
              </p>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

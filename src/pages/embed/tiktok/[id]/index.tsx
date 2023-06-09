import { GetServerSidePropsContext } from "next";

import getTiktokVideo from "@/utils/tiktok";

import EmbedPage from "@/components/embed/page";
import convertToVideo from "@/utils/convertPictures";
import { randomUUID } from "crypto";

// make a request to the server
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const data = await getTiktokVideo(context.params?.id as string, {});

  if (data.content.media[0].type === "photo") {
    // convert the picture to video with audio

    const extractedAudio = data.content.media.filter((media) => media.type === "audio")[0]

    const video = await convertToVideo(
      {
        audio: {
          url: extractedAudio.url,
          duration: extractedAudio?.duration || 25,
        },
        pictures: data.content.media
          .filter((media) => media.type === "photo")
          .map((media) => media.url),
      },
      context.params?.id as string || randomUUID()
    );

    data.content.generatedMedia = [
      {
        type: "video",
        url: video,
        thumbnail: data.content.media.filter((media) => media.type === "photo")[0].url,
        duration: extractedAudio?.duration || 25,
        height: 720,
        width: 1280,
      }
    ]


  }

  return {
    props: {
      data: data,
    },
  };
};

export default EmbedPage;

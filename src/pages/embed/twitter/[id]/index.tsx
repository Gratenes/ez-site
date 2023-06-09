import {GetServerSidePropsContext} from "next";

import { getTwitterVideoNSFW, twitterMedia } from "@/utils/twitter";

import EmbedPage from "@/components/embed/page";


// make a request to the server
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const data = await getTwitterVideoNSFW({
    id: context.params?.id as string,
  });

  return {
    props: {
      data: data,
    },
  };
};

export default EmbedPage
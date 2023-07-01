import { GetServerSidePropsContext } from "next";

import providers, { medias } from "@/utils/requesters";

import EmbedPage from "@/components/embed/page";

import { updateEntry } from "@/utils/trackViews";

// make a request to the server
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id, type } = context.query || {};
  if (!type || typeof type !== 'string') return { notFound: true }
  if (!id) return { notFound: true }

  if (type && !providers[type as medias])
    return { notFound: true }

  const data = await providers[type as medias]({
    id: context.params?.id as string,
  }, {});

  updateEntry(context.params?.id as string, context.req.headers.host || 'unknown')

  return {
    props: {
      data: data,
    },
  };
};

export default EmbedPage;

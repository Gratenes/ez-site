import { GetServerSidePropsContext } from "next";

import providers, { medias } from "@/utils/requestData";

import EmbedPage from "@/components/embed/page";

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

  console.log(data)

  return {
    props: {
      data: data,
    },
  };
};

export default EmbedPage;

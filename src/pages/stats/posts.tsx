import mongoose from "mongoose";
import { GetServerSidePropsContext } from "next";
import { useState, MouseEvent } from "react";

interface SiteData {
  views: number;
  _id: string;
  site: string;
  timestamp: string;
}

const Entry = mongoose.models.Entry;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  console.log("Server side props");
  const data = await Entry.find({});

  return {
    props: {
      data: data.map((e) => ({
        _id: e._id,
        views: e.views,
        site: e.site || "localhost",
        timestamp: e.timestamp.toISOString(),
      })),
    },
  };
};

const handleIframeRightClick = (e: MouseEvent<HTMLIFrameElement>) => {
  const iframe = e.currentTarget;
  const iframeSrc = iframe.src;
  console.log("Resolved iframe link:", iframeSrc);
  // Do something with the resolved link, such as opening it in a new tab/window
};

const PreviewRecent: React.FC<{ data: SiteData[] }> = (props) => {
    const { data } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate the index range for the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Get the items for the current page
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    // Function to handle page change
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

  const sites = ["tiktokez.com", "twitterez.com", "instagramez.com"];

  return (
    <div className="min-h-screen w-full h-full flex flex-col items-center justify-center">
      <div className="pagination flex flex-row">
        {data.length > itemsPerPage && (
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
            > Prev </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
            > Next </button>
          </div>
        )}
      </div>
      <div className="min-h-screen w-full h-full flex flex-row overflow-x-scroll">
      {currentItems.map((item) => {
        if (item.site.includes("tiktokez.com")) {
          return (
            <div
              className="w-full h-screen min-w-[300px] max-w-[300px] max-h-screen"
              key={item._id}
            >
              <iframe
                src={`/embed/tiktok/${item._id}`}
                width="100%"
                height="100%"
                className="w-full h-full"
                style={{ border: "none" }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onContextMenu={handleIframeRightClick}
                title="TikTok"
              />
            </div>
          );
        } else if (item.site.includes("twitterez.com")) {
          return (
            <div
              className="w-full h-screen min-w-[300px] max-w-[300px] max-h-screen"
              key={item._id}
            >
              <iframe
                src={`/embed/twitter/${item._id}`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onContextMenu={handleIframeRightClick}
                title="Twitter"
              />
            </div>
          );
        } else if (item.site.includes("instagramez.com")) {
          return (
            <div
              className="w-full h-screen min-w-[300px] max-w-[300px] max-h-screen"
              key={item._id}
            >
              <iframe
                src={`/https\://www.instagram.com/reels/${item._id}`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onContextMenu={handleIframeRightClick}
                title="Instagram"
              />
            </div>
          );
        }
      })}
      </div>
    </div>
  );
};

export { PreviewRecent };
export default PreviewRecent;

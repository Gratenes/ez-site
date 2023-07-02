import mongoose from "mongoose";
import { GetServerSidePropsContext } from "next";
import { useState, MouseEvent, useEffect } from "react";

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

function extractSite(site: string) {
  if (site.includes("tiktok")) return "tiktok";
  if (site.includes("twitter")) return "twitter";
  if (site.includes("instagram")) return "instagram";
  console.log("Could not extract site from", site);
  return "unknown";
}

const PreviewRecent: React.FC<{ data: SiteData[] }> = (props) => {
  const { data } = props;
  const [stateData, setStateData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "oldest" | "views">("newest");
  const [domain, setDomain] = useState<"all" | "tiktok" | "twitter" | "instagram">("all");

  const [sortedData, setSortedData] = useState<SiteData[]>([]);

  const itemsPerPage = 10;

  // Function to handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const sortData = () => {
      const localdata = data.slice();
      if (sort === "newest") {
        localdata.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      } else if (sort === "oldest") {
        localdata.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      } else if (sort === "views") {
        localdata.sort((a, b) => b.views - a.views);
      }

      if (domain !== "all") {
        return localdata.filter((e) => extractSite(e.site) === domain);
      } else {
        return localdata;
      }
    };

    setSortedData(sortData());
  }, [data, sort, domain]);

  return (
    <div className="min-h-screen w-full h-full flex flex-col items-center justify-center">
      <div className="pagination flex flex-row w-full">
        {data.length > itemsPerPage && (
          <div className="bg-background border border-primary rounded p-2 w-full">
            <div className="flex flex-row justify-around">
              <button
                className="border border-primary px-2 rounded"
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Prev
              </button>
              <button
                className="border border-primary px-2 rounded"
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
            {/* Select filter here */}
            <div className="flex flex-row">
              <select
                className="bg-background border border-primary rounded p-2 w-full"
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most Views</option>
              </select>
              <select
                className="bg-background border border-primary rounded p-2 w-full"
                onChange={(e) => setDomain(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="min-h-screen w-full h-full flex flex-row overflow-x-scroll">
        {sortedData
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((item) => {
            return (
              <div
                className="w-full h-screen min-w-[300px] max-w-[300px] max-h-screen"
                key={item._id}
              >
                <p>
                  {`/embed/${item._id}?type=${extractSite(item.site)}`}
                </p>
                <iframe
                  src={`/embed/${item._id}?type=${extractSite(
                    item.site
                  )}&donttrack=true`}
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
          })}
      </div>
    </div>
  );
};

export { PreviewRecent };
export default PreviewRecent;

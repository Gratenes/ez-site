import mongoose from "mongoose";
import { GetServerSidePropsContext } from "next";
import { useState, useEffect } from "react";

interface SiteData {
  views: number;
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
        views: e.views,
        site: e.site || "localhost",
        timestamp: e.timestamp.toISOString(),
      })),
    },
  };
};

const TextStats: React.FC<{ data: SiteData[] }> = (props) => {
  const { data } = props;

  const [selectedSite, setSelectedSite] = useState("");

  const sites = Array.from(new Set(data.map((item) => item.site)));

  const getLast24HoursData = (): SiteData[] => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return data.filter((item) => {
      const itemTimestamp = new Date(item.timestamp);
      return itemTimestamp > twentyFourHoursAgo;
    });
  };

  const getLastWeekData = (): SiteData[] => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return data.filter((item) => {
      const itemTimestamp = new Date(item.timestamp);
      return itemTimestamp > oneWeekAgo;
    });
  };

  const getLastMonthData = (): SiteData[] => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return data.filter((item) => {
      const itemTimestamp = new Date(item.timestamp);
      return itemTimestamp > oneMonthAgo;
    });
  };

  const calculateTotalViews = (dataArray: SiteData[]): number => {
    return dataArray
      .filter((item) => item.site === selectedSite || !selectedSite)
      .reduce((total, item) => total + item.views, 0);
  };

  const calculateTotal = (dataArray: SiteData[]): number => {
    return dataArray.filter(
      (item) => item.site === selectedSite || !selectedSite
    ).length;
  };

  const calculateAveragePerDay = (dataArray: SiteData[]): number => {
    const days = dataArray.length / 24;
    return days ? calculateTotalViews(dataArray) / days : 0;
  };

  const totalViewsPast24Hours = calculateTotalViews(getLast24HoursData());
  const totalViewsPastWeek = calculateTotalViews(getLastWeekData());
  const totalViewsPastMonth = calculateTotalViews(getLastMonthData());
  const averageViewsPerDayLastMonth = calculateAveragePerDay(
    getLastMonthData()
  );
  const estimatedViewsNextMonth = averageViewsPerDayLastMonth * 30;

  return (
    <div>
      <div className="flex justify-center items-center w-full mb-4">
        <label htmlFor="siteFilter" className="mr-2">
          Filter by Site:
        </label>
        <select
          id="siteFilter"
          className="border border-primary bg-background rounded px-2 py-1"
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
        >
          <option value="">All Sites</option>
          {sites.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        <div className="bg-background rounded-token p-4">
          <p className="text-lg font-semibold mb-2">
            Total Embeds ({selectedSite || "All Sites"})
          </p>
          <p className="text-3xl">{calculateTotal(data)}</p>
        </div>
        <div className="bg-background rounded-token p-4">
          <p className="text-lg font-semibold mb-2">
            Total Views ({selectedSite || "All Sites"})
          </p>
          <p className="text-3xl">{calculateTotalViews(data)}</p>
        </div>
        <div className="bg-background rounded-token p-4">
          <p className="text-lg font-semibold mb-2">
            Views in the Last 24 Hours ({selectedSite || "All Sites"})
          </p>
          <p className="text-3xl">{totalViewsPast24Hours}</p>
        </div>
        <div className="bg-background rounded-token p-4">
          <p className="text-lg font-semibold mb-2">
            Views in the Last Week ({selectedSite || "All Sites"})
          </p>
          <p className="text-3xl">{totalViewsPastWeek}</p>
        </div>
        <div className="bg-background rounded-token p-4">
          <p className="text-lg font-semibold mb-2">
            Views in the Last Month ({selectedSite || "All Sites"})
          </p>
          <p className="text-3xl">{totalViewsPastMonth}</p>
        </div>
        <div className="bg-background rounded-token p-4">
          <p className="text-lg font-semibold mb-2">
            Estimated Views in the Next Month
          </p>
          <p className="text-3xl">{estimatedViewsNextMonth.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};

export { TextStats };
export default TextStats;

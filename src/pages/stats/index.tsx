import React, { useEffect, useRef } from "react";
import { Chart, registerables, ChartDataset } from "chart.js";
import { GetServerSidePropsContext } from "next";

import Entry from "mongo/schema";

import moment from "moment";

import mongoose from "mongoose";
import StatisticsChart from "@/components/statisticsChart";
import Piechart from "@/components/pieChart";
import StatsText from "./text";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  console.log("Server side props");
  const data = await Entry.find({});

  return {
    props: {
      data: data.map((e) => {
        return {
          views: e.views,
          site: e.site || "localhost",
          timestamp: e.timestamp.toISOString(),
        };
      }),
    },
  };
};

const MyPage: React.FC = (props: any) => {

  console.log(props.data[0]);

  const allData: ChartDataset = {
    data: props.data.map((d: any) => ({
      x: new Date(d.timestamp),
      y: d.views,
    })),
    label: "Combined",
  };

  const colors: any = {
    "tiktokez.com": "rgb(37, 244, 238)",
    "twitterez.com": "rgb(29, 155, 240)",
    "instagramez.com": "rgb(131, 58, 180)",
  };
  const sites: ChartDataset[] = [
    "tiktokez.com",
    "twitterez.com",
    "instagramez.com",
  ].map((site) => ({
    data: props.data
      .filter((d: any) => d.site.includes(site))
      .map((d: any) => ({
        x: new Date(d.timestamp),
        y: d.views,
      })),
    backgroundColor: "rgb(34, 29, 37)",
    borderColor: colors[site],
    label: site,
  }));

  console.log(sites);

  const [dataNormalization, setDataNormalization] = React.useState(false);

  console.log(props.sites);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen py-2 gap-4">
      <div className="max-h-screen h-screen flex flex-col w-full max-w-[1400px] mx-auto border border-primary">
        <div className="h-1/2">
          <p>Combined Data</p>
          <div className="h-full pb-10 relative flex flex-col items-center justify-center">
            <button
              className="absolute top-0 right-0"
              onClick={() => setDataNormalization(!dataNormalization)}
            >
              {dataNormalization ? "Disable" : "Enable"} Data Normalization
            </button>
            <StatisticsChart
              data={[allData]}
              dataNormalization={dataNormalization}
            />
          </div>
        </div>

        <hr className="border-primary" />
        <div className="h-1/2">
          <p>Individual Data</p>
          <div className="h-full pb-10 flex flex-col items-center justify-center">
            <StatisticsChart
              data={sites}
              dataNormalization={dataNormalization}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row flex-wrap max-w-[1400px] w-full gap-4">
        <p>Total Views</p>
        <div className="h-96 p-4 w-fit flex flex-col items-center justify-center">
          <Piechart data={sites} dataNormalization={dataNormalization} />
        </div>
        <div className="grow">
          <StatsText data={props.data} />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
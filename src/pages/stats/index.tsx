import React, { useEffect, useRef } from "react";
import { Chart, registerables, ChartDataset } from "chart.js";
import { GetServerSidePropsContext } from "next";

import moment from "moment";

import mongoose from "mongoose";
const Entry = mongoose.models.Entry;

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

interface StatisticsChartProps {
  data: ChartDataset[];
  dataNormalization?: boolean;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  data,
  dataNormalization,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const loadChartPlugin = async () => {
      const { default: ChartZoom } = await import("chartjs-plugin-zoom");
    
      // @ts-ignore
      const ChartMoment = await import("chartjs-adapter-moment");

      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (ctx) {
          Chart.register(ChartZoom);
          Chart.register(ChartMoment);
          Chart.register(...registerables);

          let wasDestroyed = false;

          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            wasDestroyed = true;
          }

          chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
              datasets: data.map((dataset, index) => ({
                ...dataset,
                backgroundColor: "rgb(34, 29, 37)",
                borderColor: "rgba(255, 255, 255, 50)",
                borderWidth: 1,
                tension: 0.1,
              })),
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                zoom: {
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true,
                    },
                    mode: "x",
                    onZoom: ({ chart }) => {
                      if (dataNormalization) {
                        chart.data.datasets.forEach((_, index) => {
                          const dataset = {
                            data: data[index]
                          }
                          const mergedData = [];
                          const maxDataPoints = Math.floor(
                            30 * chart.getZoomLevel()
                          );
                          const interval = Math.ceil(
                            dataset.data.length / maxDataPoints
                          );

                          for (
                            let i = 0;
                            i < dataset.data.length;
                            i += interval
                          ) {
                            const groupData = dataset.data.slice(
                              i,
                              i + interval
                            );
                            if (groupData.length > 0) {
                              let averageData;
                              if (typeof groupData[0] === "number") {
                                averageData = groupData.reduce((a, b) => a + b, 0)
                              } else {
                                averageData = groupData.reduce((a, b) => ({
                                  x: a.x,
                                  y: a.y + b.y,
                                }));
                              }
                              mergedData.push(averageData);
                            }
                          }

                          chart.data.datasets[index].data = mergedData;
                        });
                        chart.update();
                      }
                    },
                  },
                  pan: {
                    enabled: true,
                    mode: "x",
                  },
                },
              },
              animation: {
                duration: 0,
              },
              hover: {
                mode: "index",
                intersect: false,
              },
              scales: {
                x: {
                  grid: {
                    color: "rgb(34, 29, 37)",
                  },
                  type: "time",
                },
                y: {
                  grid: {
                    color: "rgb(34, 29, 37)",
                  },
                },
              },
            },
          });
        }
      }
    };

    loadChartPlugin();
  }, [data, dataNormalization]);

  return <canvas ref={chartRef}></canvas>;
};

const MyPage: React.FC = (props: any) => {

  const allData: ChartDataset = {
    data: props.data.map((d: any) => ({
      x: new Date(d.timestamp),
      y: d.views,
    })),
    label: "Combined",
  };

  const sites: ChartDataset[] = ["tiktokez.com", "localhost"].map((site) => ({
    data: props.data
      .filter((d: any) => d.site === site)
      .map((d: any) => ({
        x: new Date(d.timestamp),
        y: d.views,
      })),
    label: site,
  }));

  console.log(sites);

  const [dataNormalization, setDataNormalization] = React.useState(false);

  console.log(props.sites);

  return (
    <div className="h-screen">
      <p>Combined Data</p>
      <div className="h-1/2 relative flex flex-col items-center justify-center">
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

      <p>Individual Data</p>
      <div className="h-1/2 flex flex-col items-center justify-center">
        <StatisticsChart
          data={sites}
          dataNormalization={dataNormalization}
        />
      </div>
    </div>
  );
};

export default MyPage;
import { Chart, ChartDataset, registerables } from "chart.js";
import { useRef, useEffect } from "react";

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
                backgroundColor: "rgb(34, 29, 37)",
                borderColor: "rgba(255, 255, 255, 50)",
                borderWidth: 1,
                tension: 0.1,
                ...dataset,
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
                            data: data[index].data,
                          };
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
                                averageData = groupData.reduce(
                                  (a, b) => a + b,
                                  0
                                );
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
                    color: "rgb(51, 51, 51)",
                  },
                  type: "time",
                },
                y: {
                  grid: {
                    color: "rgb(51, 51, 51)",
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


export default StatisticsChart;
import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { GetServerSidePropsContext } from "next";
import moment from "moment";
import mongoose from "mongoose";
const Entry = mongoose.models.Entry;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  console.log("Server side props");
  const data = await Entry.find({});
  const labels = data.map((entry) => entry.timestamp.toISOString());
  const views = data.map((entry) => entry.views);

  return {
    props: {
      data: views,
      labels,
    },
  };
};

interface StatisticsChartProps {
  data: number[];
  labels: string[];
}

const aggregateData = (
  data: number[],
  labels: string[],
  aggregation: string
) => {
  const aggregatedData: number[] = [];
  const aggregatedLabels: string[] = [];

  const startTime = moment(labels[0]);
  const endTime = moment(labels[labels.length - 1]);

  let duration: moment.Duration;

  switch (aggregation) {
    case "month":
      duration = moment.duration(endTime.diff(startTime));
      const numMonths = duration.asMonths();
      for (let i = 0; i < numMonths; i++) {
        const monthStart = startTime.clone().add(i, "months").startOf("month");
        const monthEnd = monthStart.clone().endOf("month");

        const monthData = data.filter((_, index) =>
          moment(labels[index]).isBetween(monthStart, monthEnd)
        );
        const monthSum = monthData.reduce((sum, value) => sum + value, 0);
        const monthAverage =
          monthData.length > 0 ? monthSum / monthData.length : 0;

        aggregatedData.push(monthAverage);
        aggregatedLabels.push(monthStart.format("MMMM YYYY"));
      }
      break;

    case "week":
      duration = moment.duration(endTime.diff(startTime));
      const numWeeks = duration.asWeeks();
      for (let i = 0; i < numWeeks; i++) {
        const weekStart = startTime.clone().add(i, "weeks").startOf("week");
        const weekEnd = weekStart.clone().endOf("week");

        const weekData = data.filter((_, index) =>
          moment(labels[index]).isBetween(weekStart, weekEnd)
        );
        const weekSum = weekData.reduce((sum, value) => sum + value, 0);
        const weekAverage = weekData.length > 0 ? weekSum / weekData.length : 0;

        aggregatedData.push(weekAverage);
        aggregatedLabels.push(
          `${weekStart.format("MMM DD")} - ${weekEnd.format("MMM DD")}`
        );
      }
      break;

    case "day":
      duration = moment.duration(endTime.diff(startTime));
      const numDays = duration.asDays();
      for (let i = 0; i < numDays; i++) {
        const dayStart = startTime.clone().add(i, "days").startOf("day");
        const dayEnd = dayStart.clone().endOf("day");

        const dayData = data.filter((_, index) =>
          moment(labels[index]).isBetween(dayStart, dayEnd)
        );
        const daySum = dayData.reduce((sum, value) => sum + value, 0);
        const dayAverage = dayData.length > 0 ? daySum / dayData.length : 0;

        aggregatedData.push(dayAverage);
        aggregatedLabels.push(dayStart.format("MMM DD"));
      }
      break;

    case "hour":
      duration = moment.duration(endTime.diff(startTime));
      const numHours = duration.asHours();
      for (let i = 0; i < numHours; i++) {
        const hourStart = startTime.clone().add(i, "hours").startOf("hour");
        const hourEnd = hourStart.clone().endOf("hour");

        const hourData = data.filter((_, index) =>
          moment(labels[index]).isBetween(hourStart, hourEnd)
        );
        const hourSum = hourData.reduce((sum, value) => sum + value, 0);
        const hourAverage = hourData.length > 0 ? hourSum / hourData.length : 0;

        aggregatedData.push(hourAverage);
        aggregatedLabels.push(hourStart.format("LT"));
      }
      break;

    case "second":
      for (let i = 0; i < data.length; i++) {
        aggregatedData.push(data[i]);
        aggregatedLabels.push(moment(labels[i]).format("LTS"));
      }
      break;

    default:
      aggregatedData.push(...data);
      aggregatedLabels.push(...labels);
      break;
  }

  return {
    data: aggregatedData,
    labels: aggregatedLabels,
  };
};

const StatisticsChart: React.FC<StatisticsChartProps> = ({ data, labels }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const loadChartPlugin = async () => {
      const { default: ChartZoom } = await import("chartjs-plugin-zoom");

      // @ts-ignore
      const ChartMoment = await import("chartjs-adapter-moment");
      console.log(ChartMoment);

      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (ctx) {
          Chart.register(ChartZoom);
          Chart.register(ChartMoment);
          Chart.register(...registerables);

          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy(); // Destroy any existing Chart instance
          }

          chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: {
              labels,
              datasets: [
                {
                  label: "Views",
                  data,
                  backgroundColor: "rgb(34, 29, 37)",
                  borderColor: "rgba(255, 255, 255, 50)",
                  borderWidth: 1,
                  tension: 0.1,
                },
              ],
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
                      const zoomLevel = chart.getZoomLevel();
                    },
                  },
                  pan: {
                    enabled: true,
                    mode: "x",
                  },
                },
              },
              hover: {
                mode: "index",
                intersect: false,
              },
              scales: {
                x: {
                  type: "time",
                },
              },
            },
          });
        }
      }
    };

    loadChartPlugin();
  }, [data, labels]);

  return <canvas ref={chartRef}></canvas>;
};

const MyPage: React.FC = (props: any) => {
  // Sample data and labels
  const data = props?.data || [1, 2, 3, 4];
  const labels = props?.labels || ["a", "b", "c", "d"];

  const aggregatedDataByMonth = aggregateData(data, labels, "month");
  const aggregatedDataByWeek = aggregateData(data, labels, "week");
  const aggregatedDataByDay = aggregateData(data, labels, "day");
  const aggregatedDataByHour = aggregateData(data, labels, "hour");
  const aggregatedDataBySecond = aggregateData(data, labels, "second");

  return (
    <div className="h-screen">
      <h2>Aggregated by Month</h2>
      <StatisticsChart
        data={aggregatedDataByMonth.data}
        labels={aggregatedDataByMonth.labels}
      />

      <h2>Aggregated by Week</h2>
      <StatisticsChart
        data={aggregatedDataByWeek.data}
        labels={aggregatedDataByWeek.labels}
      />

      <h2>Aggregated by Day</h2>
      <StatisticsChart
        data={aggregatedDataByDay.data}
        labels={aggregatedDataByDay.labels}
      />

      <h2>Aggregated by Hour</h2>
      <StatisticsChart
        data={aggregatedDataByHour.data}
        labels={aggregatedDataByHour.labels}
      />

      <h2>Aggregated by Second</h2>
      <StatisticsChart
        data={aggregatedDataBySecond.data}
        labels={aggregatedDataBySecond.labels}
      />
    </div>
  );
};

export default MyPage;

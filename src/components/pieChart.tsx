import { Chart, ChartDataset, registerables } from "chart.js";
import { useRef, useEffect } from "react";

interface StatisticsChartProps {
  data: ChartDataset[];
  dataNormalization?: boolean;
}

const getTotalViews = (data: {y:number}[]) => {
  let views = 0;
  data.forEach((entry) => {
    views += entry.y;
  })
  
  return views;
};

const properData = (data: ChartDataset[]) => {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    total += data[i].data.length;
  }
  const percentages = [];
  for (let i = 0; i < data.length; i++) {

    // @ts-ignore
    percentages.push(getTotalViews(data[i].data))
  }

  return percentages;
};

const handleHover = (event: any, activeElements: any, chartInstance: any) => {
  //console.log("Hovering", event, activeElements, chartInstance);
};

const Piechart: React.FC<StatisticsChartProps> = ({
  data,
  dataNormalization,
}) => {
  


  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const loadChartPlugin = async () => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (ctx) {
          Chart.register(...registerables);

          let wasDestroyed = false;

          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            wasDestroyed = true;
          }

          // @ts-ignore
          chartInstanceRef.current = new Chart(ctx, {
            type: "pie",
            data: {
              labels: data.map((dataset) => dataset.label),
              datasets: [
                {
                  data: properData(data),
                  backgroundColor: data.map(
                    (dataset) => dataset.backgroundColor as string
                  ),
                  borderColor: data.map(
                    (dataset) => dataset.borderColor as string
                  ),
                  borderWidth: 1,
                },
              ],
            },
            options: {
              onHover: handleHover, // Add the custom hover callback
              responsive: true,
              maintainAspectRatio: false,
            },
          });
        }
      }
    };

    loadChartPlugin();
  }, [data, dataNormalization]);

  return (
    <canvas ref={chartRef} style={{ width: "100%", height: "100%" }}></canvas>
  );
};

export default Piechart;

import React, { useEffect, useLayoutEffect, useRef } from "react";

interface StatisticsChartProps {
  data: number[];
  labels: string[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ data, labels }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    import("d3").then((d3) => {
      if (chartRef.current) {
        const chartContainer = d3.select(chartRef.current);

        // Clear previous chart
        chartContainer.select("svg").remove();

        const svg = chartContainer
          .append("svg")
          .attr("width", "100%")
          .attr("height", "100%");

        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = chartRef.current.clientWidth - margin.left - margin.right;
        const height =
          chartRef.current.clientHeight - margin.top - margin.bottom;

        const xScale = d3
          .scalePoint()
          .range([0, width])
          .domain(labels)
          .padding(0.5);

        const yScale = d3
          .scaleLinear()
          .range([height, 0])
          .domain([0, d3.max(data) as number]);

        const line = d3
          .line<{ x: string; y: number }>()
          .x((d) => xScale(d.x) || 0)
          .y((d) => yScale(d.y))
          .curve(d3.curveCatmullRom.alpha(0.5)); // Set the tension for the curve

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

        g.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(xScale));

        g.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

        const dataPoints = labels.map((label, index) => ({
          x: label,
          y: data[index],
        }));

        g.append("path")
          .datum(dataPoints)
          .attr("class", "line")
          .attr("d", line)
          .style("stroke", "white") // Set the stroke color to white
          .style("fill", "none") // Disable fill
          .style("stroke-linejoin", "round") // Round the corners
          .style("stroke-linecap", "round"); // Round the line endings

        g.selectAll(".dot")
          .data(dataPoints)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", (d) => xScale(d.x) || 0) // Use xScale for dot positions
          .attr("cy", (d) => yScale(d.y))
          .attr("r", 4);

        // Add hover effects to the dots
        g.selectAll(".dot")
          .on("mouseover", function () {
            d3.select(this).attr("fill", "red");
          })
          .on("mouseout", function () {
            d3.select(this).attr("fill", "steelblue");
          });
      }
    });
  });

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }}></div>;
};

const MyPage: React.FC = () => {
  // Sample data and labels
  const data = [100, 200, 150, 300];
  const labels = ["Monday", "Tuesday", "Wednesday", "Thursday"];

  console.log("rerender");

  return (
    <div className="max-h-screen">
      <h1>Statistics</h1>
      <StatisticsChart data={data} labels={labels} />
    </div>
  );
};

export default MyPage;

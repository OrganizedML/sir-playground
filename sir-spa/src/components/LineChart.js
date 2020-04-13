import React from "react";
import { Line } from "react-chartjs-2";

const LineChart = React.memo(({ height, width, chartData, chartRef }) => {
  return (
    chartData && (
      <Line
        ref={chartRef}
        data={chartData}
        height={height}
        width={width}
        showTooltips={false}
        options={{
          maintainAspectRatio: false,
          responsive: false,
          elements: {
            point: {
              radius: 0,
            },
          },
        }}
      />
    )
  );
});
export { LineChart };

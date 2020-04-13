import React from "react";
import { Line } from "react-chartjs-2";

const LineChart = React.memo(({chartData, chartRef }) => {
  return (
    chartData && (
      <Line
        ref={chartRef}
        data={chartData}
        showTooltips={false}
        options={{
          maintainAspectRatio: true,
          responsive: true,
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

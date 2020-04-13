import React from "react";
import { Box, Typography, Grid } from "@material-ui/core";

const StatsDisplay = React.memo(({chartData=0, R0=-1}) => {
    var sus = 0
    var i = 0;
    var i_all = 0;
    var r = 0;
    if (chartData.datasets.length > 0) {
        sus = chartData.datasets[2].data.slice(-1);
        r = chartData.datasets[1].data.slice(-1);
        i = chartData.datasets[0].data.slice(-1);
        i_all = chartData.datasets[3].data.slice(-1);
    }
  return (
    <Grid>
        <Box>
        <Typography variant="overline">Susceptible: {sus}</Typography>
        </Box>
        <Box>
        <Typography variant="overline">Infected and tested: {i}</Typography>
        </Box>
        <Box>
        <Typography variant="overline">Infected (red + blue): {i_all}</Typography>
        </Box>
        <Box>
        <Typography variant="overline">Recovered: {r}</Typography>
        </Box>
    </Grid>
    
  );
});

export { StatsDisplay };
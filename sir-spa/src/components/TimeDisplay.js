import React from "react";
import { Box, Typography, Grid } from "@material-ui/core";
import DayIcon from "@material-ui/icons/WbSunny";
import NightIcon from "@material-ui/icons/NightsStay";

const TimeDisplay = React.memo(({ time, mode, day=0, R=1}) => {
  let isNight = mode === "night" || mode === "evening";
  return (
    <Grid>
    <Box
      display="flex"
      direction="column"
      alignItems="center"
      justify="center"
      /*
      <br></br>
      <Typography variant="overline">R0: {R}</Typography>
      */ // insert later
    >
      <Typography variant="overline">Day: {day}</Typography>
    </Box>
    <Box
      display="flex"
      direction="column"
      alignItems="center"
      justify="center"
      p={2}
    >
      {isNight && <NightIcon />}
      {!isNight && <DayIcon />}&nbsp;&nbsp;
      <Typography variant="overline">{time}</Typography>
    </Box>
  </Grid>
  );
});

export { TimeDisplay };
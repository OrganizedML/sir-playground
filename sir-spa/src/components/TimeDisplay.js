import React from "react";
import { Box, Typography } from "@material-ui/core";
import DayIcon from "@material-ui/icons/WbSunny";
import NightIcon from "@material-ui/icons/NightsStay";

const TimeDisplay = ({ time, mode }) => {
  let isNight = mode === "night" || mode === "evening";
  return (
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
  );
};

export { TimeDisplay };

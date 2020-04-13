import React, { useEffect, useState, useRef } from "react";
import { SIR_Model } from "model/Model";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Grid,
  Slider,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Link,
} from "@material-ui/core";
import { PixiRenderer } from "components/PixiRenderer";
import { TimeDisplay } from "components/TimeDisplay";
import { LineChart } from "components/LineChart";
import { SizeMe } from "react-sizeme";

let interval = null;
let model = null;

let history = [];

function App() {
  // For rendering
  const [worldState, setWorldState] = useState({
    agentList: [],
    hotSpots: [],
    chartData: { labels: [], datasets: [] },
    time: "00:00",
    dayPhase: "day",
    state: "stopped",
  });

  const [worldWidth, setWorldWidth] = useState(undefined);
  const [worldHeight, setWorldHeight] = useState(undefined);

  // Configuration
  const [initialInfected, setInitialInfected] = useState(5);
  const [initialSuspectible, setInitialSuspectible] = useState(200);
  const [probabilityRecognized, setProbabilityRecognized] = useState(0.3);
  const [infectionRadius, setInfectionRadius] = useState(2);
  const [spreadProbability, setSpreadProbability] = useState(0.01);
  const [strongerRepulsion, setStrongerRepulsion] = useState(false);
  const [stayAtHome, setStayAtHome] = useState(false);
  const [stayAtHomeAll, setStayAtHomeAll] = useState(false);
  const [infectionDuration, setInfectionDuration] = useState(5);
  const [profile, setProfile] = useState("unrestricted");
  const [stepDuration, setStepDuration] = useState(0.5);

  const chartRef = useRef(null);

  useEffect(() => {
    model = new SIR_Model(
      initialSuspectible,
      initialInfected,
      infectionRadius,
      spreadProbability,
      20,
      probabilityRecognized,
      999999999999,
      stayAtHome,
      strongerRepulsion,
      stayAtHomeAll
    );

    model.reset();
    model.initialize();
    setWorldHeight(model.height);
    setWorldWidth(model.width);
  }, []);

  useEffect(() => {
    let newWorldState = { ...worldState };
    let space = model.space;

    let newHotSpots = space.attractive_points.map((attractivePoint) => {
      return {
        pos: attractivePoint[0],
        strength: attractivePoint[1],
        range: attractivePoint[3],
        group: attractivePoint[4],
        tag: attractivePoint[5]
      };
    });
    newWorldState.hotSpots = newHotSpots;
    setWorldState(newWorldState);
  }, [model]);

  useEffect(() => {
    clearInterval(interval);
    if (worldState.state === "running") {
      interval = setInterval(() => {
        let newWorldState = { ...worldState };

        let newInfectedCount = 0;
        let newInfectedUnrecognizedCount = 0;
        let newSusceptibleCount = 0;
        let newRecoveredCount = 0;

        let isSimulationEnd = model.step();
        let hour =
          (model.step_num % model.steps_each_day) * (24 / model.steps_each_day);
        let newTime = new Date();
        newTime.setSeconds(0);
        newTime.setMinutes((hour % 1) * 60);
        newTime.setHours(hour);
        newWorldState.time = newTime.toLocaleTimeString("en-US");

        newWorldState.dayPhase = model.current_mode;

        let newAgentList = [];
        let newSList = model.s_list.map((agent) => {
          if (agent.infected === true) {
            agent.state = "infected_unrecognized";
            newInfectedUnrecognizedCount += 1;
          } else {
            agent.state = "susceptible";
            newSusceptibleCount += 1;
          }

          return Object.assign({}, agent);
        });

        newAgentList.push(...newSList);

        let newIList = model.i_list.map((agent) => {
          agent.state = "infected";
          newInfectedCount += 1;
          return Object.assign({}, agent);
        });
        newAgentList.push(...newIList);

        let newRList = model.r_list.map((agent) => {
          agent.state = "recovered";
          newRecoveredCount += 1;
          return Object.assign({}, agent);
        });
        newAgentList.push(...newRList);

        newWorldState.agentList = newAgentList;
        if (isSimulationEnd) {
          clearInterval(interval);
          newWorldState.state = "stopped";
        }

        let newHistoryElement = {
          infected: newInfectedCount,
          infectedUnrecognized: newInfectedUnrecognizedCount,
          recovered: newRecoveredCount,
          susceptible: newSusceptibleCount,
        };

        let newHistory = [...history];
        newHistory.push(newHistoryElement);
        history = newHistory;

        let newLabels = [];
        let newSDataset = {
          label: "Susceptible",
          fill: true,
          lineTension: 0.1,
          borderColor: "rgba(0,0,0,1)",
          data: [],
        };
        let newIDataset = {
          label: "Infected",
          fill: true,
          lineTension: 0.1,
          borderColor: "rgba(255,0,0,1)",
          data: [],
        };
        let newIIRDataset = {
          label: "All Infected",
          fill: true,
          lineTension: 0.1,
          borderColor: "rgba(255,0,0,0.4)",
          data: [],
        };

        let newRDataset = {
          label: "Recovered",
          fill: true,
          lineTension: 0.1,
          borderColor: "rgba(0,255,0,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          data: [],
        };
        newHistory.forEach((histEl, index) => {
          newSDataset.data.push(histEl.susceptible);
          newIDataset.data.push(histEl.infected);
          newRDataset.data.push(histEl.recovered);
          newIIRDataset.data.push(
            histEl.infected + histEl.infectedUnrecognized
          );
          newLabels.push(index);
        });

        let newChartData = {
          labels: newLabels,
          datasets: [newIDataset, newRDataset, newSDataset, newIIRDataset],
        };
        newWorldState.chartData = newChartData;

        setWorldState(newWorldState);
      }, stepDuration * 1000);
    } else {
      clearInterval(interval);
    }
  }, [worldState.state, stepDuration]);

  return (
    <Box display="flex" flexDirection="column" className="App" height="100%">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SIR Playground</Typography>
        </Toolbar>
      </AppBar>
      <Box mt={2} mb={2} flexGrow={1} overflow="hidden">
        <Container style={{ height: "100%" }}>
          <Box height="95%">
            <Grid container spacing={2} style={{ height: "100%" }}>
              <Grid item xs={4} height="100%">
                <Box p={2}>
                  <Typography variant="overline" gutterBottom>
                    Initial Infected
                  </Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={10}
                    value={initialInfected}
                    onChange={(event, newValue) => {
                      setInitialInfected(newValue);
                    }}
                  />
                  <Typography variant="overline" gutterBottom>
                    Population
                  </Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    step={25}
                    marks
                    min={25}
                    max={500}
                    value={initialSuspectible}
                    onChange={(event, newValue) => {
                      setInitialSuspectible(newValue);
                    }}
                  />
                  <Typography variant="overline" gutterBottom>
                    Probability Recognized
                  </Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    step={0.1}
                    marks
                    min={0}
                    max={1}
                    value={probabilityRecognized}
                    onChange={(event, newValue) => {
                      setProbabilityRecognized(newValue);
                    }}
                  />
                  <Typography variant="overline" gutterBottom>
                    Infection Radius
                  </Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={2}
                    max={4}
                    value={infectionRadius}
                    onChange={(event, newValue) => {
                      setInfectionRadius(newValue);
                    }}
                  />

                  <Typography variant="overline" gutterBottom>
                    Mean Infection Duration
                  </Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={3}
                    max={8}
                    value={infectionDuration}
                    onChange={(event, newValue) => {
                      setInfectionDuration(newValue);
                    }}
                  />

                  <Typography variant="overline" gutterBottom>
                    Spread Probability
                  </Typography>
                  <br />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={spreadProbability >= 0.1}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSpreadProbability(0.1);
                            model.set_spread_probability(0.1);
                          } else {
                            setSpreadProbability(0.01);
                            model.set_spread_probability(0.01);
                          }
                        }}
                      />
                    }
                    label="Increased Probability"
                  />
                  <br />

                  <Typography variant="overline" gutterBottom>
                    Social distancing
                  </Typography>
                  <br />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={strongerRepulsion}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setStrongerRepulsion(true);
                            model.set_stronger_repulsion(true);
                          } else {
                            setStrongerRepulsion(false);
                            model.set_stronger_repulsion(false);
                          }
                        }}
                      />
                    }
                    label="Try to hold distance"
                  />
                  <br />

                  <Typography variant="overline" gutterBottom>
                    Stay at home
                  </Typography>
                  <br />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stayAtHome}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setStayAtHome(true);
                            model.set_stay_at_home(true);
                          } else {
                            setStayAtHome(false);
                            model.set_stay_at_home(false);
                          }
                        }}
                      />
                    }
                    label="Infected"
                  />
                  <br />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stayAtHomeAll}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setStayAtHomeAll(true);
                            setStayAtHome(true);

                            model.set_stay_at_home(true);
                            model.set_exit_lock(true);
                          } else {
                            setStayAtHomeAll(false);
                            setStayAtHome(false);

                            model.set_stay_at_home(false);
                            model.set_exit_lock(false);
                          }
                        }}
                      />
                    }
                    label="Everybody"
                  />
                  <br />
                  <Box mt={2} mb={2}>
                    <Divider />
                  </Box>
                  <Typography variant="overline" gutterBottom>
                    Step Period (s)
                  </Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    step={0.1}
                    marks
                    min={0.1}
                    max={2.0}
                    value={stepDuration}
                    onChange={(event, newValue) => {
                      setStepDuration(newValue);
                    }}
                  />
                  <Box mt={2}>
                    <Button
                      color="primary"
                      variant="contained"
                      size="large"
                      onClick={() => {
                        let newWorldState = { ...worldState };
                        if (worldState.state == "running") {
                          newWorldState.state = "paused";
                          clearInterval(interval);
                        } else {
                          if (worldState.state == "stopped") {
                            model = new SIR_Model(
                              initialSuspectible,
                              initialInfected,
                              infectionRadius,
                              spreadProbability,
                              infectionDuration,
                              probabilityRecognized,
                              999999999999,
                              stayAtHome,
                              strongerRepulsion,
                              stayAtHomeAll
                            );

                            model.reset();
                            model.initialize();
                            setWorldHeight(model.height);
                            setWorldWidth(model.width);
                          }

                          newWorldState.state = "running";
                        }
                        setWorldState(newWorldState);
                      }}
                    >
                      {worldState.state === "running" ? "Pause" : "Start"}
                    </Button>
                    &nbsp;&nbsp;
                    <Button
                      color="primary"
                      variant="contained"
                      size="large"
                      onClick={() => {
                        let newWorldState = { ...worldState };
                        history = [];
                        newWorldState.state = "stopped";
                        setWorldState(newWorldState);
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <SizeMe monitorHeight>
                  {({ size }) => {
                    let minDim = Math.min(size.width, size.height * 0.7);
                    return (
                      <Box
                        height="100%"
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                      >
                        <PixiRenderer
                          worldState={worldState}
                          worldWidth={worldWidth}
                          worldHeight={worldHeight}
                          currentWidth={minDim}
                          currentHeight={minDim}
                          stepDuration={stepDuration}
                        />
                        {!isNaN(size.height) &&
                          !isNaN(size.width) &&
                          worldState.chartData && (
                            <LineChart
                              height={size.height - minDim - 10}
                              width={size.width}
                              chartData={worldState.chartData}
                              chartRef={chartRef}
                            />
                          )}
                      </Box>
                    );
                  }}
                </SizeMe>
              </Grid>
              <Grid item xs={2}>
                <TimeDisplay
                  time={worldState.time}
                  mode={worldState.dayPhase}
                />
              </Grid>
            </Grid>
          </Box>
          <Box height="5%" display="flex" justifyContent="center">
            <Typography variant="caption">SIR-Playground by <Link href="https://github.com/SYoy">SYoy</Link> and <Link href="https://github.com/dani2112">dani2112</Link></Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;

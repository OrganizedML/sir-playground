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
  MenuItem,
  Select,
  Button,
  Divider,
} from "@material-ui/core";
import { PixiRenderer } from "components/PixiRenderer";
import { Line } from "react-chartjs-2";
import { SizeMe } from "react-sizeme";

let interval = null;
let model = null;

let history = [];

function App() {
  // For rendering
  const [agentList, setAgentList] = useState([]);
  const [worldWidth, setWorldWidth] = useState(undefined);
  const [worldHeight, setWorldHeight] = useState(undefined);

  // For chart rendering
  // const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // Configuration
  const [gameState, setGameState] = useState("stopped");
  const [initialInfected, setInitialInfected] = useState(5);
  const [initialSuspectible, setInitialSuspectible] = useState(200);
  const [probabilityRecognized, setProbabilityRecognized] = useState(0.3);
  const [infectionRadius, setInfectionRadius] = useState(2);
  const [spreadProbability, setSpreadProbability] = useState(0.2);
  const [infectionDuration, setInfectionDuration] = useState(10);
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
      999999999999
    );

    model.reset();
    model.initialize();
    setWorldHeight(model.height);
    setWorldWidth(model.width);
  }, []);

  const updateModel = () => {
    let newInfectedCount = 0;
    let newInfectedUnrecognizedCount = 0;
    let newSusceptibleCount = 0;
    let newRecoveredCount = 0;

    let isSimulationEnd = model.step();
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

    setAgentList(newAgentList);
    if (isSimulationEnd) {
      clearInterval(interval);
      setGameState("stopped");
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
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      data: [],
    };
    let newIDataset = {
      label: "Infected",
      fill: true,
      lineTension: 0.1,
      borderColor: "rgba(255,0,0,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
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
      newLabels.push(index);
    });

    let newChartData = {
      labels: newLabels,
      datasets: [newIDataset, newRDataset, newSDataset],
    };

    setChartData(newChartData);
  };

  return (
    <Box display="flex" flexDirection="column" className="App" height="100%">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SIR Playground</Typography>
        </Toolbar>
      </AppBar>
      <Box mt={2} mb={2} flexGrow={1} overflow="hidden">
        <Container style={{ height: "100%" }}>
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
                  step={0.05}
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
                  min={1}
                  max={5}
                  value={infectionRadius}
                  onChange={(event, newValue) => {
                    setInfectionRadius(newValue);
                  }}
                />
                <Typography variant="overline" gutterBottom>
                  Spread Probability
                </Typography>
                <Slider
                  valueLabelDisplay="auto"
                  step={0.05}
                  marks
                  min={0}
                  max={1}
                  value={spreadProbability}
                  onChange={(event, newValue) => {
                    setSpreadProbability(newValue);
                  }}
                />

                <Typography variant="overline" gutterBottom>
                  Mean Infection Duration
                </Typography>
                <Slider
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={5}
                  max={15}
                  value={infectionDuration}
                  onChange={(event, newValue) => {
                    setInfectionDuration(newValue);
                  }}
                />

                <Typography variant="overline" gutterBottom>
                  Profile
                </Typography>
                <br />
                <Select
                  fullWidth
                  variant="outlined"
                  value={profile}
                  onChange={(event) => {
                    setProfile(event.target.value);
                  }}
                >
                  <MenuItem value={"unrestricted"}>Unrestricted</MenuItem>
                  <MenuItem value={"shopping_work"}>
                    Shopping &amp; Work
                  </MenuItem>
                  <MenuItem value={"meet_friends"}>Meet Friends</MenuItem>
                </Select>
                <Divider />
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
                      if (gameState == "running") {
                        setGameState("paused");
                        clearInterval(interval);
                      } else {
                        setGameState("running");
                        if (gameState == "stopped") {
                          model = new SIR_Model(
                            initialSuspectible,
                            initialInfected,
                            infectionRadius,
                            spreadProbability,
                            20,
                            probabilityRecognized,
                            999999999999
                          );

                          model.reset();
                          model.initialize();
                          setWorldHeight(model.height);
                          setWorldWidth(model.width);
                        }
                        interval = setInterval(
                          updateModel,
                          stepDuration * 1000
                        );
                      }
                    }}
                  >
                    {gameState == "running" ? "Pause" : "Start"}
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    onClick={() => {
                      history = [];
                      setGameState("stopped");
                      clearInterval(interval);
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <SizeMe monitorHeight>
                {({ size }) => {
                  let maxDim = Math.min(size.width, size.height)
                  return (
                    <Box
                      height="100%"
                      display="flex"
                      flexDirection="column"
                      overflow="hidden"
                    >
                      <PixiRenderer
                        agentList={agentList}
                        worldWidth={worldWidth}
                        worldHeight={worldHeight}
                        renderWidth={maxDim}
                        renderHeight={maxDim}
                        stepDuration={stepDuration}
                      />

                      {/* <Line
                        ref={chartRef}
                        data={chartData}
                        height={size.height * 0.1}
                        options={{
                          maintainAspectRatio: false,
                          elements: {
                            point: {
                              radius: 0,
                            },
                          },
                        }}
                      /> */}
                    </Box>
                  );
                }}
              </SizeMe>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default App;

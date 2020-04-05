import React, { useEffect, useState } from "react";
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

let interval = null;
let model = null;

function App() {
  // For rendering
  const [agentList, setAgentList] = useState([]);
  const [worldWidth, setWorldWidth] = useState(undefined);
  const [worldHeight, setWorldHeight] = useState(undefined);

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

  const updateModel = () => {
    let isSimulationEnd = model.step();
    let newAgentList = [];
    let newSList = model.s_list.map((agent) => {
      if (agent.infected === true) {
        agent.state = "infected_unrecognized";
      } else {
        agent.state = "susceptible";
      }

      return Object.assign({}, agent);
    });

    newAgentList.push(...newSList);

    let newIList = model.i_list.map((agent) => {
      agent.state = "infected";
      return Object.assign({}, agent);
    });
    newAgentList.push(...newIList);

    let newRList = model.r_list.map((agent) => {
      agent.state = "recovered";
      return Object.assign({}, agent);
    });
    newAgentList.push(...newRList);

    setAgentList(newAgentList);
    if (isSimulationEnd) {
      clearInterval(interval);
      setGameState("stopped");
    }
  };

  return (
    <Box display="flex" flexDirection="column" className="App" height="100%">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SIR Playground</Typography>
        </Toolbar>
      </AppBar>
      <Box mt={2} mb={2} flexGrow={1}>
        <Container style={{ height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
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
                        interval = setInterval(updateModel, 100);
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
              <PixiRenderer
                agentList={agentList}
                worldWidth={worldWidth}
                worldHeight={worldWidth}
                stepDuration={stepDuration}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default App;

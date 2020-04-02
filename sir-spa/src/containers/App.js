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
  Button
} from "@material-ui/core";
import { PixiRenderer } from "components/PixiRenderer";

let interval = null;
let model = null;

function App() {
  const [agentList, setAgentList] = useState([])
  const [gameState, setGameState] = useState("stopped");
  const [initialInfected, setInitialInfected] = useState(1);
  const [initialSuspectible, setInitialSuspectible] = useState(25);
  const [probabilityRecognized, setProbabilityRecognized] = useState(0.1);
  const [infectionRadius, setInfectionRadius] = useState(1);
  const [spreadProbability, setSpreadProbability] = useState(0.3);
  const [profile, setProfile] = useState("unrestricted");

  const updateModel = () => {
    model.step();
    let newAgentList = []
    let newSList = model.s_list.map((agent) => {
      agent.state = "susceptible"
      return agent
    })
    newAgentList.push(...newSList)

    let newIList = model.i_list.map((agent) => {
      agent.state = "infected"
      return agent
    })
    newAgentList.push(...newIList)

    let newRList = model.r_list.map((agent) => {
      agent.state = "recovered"
      return agent
    })
    newAgentList.push(...newRList)


    setAgentList(newAgentList)

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
                  Initial Suspectible
                </Typography>
                <Slider
                  valueLabelDisplay="auto"
                  step={25}
                  marks
                  min={25}
                  max={200}
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
                  max={3}
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
                  Profile
                </Typography>
                <br />
                <Select
                  fullWidth
                  variant="outlined"
                  value={profile}
                  onChange={event => {
                    setProfile(event.target.value);
                  }}
                >
                  <MenuItem value={"unrestricted"}>Unrestricted</MenuItem>
                  <MenuItem value={"shopping_work"}>
                    Shopping &amp; Work
                  </MenuItem>
                  <MenuItem value={"meet_friends"}>Meet Friends</MenuItem>
                </Select>
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
                            10,
                            probabilityRecognized,
                            200
                          );
                          model.reset()
                          model.initialize();
                        }
                        interval = setInterval(updateModel, 1000);
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
              <PixiRenderer agentList={agentList} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default App;

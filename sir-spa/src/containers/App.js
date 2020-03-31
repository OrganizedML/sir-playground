import React, { useEffect, useState } from "react";
import { Dummy } from "model/dummy";
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

function App() {

  console.log("render parent");

  const [gameState, setGameState] = useState({ status: "stopped" });
  const [initialInfected, setInitialInfected] = useState(1);
  const [initialSuspectible, setInitialSuspectible] = useState(25);
  const [probabilityRecognized, setProbabilityRecognized] = useState(0.1);
  const [infectionRadius, setInfectionRadius] = useState(1);
  const [spreadProbability, setSpreadProbability] = useState(0.3);
  const [profile, setProfile] = useState("unrestricted");

  useEffect(() => {
    let dummy = new Dummy(800, 600)
    dummy.doSomething() 
  })


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
                  fullWidth
                  color="primary"
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setGameState({ status: "running" });
                  }}
                >
                  Start
                </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <PixiRenderer gameState={gameState} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default App;

import { Button, Container, Grid, Typography } from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useMemo, useRef } from "react";
import useDb from "../infrastructure/firebase/use-db";
import useFirebase from "../infrastructure/firebase/use-firebase";
import useRoom from "./use-room";
// import useSound from "./use-sound";
import useTimer, { TimerType } from "./use-timer";
import timerStarting from "./sounds/timer-starting.mp3";
import timerEnding from "./sounds/timer-ending.mp3";

const App = () => {
  const timerStartingAudioRef = useRef<HTMLAudioElement>(null);
  const timerEndingAudioRef = useRef<HTMLAudioElement>(null);

  const firebase = useFirebase();
  const db = useDb(firebase.app);
  const { room } = useRoom(db);
  const { startNewTimer, timeLeft } = useTimer(
    db,
    room,
    timerStartingAudioRef,
    timerEndingAudioRef
  );
  // const { soundElement: SoundElement } = useSound();

  const theme = useMemo(() => createTheme({ palette: { mode: "dark" } }), []);

  return (
    <ThemeProvider theme={theme}>
      <Container
        sx={{
          bgcolor: "background.default",
          height: "100vh",
          minWidth: "100%",
          padding: 5,
        }}
      >
        <Grid container direction="column" alignContent="center" spacing={3}>
          <Grid item>
            <Typography
              align="center"
              variant="h4"
              sx={{ color: "text.secondary" }}
            >
              {room?.name}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              align="center"
              variant="h6"
              sx={{ color: "text.secondary" }}
            >
              {timeLeft.type}
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              align="center"
              variant="h1"
              sx={{ color: "text.primary" }}
            >
              {timeLeft.minutes.toString().padStart(2, "0")}:
              {timeLeft.seconds.toString().padStart(2, "0")}
            </Typography>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="row"
              justifyContent="space-evenly"
              spacing={1}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => startNewTimer(25 * 60, TimerType.Work)}
                >
                  Work
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => startNewTimer(5 * 60, TimerType.Break)}
                >
                  Switch
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => startNewTimer(10 * 60, TimerType.Break)}
                >
                  Break
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <audio src={timerEnding} ref={timerEndingAudioRef}>
          timerStarting
        </audio>
        <audio src={timerStarting} ref={timerStartingAudioRef}>
          timerStarting
        </audio>
      </Container>
    </ThemeProvider>
  );
};

export default App;

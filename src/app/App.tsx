import {
  Button,
  Container,
  Dialog,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useMemo, useRef, useState } from "react";
import useDb from "../infrastructure/firebase/use-db";
import useFirebase from "../infrastructure/firebase/use-firebase";
import useRoom from "./use-room";
import useTimer, { TimerType } from "./use-timer";
import timerStarting from "./sounds/timer-starting.mp3";
import timerEnding from "./sounds/timer-ending.mp3";
import useDocumentTitle from "./use-document-title";

const App = () => {
  const [attributionsOpen, setAttributionsOpen] = useState<boolean>(false);

  const timerStartingAudioRef = useRef<HTMLAudioElement>(null);
  const timerEndingAudioRef = useRef<HTMLAudioElement>(null);

  const firebase = useFirebase();
  const db = useDb(firebase.app);
  const { room } = useRoom(db);
  const { start, timeLeft } = useTimer(
    db,
    room,
    timerStartingAudioRef,
    timerEndingAudioRef
  );
  const timer = `${timeLeft.minutes
    .toString()
    .padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}`;

  useDocumentTitle(`${timer} - ${timeLeft.type} - Tomat`);

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
              {timer}
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
                  onClick={() => start(25 * 60, TimerType.Work)}
                >
                  Work
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => start(5 * 60, TimerType.Break)}
                >
                  Switch
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => start(10 * 60, TimerType.Break)}
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
        <Button
          size="small"
          color="secondary"
          style={{ position: "absolute", left: 5, bottom: 5 }}
          onClick={() => setAttributionsOpen(true)}
        >
          Attributions
        </Button>

        <Dialog open={attributionsOpen}>
          <Button
            href="https://www.flaticon.com/free-icons/tomato"
            title="tomato icons"
            rel="noopener"
            target="_blank"
          >
            Tomato icons created by Pixel perfect - Flaticon
          </Button>
          <Button color="secondary" onClick={() => setAttributionsOpen(false)}>
            Close
          </Button>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default App;

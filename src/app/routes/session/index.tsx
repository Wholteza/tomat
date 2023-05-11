import {
  Grid,
  Typography,
  Button,
  TextField,
  Dialog,
  Paper,
  useTheme,
  Container,
} from "@mui/material";
import useTimer, { TimerType } from "../../use-timer";
import timerStarting from "../../sounds/timer-starting.mp3";
import timerEnding from "../../sounds/timer-ending.mp3";
import { useCallback, useContext, useRef, useState } from "react";
import FirebaseContext from "../../contexts/firebase";
import useRoom from "../../use-room";
import useDocumentTitle from "../../use-document-title";
import { SxProps, Theme } from "@mui/system";

export default () => {
  const theme = useTheme();
  const { db } = useContext(FirebaseContext);
  const { room } = useRoom(db);
  const [customTime, setCustomTime] = useState<number>();
  const timerStartingAudioRef = useRef<HTMLAudioElement>(null);
  const timerEndingAudioRef = useRef<HTMLAudioElement>(null);

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

  const handleOnStart = useCallback(
    (time: number, type: TimerType) => start(time * 60, type),
    [start]
  );
  const paperStyle: SxProps<Theme> = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  };

  return (
    <>
      <Container
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          [theme.breakpoints.down("sm")]: {
            display: "block",
          },
        }}
      >
        <Grid
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 400px)",
            gridTemplateRows: "repeat(2, 400px)",
            [theme.breakpoints.down("md")]: {
              gridTemplateColumns: "repeat(2, 300px)",
              gridTemplateRows: "repeat(2, 300px)",
            },
            [theme.breakpoints.down("sm")]: {
              gridTemplateColumns: "repeat(1, 100%)",
              gridTemplateRows: "repeat(4, 250px)",
            },
          }}
          gap={2}
        >
          <Paper sx={paperStyle}>
            <Typography
              align="center"
              variant="h1"
              display="block"
              sx={{
                fontSize: 110,
                [theme.breakpoints.down("md")]: {
                  fontSize: 90,
                },
                [theme.breakpoints.down("sm")]: {
                  fontSize: 70,
                },
              }}
            >
              {timer}
            </Typography>
          </Paper>
          <Paper sx={paperStyle}>
            <Grid
              container
              direction="column"
              alignContent="center"
              spacing={3}
            >
              <Grid item>
                <Typography
                  align="center"
                  variant="h4"
                  sx={{ color: "text.secondary", textTransform: "capitalize" }}
                >
                  {room?.name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  align="center"
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  {timeLeft.type === TimerType.Work
                    ? "Turn off all distractions and focus on the task at hand. "
                    : "You're on a break!"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={paperStyle}>
            <Grid
              container
              direction="column"
              alignContent="center"
              spacing={3}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => handleOnStart(25, TimerType.Work)}
                >
                  25 Minute work timer
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => handleOnStart(5, TimerType.Break)}
                >
                  Short 5 minute break
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => handleOnStart(10, TimerType.Break)}
                >
                  Longer 10 minute break
                </Button>
              </Grid>
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-evenly"
                  spacing={1}
                  alignItems="center"
                >
                  <Grid item>
                    <TextField
                      variant="standard"
                      autoComplete="off"
                      label="Custom time (minutes)"
                      size="small"
                      value={customTime ?? ""}
                      onChange={(event) =>
                        setCustomTime((prev) => {
                          if (event.target.value === "") return undefined;
                          const number = Number.parseInt(event.target.value);
                          return isNaN(number) ? prev : number;
                        })
                      }
                      onKeyUp={(event) => {
                        if (event.key !== "Enter") return;
                        handleOnStart(customTime ?? 25, TimerType.Work);
                      }}
                    />
                  </Grid>
                  <Grid item alignSelf={"flex-end"}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() =>
                        handleOnStart(customTime ?? 25, TimerType.Work)
                      }
                    >
                      Start
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ ...paperStyle, flexDirection: "column" }}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Need help?
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              Decide on a task to dedicate a session to, then start a 25 minute
              timer and try to eliminate all distractions.
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              When the 25 minutes have passed, take a short break and do
              something else.
            </Typography>
            <Typography variant="body2">
              Repeat this for some time until you feel like you need a longer
              break.
            </Typography>
          </Paper>
        </Grid>
      </Container>

      <audio src={timerEnding} ref={timerEndingAudioRef}>
        timerStarting
      </audio>
      <audio src={timerStarting} ref={timerStartingAudioRef}>
        timerStarting
      </audio>
    </>
  );
};

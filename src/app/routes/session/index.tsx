import { Grid, Typography, Button, TextField, Dialog } from "@mui/material";
import useTimer, { TimerType } from "../../use-timer";
import timerStarting from "../../sounds/timer-starting.mp3";
import timerEnding from "../../sounds/timer-ending.mp3";
import { useCallback, useContext, useRef, useState } from "react";
import FirebaseContext from "../../contexts/firebase";
import useRoom from "../../use-room";
import useDocumentTitle from "../../use-document-title";

export default () => {
  const { db } = useContext(FirebaseContext);
  const { room } = useRoom(db);

  const [attributionsOpen, setAttributionsOpen] = useState<boolean>(false);
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
  return (
    <>
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
                onClick={() => handleOnStart(25, TimerType.Work)}
              >
                Work
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => handleOnStart(5, TimerType.Break)}
              >
                Switch
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => handleOnStart(10, TimerType.Break)}
              >
                Break
              </Button>
            </Grid>
          </Grid>
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
                onClick={() => handleOnStart(customTime ?? 25, TimerType.Work)}
              >
                Start
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
        color="primary"
        style={{ position: "absolute", right: 20, bottom: 20 }}
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
    </>
  );
};

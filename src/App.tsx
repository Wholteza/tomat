import { Button, Container, Grid, Typography } from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useMemo } from "react";
import useFirebase from "./infrastructure/firebase/use-firebase";
import useRoom from "./use-room";
import useTimer, { TimerType } from "./use-timer";

const App = () => {
  const firebase = useFirebase();
  // Update the theme only if the mode changes
  const theme = useMemo(() => createTheme({ palette: { mode: "dark" } }), []);
  const { room } = useRoom(firebase.app);
  const { startNewTimer, timeLeft } = useTimer(firebase.app, room);

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
      </Container>
    </ThemeProvider>
  );
};

export default App;

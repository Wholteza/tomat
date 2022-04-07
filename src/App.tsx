import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import useFirebase from "./infrastructure/firebase/use-firebase";
import useRoom from "./use-room";

const App = () => {
  const firebase = useFirebase();
  // Update the theme only if the mode changes
  const theme = useMemo(() => createTheme({ palette: { mode: "dark" } }), []);
  const { timeLeft } = useRoom();

  return (
    <ThemeProvider theme={theme}>
      <Typography variant="h1">
        {timeLeft.minutes}:{timeLeft.seconds}
      </Typography>
    </ThemeProvider>
  );
};

export default App;

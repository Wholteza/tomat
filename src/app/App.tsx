import { Container } from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useMemo } from "react";
import useDb from "../infrastructure/firebase/use-db";
import useFirebase from "../infrastructure/firebase/use-firebase";

import { Route, Routes } from "react-router-dom";
import Home from "./routes/home";
import Session from "./routes/session";
import FirebaseContext from "./contexts/firebase";

const App = () => {
  const firebase = useFirebase();
  const db = useDb(firebase.app);

  const theme = useMemo(() => createTheme({ palette: { mode: "dark" } }), []);

  return (
    <ThemeProvider theme={theme}>
      <FirebaseContext.Provider value={{ db }}>
        <Container
          sx={{
            bgcolor: "background.default",
            height: "100vh",
            minWidth: "100%",
            padding: 5,
            color: "text.secondary",
          }}
        >
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/*" element={<Session />} />
            </Routes>
          </>
        </Container>
      </FirebaseContext.Provider>
    </ThemeProvider>
  );
};

export default App;

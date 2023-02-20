import { Button, Container } from "@mui/material";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useMemo } from "react";
import useDb from "../infrastructure/firebase/use-db";
import useFirebase from "../infrastructure/firebase/use-firebase";

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./routes/home";
import Session from "./routes/session";
import FirebaseContext from "./contexts/firebase";
import ReleaseNotes from "./components/release-notes";
import Attributions from "./components/attributions";
import BottomRight from "./components/bottom-right";

const App = () => {
  const firebase = useFirebase();
  const db = useDb(firebase.app);

  const theme = useMemo(() => createTheme({ palette: { mode: "dark" } }), []);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goBackButton = useMemo<JSX.Element>(() => {
    if (pathname === "/") return <></>;
    return <Button onClick={() => navigate("/")}>Go Back</Button>;
  }, [navigate, pathname]);

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
          <BottomRight>
            {goBackButton}
            <ReleaseNotes />
            <Attributions />
          </BottomRight>
        </Container>
      </FirebaseContext.Provider>
    </ThemeProvider>
  );
};

export default App;

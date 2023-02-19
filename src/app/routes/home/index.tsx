import {
  Container,
  Typography,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReleaseNotes from "../../components/release-notes";

export default () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [roomNameInput, setRoomNameInput] = useState<string>("");
  return (
    <Container sx={{ margin: "0 auto" }}>
      <Container>
        <ReleaseNotes />
        <Typography variant="h2">Tomat</Typography>
        <Typography variant="caption">A bare bones pomodoro timer</Typography>
        <Typography sx={{ padding: "5px" }}>
          To start a session use the input below or append /YourRoomName to the
          current address.
        </Typography>
        <Typography sx={{ padding: "5px" }}>
          Sessions are public. Just send the session address to your teammates
          to have a shared timer.
        </Typography>
        <Container
          sx={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "row",
            [theme.breakpoints.down("sm")]: {
              flexDirection: "column",
            },
          }}
          disableGutters
        >
          <TextField
            sx={{
              [theme.breakpoints.down("sm")]: {
                flex: 1,
              },
            }}
            variant="standard"
            size="small"
            value={roomNameInput}
            onChange={(event) =>
              setRoomNameInput(event.currentTarget.value ?? "")
            }
            placeholder="Enter a session name"
            onKeyUp={(event) => {
              if (event.key !== "Enter" || !roomNameInput.length) return;
              navigate({ pathname: `/${roomNameInput}` });
            }}
          />
          <Button
            sx={{
              marginLeft: "20px",
              [theme.breakpoints.down("sm")]: {
                flex: 1,
                marginLeft: 0,
                marginTop: "8px",
              },
            }}
            variant="outlined"
            size="small"
            color="primary"
            onClick={() =>
              roomNameInput.length &&
              navigate({ pathname: `/${roomNameInput}` })
            }
          >
            Join session
          </Button>
        </Container>
      </Container>
    </Container>
  );
};

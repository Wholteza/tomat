import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import Button from "@mui/material/Button";
import useFirebase from "./infrastructure/firebase/use-firebase";

const App = () => {
  const firebase = useFirebase();
  return (
    <Button variant="contained">
      {firebase.app.options.projectId}
      <AccessAlarmIcon />
    </Button>
  );
};

export default App;

import {
  Button,
  Container,
  Dialog,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useState } from "react";

type ReleaseNote = {
  type: "New";
  text: string;
};

type Version = {
  versionNumber: string;
  releaseNotes: ReleaseNote[];
};

const versions: Version[] = [
  {
    versionNumber: "1",
    releaseNotes: [
      {
        type: "New",
        text: "Added landing page with informational text and join session button.",
      },
      {
        type: "New",
        text: "Added support for multiple sessions by appending session name to the url.",
      },
    ],
  },
];

const ReleaseNotes = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button
        sx={{ position: "absolute", bottom: 20, right: 20 }}
        onClick={() => setIsOpen(true)}
      >
        Release Notes
      </Button>
      <Dialog open={isOpen}>
        <Container sx={{ marginTop: 2, overflowY: "auto" }}>
          {versions.map((version) => (
            <div key={version.versionNumber}>
              <Typography variant="h5">
                Version: {version.versionNumber}
              </Typography>

              <List>
                {version.releaseNotes.map((releaseNote) => (
                  <ListItem
                    key={`${version.versionNumber}-${releaseNote.text}`}
                  >
                    <Typography>
                      {releaseNote.type}: {releaseNote.text}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </div>
          ))}
        </Container>
        <Button sx={{ padding: 2 }} onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </Dialog>
    </>
  );
};

export default ReleaseNotes;

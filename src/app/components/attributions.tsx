import { Button, Dialog } from "@mui/material";
import { useState } from "react";

export default () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Button color="primary" onClick={() => setIsOpen(true)}>
        Attributions
      </Button>

      <Dialog open={isOpen}>
        <Button
          href="https://www.flaticon.com/free-icons/tomato"
          title="tomato icons"
          rel="noopener"
          target="_blank"
        >
          Tomato icons created by Pixel perfect - Flaticon
        </Button>
        <Button color="secondary" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </Dialog>
    </>
  );
};

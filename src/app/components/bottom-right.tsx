import { Container, useTheme } from "@mui/material";
import { PropsWithChildren } from "react";

export default (props: PropsWithChildren<{}>): JSX.Element => {
  const theme = useTheme();
  return (
    <Container
      sx={{
        position: "absolute",
        bottom: 0,
        right: 0,
        display: "flex",
        justifyContent: "end",
        padding: "20px",
        "> *": {
          marginLeft: "20px",
        },
        [theme.breakpoints.down("sm")]: {
          justifyContent: "center",
          flexDirection: "column",
          "> *": {
            marginLeft: 0,
            margin: "5px",
          },
        },
      }}
    >
      {props.children}
    </Container>
  );
};

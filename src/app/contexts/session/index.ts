import React from "react";
import { Room } from "../../use-room";

type SessionContextProps = {
  room?: Room;
};

const SessionContext = React.createContext<SessionContextProps>({});

export default SessionContext;

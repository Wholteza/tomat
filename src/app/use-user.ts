import { Firestore } from "firebase/firestore";
import { useCallback, useState } from "react";
import { User } from "../infrastructure/firebase/user.entity";

type Props = {
  user: User;
  changeUsername: (name: string) => void;
};

const useUser = (db: Firestore, name: string): Props => {
  const [user, setUser] = useState<User>(new User(name));
  const changeUsername = (name: string) =>
    setUser((prev) => ({ ...prev, name }));
  return { user, changeUsername };
};

export default useUser;

import { FirestoreDataConverter } from "firebase/firestore";
import EntityBase from "./firebase-entity";

export class User extends EntityBase {
  public name: string;

  public constructor(name: string) {
    super();
    this.name = name;
  }

  public static converter: FirestoreDataConverter<User> = {
    toFirestore: (user) => ({
      name: user.name,
    }),
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      const user = new User(data.name);
      return user;
    },
  };
}

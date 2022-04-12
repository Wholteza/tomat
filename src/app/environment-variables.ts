class Mode {
  mode: string;
  constructor(mode: string) {
    this.mode = mode;
  }

  isLocalhost = () => this.mode === "localhost";
}

export default {
  MODE: new Mode(import.meta.env.MODE),
};

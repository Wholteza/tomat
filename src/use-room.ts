import { add, differenceInSeconds } from "date-fns";
import { useState } from "react";
import { useInterval } from "usehooks-ts";

enum TimerType {
  Work = "Work",
  Break = "Break",
}

type Timer = {
  startTime: Date;
  type: TimerType;
  durationSeconds: number;
};

type TimeLeft = { minutes: number; seconds: number };

const getTimeLeft = (timer: Timer) => {
  const endTime = add(timer.startTime, { seconds: timer.durationSeconds });
  const difference = differenceInSeconds(endTime, new Date(Date.now()));
  return { minutes: Math.floor(difference / 60), seconds: difference % 60 };
};

type Props = {
  timeLeft: TimeLeft;
};

const useRoom = (): Props => {
  const [timer] = useState<Timer>({
    type: TimerType.Work,
    durationSeconds: 25 * 60,
    startTime: new Date(Date.now()),
  });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    (timer && getTimeLeft(timer)) || {
      minutes: 0,
      seconds: 0,
    }
  );

  useInterval(() => {
    timer && setTimeLeft(getTimeLeft(timer));
  }, 100);

  return { timeLeft };
};

export default useRoom;

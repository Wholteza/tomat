import { add, differenceInSeconds } from "date-fns";
import { useCallback, useState } from "react";
import { useInterval } from "usehooks-ts";

export enum TimerType {
  Work = "Work",
  Break = "Break",
}

type Timer = {
  startTime: Date;
  type: TimerType;
  durationSeconds: number;
};

type TimeLeft = { minutes: number; seconds: number; finished: boolean };

const getTimeLeft = (timer: Timer) => {
  const endTime = add(timer.startTime, { seconds: timer.durationSeconds });
  const difference = differenceInSeconds(endTime, new Date(Date.now()));
  return {
    minutes: Math.floor(difference / 60),
    seconds: difference % 60,
    finished: difference <= 0,
  };
};

type Props = {
  timeLeft: TimeLeft;
  startNewTimer: (durationSeconds: number, type: TimerType) => void;
};
const createTimer = (durationSeconds: number, type: TimerType): Timer => ({
  type,
  durationSeconds,
  startTime: new Date(Date.now()),
});

const useRoom = (): Props => {
  const [timer, setTimer] = useState<Timer>(createTimer(0, TimerType.Work));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    (timer && getTimeLeft(timer)) || {
      minutes: 0,
      seconds: 0,
    }
  );

  useInterval(() => {
    let newTime: TimeLeft = timer && getTimeLeft(timer);
    if (newTime.finished) newTime = { ...newTime, minutes: 0, seconds: 0 };
    setTimeLeft(newTime);
  }, 10);

  const startNewTimer = useCallback(
    (durationSeconds: number, type: TimerType) =>
      setTimer(createTimer(durationSeconds, type)),
    []
  );

  return { timeLeft, startNewTimer };
};

export default useRoom;

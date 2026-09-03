import {
  startOfDay,
  endOfDay,
} from "date-fns";

export const getTodayRange = () => {
  return {
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  };
};
import { createContext, useContext, useEffect, useState } from "react";

const AvailabilityContext = createContext();

const LEAD_TIME_DAYS = 3;

function getMinimumOrderDate() {
  const date = new Date();

  date.setDate(date.getDate() + LEAD_TIME_DAYS);

  return date.toISOString().split("T")[0];
}

function getInitialUnavailableDates() {
  const savedDates = localStorage.getItem("crumbCoUnavailableDates");

  return savedDates ? JSON.parse(savedDates) : [];
}

export function AvailabilityProvider({ children }) {
  const [unavailableDates, setUnavailableDates] = useState(
    getInitialUnavailableDates,
  );

  useEffect(() => {
    localStorage.setItem(
      "crumbCoUnavailableDates",
      JSON.stringify(unavailableDates),
    );
  }, [unavailableDates]);

  function toggleUnavailable(date) {
    setUnavailableDates((currentDates) => {
      if (currentDates.includes(date)) {
        return currentDates.filter((item) => item !== date);
      }

      return [...currentDates, date];
    });
  }

  return (
    <AvailabilityContext.Provider
      value={{
        unavailableDates,
        toggleUnavailable,
        minimumOrderDate: getMinimumOrderDate(),
        leadTimeDays: LEAD_TIME_DAYS,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailability() {
  return useContext(AvailabilityContext);
}

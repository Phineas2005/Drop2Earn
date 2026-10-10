"use client";

import { useState } from "react";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function TimeGreeting() {
  const [greeting] = useState(() => getGreeting(new Date().getHours()));

  return <span>{greeting}, Zambia.</span>;
}

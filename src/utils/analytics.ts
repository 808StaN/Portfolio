import type { BeforeSendEvent } from "@vercel/analytics/react";

const storageKey = "portfolio:analytics-disabled";
const url = new URL(window.location.href);
const preference = url.searchParams.get("analytics");
let disabled = preference === "off";

try {
  if (preference === "off") {
    window.localStorage.setItem(storageKey, "true");
  } else if (preference === "on") {
    window.localStorage.removeItem(storageKey);
  } else {
    disabled = window.localStorage.getItem(storageKey) === "true";
  }
} catch {
  // The URL preference still applies to this visit if storage is unavailable.
}

if (preference === "off" || preference === "on") {
  url.searchParams.delete("analytics");
  window.history.replaceState(window.history.state, "", url);
}

export function beforeSendAnalytics(event: BeforeSendEvent) {
  return disabled ? null : event;
}

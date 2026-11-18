import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App";
import LenisScroll from "./components/LenisScroll";
import { beforeSendAnalytics } from "./utils/analytics";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LenisScroll>
      <App />
    </LenisScroll>
    <Analytics beforeSend={beforeSendAnalytics} />
  </StrictMode>
);

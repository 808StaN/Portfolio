import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import LenisScroll from "./components/LenisScroll";
import ServicesPage from "./pages/ServicesPage";
import { beforeSendAnalytics } from "./utils/analytics";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LenisScroll>
      <ServicesPage />
    </LenisScroll>
    <Analytics beforeSend={beforeSendAnalytics} />
  </StrictMode>,
);

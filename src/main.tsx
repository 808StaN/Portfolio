import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App";
import LenisScroll from "./components/LenisScroll";
import { beforeSendAnalytics } from "./utils/analytics";

const isServicesRoute = window.location.pathname.replace(/\/$/, "") === "/uslugi";
document.documentElement.dataset.site = isServicesRoute ? "services" : "portfolio";
const ServicesPage = lazy(() => import("./pages/ServicesPage"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isServicesRoute ? (
      <LenisScroll>
        <Suspense fallback={null}>
          <ServicesPage />
        </Suspense>
      </LenisScroll>
    ) : (
      <LenisScroll>
        <App />
      </LenisScroll>
    )}
    <Analytics beforeSend={beforeSendAnalytics} />
  </StrictMode>
);

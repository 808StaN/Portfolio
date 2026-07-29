import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import LenisScroll from "./components/LenisScroll";

const isServicesRoute = window.location.pathname.replace(/\/$/, "") === "/uslugi";
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
  </StrictMode>
);

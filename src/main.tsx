import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import LenisScroll from "./components/LenisScroll";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LenisScroll>
      <App />
    </LenisScroll>
  </StrictMode>
);

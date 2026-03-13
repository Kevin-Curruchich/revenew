import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { initializeTheme } from "./lib/theme";

import { RevenewApp } from "./RevenewApp.tsx";

initializeTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RevenewApp />
  </StrictMode>,
);

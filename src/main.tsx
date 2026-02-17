import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RevenewApp } from "./RevenewApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RevenewApp />
  </StrictMode>,
);

import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

startTransition(() => {
  const el = document.getElementById("app");
  if (!el) throw new Error("Missing #app");
  createRoot(el).render(
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});

import { createHashHistory, createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    scrollRestoration: true,
    ...(import.meta.env.VITE_PAGES_DEPLOY === "1"
      ? { history: createHashHistory() }
      : {}),
  });
}

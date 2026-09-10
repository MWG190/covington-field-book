import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Footprints, MapPinned, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BOOK_NAV = [
  { to: "/", label: "Briefing", icon: BookOpen },
  { to: "/voters", label: "Voter file", icon: Table2 },
] as const;

const WALK_NAV = [
  { to: "/walk", label: "Door lists" },
  { to: "/turf", label: "Turf cutter" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as {
    neighborhood?: string;
    district?: string;
  };
  const walkSearch = {
    ...(search.neighborhood ? { neighborhood: search.neighborhood } : {}),
    ...(search.district ? { district: search.district } : {}),
  };
  const isWalk = pathname === "/walk" || pathname === "/turf" || pathname.startsWith("/walk/");

  if (isWalk) {
    return (
      <div className="min-h-dvh bg-paper text-ink">
        <header className="sticky top-0 z-30 bg-river text-river-fg">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="display text-lg">Walk Program</p>
              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-river-fg/70">
                Door lists · turf cutter · Inman IDs
              </p>
            </div>
            <Link
              to="/voters"
              className="inline-flex h-11 shrink-0 items-center rounded-[var(--radius-sm)] bg-river-fg/12 px-3 text-sm font-medium text-river-fg hover:bg-river-fg/18"
            >
              Field Book
            </Link>
          </div>
          <nav className="mx-auto flex max-w-7xl gap-1 px-4 pb-3" aria-label="Walk Program">
            {WALK_NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  search={walkSearch}
                  className={cn(
                    "inline-flex h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium",
                    active ? "bg-river-fg text-river" : "bg-river-fg/12 text-river-fg hover:bg-river-fg/18",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 pb-12 pt-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="min-w-0">
            <p className="display text-lg text-ink">Covington Field Book</p>
            <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted">
              Plan 2 · living document · voter file
            </p>
          </Link>
          <div className="flex items-center gap-1">
            <nav className="hidden items-center gap-1 md:flex">
              {BOOK_NAV.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-medium",
                      active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex overflow-hidden rounded-[var(--radius-sm)] bg-river">
              <Link
                to="/walk"
                className="inline-flex h-11 items-center gap-1.5 px-3 text-sm font-medium text-river-fg hover:bg-river-fg/10"
              >
                <Footprints className="size-4" strokeWidth={1.75} />
                Walk
              </Link>
              <Link
                to="/turf"
                className="inline-flex h-11 items-center gap-1.5 border-l border-river-fg/20 px-3 text-sm font-medium text-river-fg hover:bg-river-fg/10"
              >
                <MapPinned className="size-4" strokeWidth={1.75} />
                Turf
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:pb-12">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-4">
          {BOOK_NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-river" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/walk"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted"
          >
            <Footprints className="size-5" strokeWidth={1.75} />
            Walk
          </Link>
          <Link
            to="/turf"
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted"
          >
            <MapPinned className="size-5" strokeWidth={1.75} />
            Turf
          </Link>
        </div>
      </nav>
    </div>
  );
}

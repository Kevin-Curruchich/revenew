import { NavLink, Outlet } from "react-router";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TabNavItem {
  /** Path relative to the parent route, e.g. "calendar". */
  to: string;
  label: string;
  /** Count shown next to the label; hidden when 0 or missing. */
  badge?: number;
}

/**
 * Tabs that are child routes: the selected tab lives in the path, so a link
 * opens the same tab.
 */
export const TabNavLayout = ({ tabs, label }: { tabs: TabNavItem[]; label: string }) => (
  <div className="space-y-6">
    <nav aria-label={label} className="flex flex-wrap gap-2 border-b pb-3">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }))
          }
        >
          {tab.label}
          {tab.badge ? (
            <span className="ml-1 rounded-full bg-destructive px-1.5 text-xs font-medium text-white">
              {tab.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
    <Outlet />
  </div>
);

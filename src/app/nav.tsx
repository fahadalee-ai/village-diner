import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ScreenName =
  | "splash"
  | "onboarding"
  | "login"
  | "register"
  | "forgot"
  | "forgot-done"
  | "reset"
  | "otp"
  | "home"
  | "menu"
  | "cart"
  | "rewards"
  | "account"
  | "item"
  | "omelette"
  | "checkout"
  | "confirm"
  | "track"
  | "catering"
  | "catering-menu"
  | "catering-packages"
  | "catering-form"
  | "catering-done"
  | "events"
  | "event"
  | "parties"
  | "party-form"
  | "notifications"
  | "notif-prefs"
  | "notif-priming"
  | "contact"
  | "about"
  | "support"
  | "feedback"
  | "privacy"
  | "terms"
  | "favorites"
  | "orders"
  | "order"
  | "edit-profile"
  | "addresses"
  | "payments"
  | "settings"
  | "offline"
  | "maintenance"
  | "force-update"
  | "location-priming";

export type Frame = { name: ScreenName; params?: Record<string, string> };

export type MenuFocus = { meal?: string; category?: string; q?: string };

type NavApi = {
  stack: Frame[];
  current: Frame;
  menuFocus: MenuFocus | null;
  clearMenuFocus: () => void;
  push: (name: ScreenName, params?: Record<string, string>) => void;
  pop: () => void;
  replace: (name: ScreenName, params?: Record<string, string>) => void;
  reset: (name: ScreenName, params?: Record<string, string>) => void;
  goTab: (name: ScreenName) => void;
  openMenu: (focus?: MenuFocus) => void;
};

const Ctx = createContext<NavApi | null>(null);

export const TAB_ROOTS: ScreenName[] = ["home", "menu", "cart", "rewards", "account"];
export const SHEET_SCREENS: ScreenName[] = ["item", "omelette"];

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Frame[]>([{ name: "splash" }]);
  const [menuFocus, setMenuFocus] = useState<MenuFocus | null>(null);
  const current = stack[stack.length - 1] ?? { name: "splash" as const };

  const api = useMemo<NavApi>(
    () => ({
      stack,
      current,
      menuFocus,
      clearMenuFocus: () => setMenuFocus(null),
      push: (name, params) => setStack((prev) => [...prev, { name, params }]),
      pop: () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)),
      replace: (name, params) => setStack((prev) => [...prev.slice(0, -1), { name, params }]),
      reset: (name, params) => setStack([{ name, params }]),
      goTab: (name) => setStack([{ name }]),
      openMenu: (focus) => {
        setMenuFocus(focus ?? {});
        setStack([{ name: "menu" }]);
      },
    }),
    [stack, current, menuFocus],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNav must be used inside NavigationProvider");
  return ctx;
}

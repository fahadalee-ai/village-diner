import { useEffect, useState } from "react";
import { FONT_BODY, FONT_DISPLAY } from "@/theme/typography";
import { useApp } from "@/lib/store";
import { NavigationProvider, SHEET_SCREENS, TAB_ROOTS, useNav, type ScreenName } from "./nav";
import { PhoneFrame, Toasts } from "@/components/ios";
import { SFIcon, type SFName } from "@/components/sf";
import { Splash, Onboarding, Login, Register, Forgot, ForgotDone, ResetPassword, Otp } from "./screens/flow";
import { Home } from "./screens/home";
import { ItemScreen, MenuScreen, OmeletteScreen } from "./screens/menu";
import { CartScreen, CheckoutScreen, ConfirmScreen, OrderDetail, OrdersScreen, TrackScreen } from "./screens/order";
import { AccountScreen, AddressesScreen, EditProfile, FavoritesScreen, PaymentsScreen, RewardsScreen, SettingsScreen } from "./screens/account";
import {
  AboutScreen,
  CateringDone,
  CateringForm,
  CateringHome,
  CateringMenu,
  CateringPackages,
  ContactScreen,
  EventDetail,
  EventsScreen,
  FeedbackScreen,
  ForceUpdateScreen,
  LegalScreen,
  LocationPriming,
  MaintenanceScreen,
  NotifPrefs,
  NotifPriming,
  NotificationsScreen,
  OfflineScreen,
  PartiesScreen,
  PartyForm,
  SupportScreen,
} from "./screens/places";

const tabs: { id: ScreenName; label: string; icon: SFName }[] = [
  { id: "home", label: "Home", icon: "house" },
  { id: "menu", label: "Menu", icon: "fork" },
  { id: "cart", label: "Cart", icon: "bag" },
  { id: "rewards", label: "Rewards", icon: "gift" },
  { id: "account", label: "Account", icon: "person" },
];

export function DinerApp() {
  const { theme } = useApp();
  const dark = useDark(theme);
  return (
    <div className={dark ? "dark min-h-dvh bg-black" : "min-h-dvh"}>
      <style>{`:root{--app-font-display:${FONT_DISPLAY};--app-font-body:${FONT_BODY};}`}</style>
      <NavigationProvider>
        <PhoneFrame>
          <Stage />
          <Toasts />
        </PhoneFrame>
      </NavigationProvider>
    </div>
  );
}

function useDark(theme: "system" | "light" | "dark") {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setDark(theme === "dark" || (theme === "system" && media.matches));
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return dark;
}

function Stage() {
  const nav = useNav();
  const showTabs = TAB_ROOTS.includes(nav.current.name);
  const sheet = SHEET_SCREENS.includes(nav.current.name);
  return (
    <div className="flex h-full flex-col">
      <div
        className="relative min-h-0 flex-1"
        onPointerDown={(event) => {
          if (showTabs || event.clientX > 28) return;
          const startX = event.clientX;
          const move = (e: PointerEvent) => {
            if (e.clientX - startX > 90) {
              nav.pop();
              window.removeEventListener("pointermove", move);
            }
          };
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
      >
        <div key={`${nav.stack.length}-${nav.current.name}-${nav.current.params?.id ?? ""}`} className={sheet ? "anim-sheet h-full" : nav.current.name === "splash" ? "h-full" : "anim-push h-full"}>
          <Current />
        </div>
      </div>
      {showTabs ? <TabBar /> : null}
    </div>
  );
}

function TabBar() {
  const nav = useNav();
  const { cartCount } = useApp();
  return (
    <nav className="grid grid-cols-5 border-t border-divider bg-background/95 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur" aria-label="Main">
      {tabs.map((tab) => {
        const active = nav.current.name === tab.id;
        return (
          <button key={tab.id} type="button" aria-current={active ? "page" : undefined} onClick={() => nav.goTab(tab.id)} className={active ? "flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[13px] font-semibold text-primary" : "flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[13px] font-medium text-muted-foreground"}>
            <span className="relative">
              <SFIcon name={tab.icon} size={22} weight={active ? "fill" : "regular"} />
              {tab.id === "cart" && cartCount > 0 ? <span className="absolute -right-2 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">{cartCount}</span> : null}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function Current() {
  const { current } = useNav();
  switch (current.name) {
    case "splash":
      return <Splash />;
    case "onboarding":
      return <Onboarding />;
    case "login":
      return <Login />;
    case "register":
      return <Register />;
    case "forgot":
      return <Forgot />;
    case "forgot-done":
      return <ForgotDone />;
    case "reset":
      return <ResetPassword />;
    case "otp":
      return <Otp />;
    case "home":
      return <Home />;
    case "menu":
      return <MenuScreen />;
    case "cart":
      return <CartScreen />;
    case "rewards":
      return <RewardsScreen />;
    case "account":
      return <AccountScreen />;
    case "item":
      return <ItemScreen />;
    case "omelette":
      return <OmeletteScreen />;
    case "checkout":
      return <CheckoutScreen />;
    case "confirm":
      return <ConfirmScreen />;
    case "track":
      return <TrackScreen />;
    case "orders":
      return <OrdersScreen />;
    case "order":
      return <OrderDetail />;
    case "edit-profile":
      return <EditProfile />;
    case "addresses":
      return <AddressesScreen />;
    case "payments":
      return <PaymentsScreen />;
    case "favorites":
      return <FavoritesScreen />;
    case "settings":
      return <SettingsScreen />;
    case "catering":
      return <CateringHome />;
    case "catering-menu":
      return <CateringMenu />;
    case "catering-packages":
      return <CateringPackages />;
    case "catering-form":
      return <CateringForm />;
    case "catering-done":
      return <CateringDone />;
    case "events":
      return <EventsScreen />;
    case "event":
      return <EventDetail />;
    case "parties":
      return <PartiesScreen />;
    case "party-form":
      return <PartyForm />;
    case "notifications":
      return <NotificationsScreen />;
    case "notif-prefs":
      return <NotifPrefs />;
    case "notif-priming":
      return <NotifPriming />;
    case "contact":
      return <ContactScreen />;
    case "about":
      return <AboutScreen />;
    case "support":
      return <SupportScreen />;
    case "feedback":
      return <FeedbackScreen />;
    case "privacy":
      return <LegalScreen kind="privacy" />;
    case "terms":
      return <LegalScreen kind="terms" />;
    case "offline":
      return <OfflineScreen />;
    case "maintenance":
      return <MaintenanceScreen />;
    case "force-update":
      return <ForceUpdateScreen />;
    case "location-priming":
      return <LocationPriming />;
    default:
      return <Home />;
  }
}

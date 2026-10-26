import { useEffect, useState } from "react";
import { business, directionsUrl, openStatus, statusLabel } from "@/data/business";
import { promos, reviews, story, upcomingEvents } from "@/data/content";
import { featuredIds, getItem, homeChips, popularMealIds, todaySpecialIds } from "@/data/menu";
import { greeting } from "@/lib/format";
import { logo } from "@/lib/images";
import { useApp } from "@/lib/store";
import { useNav } from "@/app/nav";
import { FeatureCard } from "@/components/dish";
import { Badge, FoodImage, Screen, Sheet, Stars } from "@/components/ios";
import { SFIcon, type SFName } from "@/components/sf";

export function Home() {
  const nav = useNav();
  const app = useApp();
  const [hello, setHello] = useState("Hello");
  const [promo, setPromo] = useState(0);
  const [modeOpen, setModeOpen] = useState(false);
  const status = openStatus();
  const upcoming = upcomingEvents();
  const active = app.orders.find((order) => order.status !== "completed" && (!app.user || order.userId === app.user.id));
  const name = app.user?.name && app.user.name !== "Guest" ? app.user.name.split(" ")[0] : app.user?.guest ? "Guest" : "";

  useEffect(() => setHello(greeting()), []);
  useEffect(() => {
    const timer = window.setInterval(() => setPromo((n) => (n + 1) % promos.length), 4500);
    return () => window.clearInterval(timer);
  }, []);

  const slide = promos[promo];

  function openPromo() {
    if (slide.target === "rewards") nav.goTab("rewards");
    else nav.push("item", { id: slide.itemId });
  }

  return (
    <Screen>
      <div className="px-5 pb-8 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-muted-foreground">{business.name}</p>
            <h1 className="display truncate text-[22px]">
              {hello}
              {name ? `, ${name}` : ""}
            </h1>
          </div>
          <button type="button" aria-label="Notifications" onClick={() => nav.push("notifications")} className="relative flex h-11 w-11 items-center justify-center">
            <SFIcon name="bell" />
            {app.unread ? (
              <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                {app.unread}
              </span>
            ) : null}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setModeOpen(true)}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-surface px-3 text-[15px] font-semibold"
        >
          <SFIcon name="takeout" size={16} />
          {app.orderMode === "delivery" ? "Delivery" : "Pickup"}
          <SFIcon name="chevron.down" size={14} />
        </button>

        {active ? (
          <button type="button" onClick={() => nav.push("track", { id: active.id })} className="mt-4 flex w-full items-center gap-3 rounded-[16px] bg-primary px-4 py-3 text-left text-white">
            <SFIcon name="clock" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] uppercase tracking-wide text-white/80">Active order {active.number}</span>
              <span className="block text-[16px] font-semibold">{active.status === "ready" ? "Ready for pickup" : active.status === "preparing" ? "Preparing" : active.status === "delivering" ? "Out for delivery" : "Order received"}</span>
            </span>
            <SFIcon name="chevron.right" />
          </button>
        ) : null}

        <button type="button" onClick={() => nav.openMenu()} className="mt-4 flex h-11 w-full items-center gap-2 rounded-[12px] bg-surface px-3 text-left text-muted-foreground">
          <SFIcon name="search" size={18} />
          <span className="text-[17px]">Search the menu</span>
        </button>

        <button type="button" onClick={openPromo} className="relative mt-4 block h-44 w-full overflow-hidden rounded-[16px] text-left">
          <FoodImage folder="banners" file={slide.image} alt="" className="absolute inset-0 h-full w-full" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <span className="relative flex h-full flex-col justify-end p-4 text-white">
            <span className="text-[13px] font-semibold uppercase tracking-wide">{slide.eyebrow}</span>
            <span className="display text-[22px]">{slide.title}</span>
            <span className="text-[16px] text-white/90">{slide.body}</span>
            <span className="mt-1 text-[16px] font-semibold">{slide.price}</span>
          </span>
        </button>
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {promos.map((item, index) => (
            <button key={item.id} type="button" aria-label={`Show ${item.title}`} onClick={() => setPromo(index)} className={index === promo ? "h-2 w-5 rounded-full bg-primary" : "h-2 w-2 rounded-full bg-divider"} />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          <Quick icon="takeout" label="Order Now" onClick={() => nav.openMenu()} />
          <Quick icon="fork" label="View Menu" onClick={() => nav.openMenu()} />
          <Quick icon="list" label="Catering" onClick={() => nav.push("catering")} />
          <Quick icon="party" label="Events" onClick={() => nav.push("events")} />
        </div>

        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5">
          {homeChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => nav.openMenu({ category: chip.category, meal: chip.meal })}
              className="h-9 shrink-0 rounded-full bg-surface px-4 text-[15px] font-semibold"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <h2 className="display mb-3 mt-7 text-[22px]">Featured Dishes</h2>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          {featuredIds.map((id) => (
            <FeatureCard key={id} id={id} />
          ))}
        </div>

        <h2 className="display mb-3 mt-7 text-[22px]">Today's Specials</h2>
        <div className="space-y-3">
          {todaySpecialIds.map((id) => {
            const item = getItem(id);
            if (!item) return null;
            return (
              <button key={id} type="button" onClick={() => nav.push("item", { id })} className="flex w-full gap-3 rounded-[16px] bg-surface p-2 text-left diner-shadow">
                <FoodImage folder="menu" file={item.image} alt="" className="h-20 w-20 rounded-[16px]" />
                <span className="min-w-0 py-1">
                  <span className="block text-[17px] font-semibold">{item.name}</span>
                  <span className="mt-1 line-clamp-2 block text-[13px] text-muted-foreground">{item.description}</span>
                  <span className="mt-1 block text-[15px] font-semibold text-primary">${item.price.toFixed(2)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <h2 className="display mb-3 mt-7 text-[22px]">Popular Meals</h2>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          {popularMealIds.map((id) => (
            <FeatureCard key={id} id={id} />
          ))}
        </div>

        <button type="button" onClick={() => nav.push("about")} className="mt-7 w-full overflow-hidden rounded-[16px] bg-surface text-left diner-shadow">
          <FoodImage folder="banners" file="our-story.jpg" alt="" className="h-36 w-full" />
          <span className="block p-4">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-primary">Our Story</span>
            <span className="mt-1 block text-[16px] leading-relaxed">{story.lead}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-[16px] font-semibold text-primary">
              Learn More <SFIcon name="chevron.right" size={16} />
            </span>
          </span>
        </button>

        <div className="mt-7 flex items-end justify-between">
          <h2 className="display text-[22px]">Upcoming Events</h2>
          <button type="button" className="text-[16px] font-semibold text-primary" onClick={() => nav.push("events")}>
            See all
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {upcoming.length ? (
            upcoming.map((event) => (
              <button key={event.id} type="button" onClick={() => nav.push("event", { id: event.id })} className="flex w-full gap-3 rounded-[16px] bg-surface p-2 text-left diner-shadow">
                <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[16px]">
                  <FoodImage folder="events" file={event.image} alt="" className="h-full w-full" />
                </span>
                <span className="min-w-0 py-1">
                  <Badge tone="neutral">{event.dateTbc || !event.date ? "Date TBC" : event.dateLabel}</Badge>
                  <span className="mt-1 block text-[16px] font-semibold leading-tight">{event.name}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {event.startLabel}–{event.endLabel}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="rounded-[16px] bg-surface p-4 text-[16px] text-muted-foreground">No upcoming events right now. Past village dates are kept in the archive.</p>
          )}
        </div>

        <h2 className="display mb-3 mt-7 text-[22px]">What Our Guests Say</h2>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          {reviews.map((review) => (
            <figure key={review.id} className="w-[260px] shrink-0 rounded-[16px] bg-surface p-4 diner-shadow">
              <Stars value={review.food} />
              <blockquote className="mt-2 line-clamp-5 text-[16px] leading-snug">“{review.quote}”</blockquote>
              <figcaption className="mt-3 text-[13px] font-semibold text-muted-foreground">
                {review.name} · {review.when}
              </figcaption>
            </figure>
          ))}
        </div>

        <section className="mt-7 rounded-[16px] bg-surface p-4 diner-shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-semibold">Hours and location</h2>
              <p className="mt-1 text-[16px]">{business.address}</p>
              <p className="text-[16px] text-muted-foreground">Hours: TBD</p>
            </div>
            <Badge tone={status === "open" ? "green" : status === "closed" ? "neutral" : "amber"}>{statusLabel(status)}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={directionsUrl} className="flex h-11 items-center justify-center rounded-[14px] bg-primary text-[16px] font-semibold text-white">
              Get Directions
            </a>
            <a href={`tel:${business.phoneTel}`} className="flex h-11 items-center justify-center rounded-[14px] border-2 border-primary text-[16px] font-semibold text-primary">
              Call
            </a>
          </div>
          <button type="button" onClick={() => nav.push("contact")} className="mt-3 text-[16px] font-semibold text-primary">
            Location & contact
          </button>
        </section>

        <Sheet open={modeOpen} title="How are you ordering?" onClose={() => setModeOpen(false)}>
        <div className="space-y-2 pb-4">
          <button type="button" className="flex h-[52px] w-full items-center rounded-[14px] bg-primary px-4 text-left text-[17px] font-semibold text-white" onClick={() => { app.setOrderMode("pickup"); setModeOpen(false); }}>Pickup</button>
          <button type="button" disabled={!app.deliveryAvailable} className="flex h-[52px] w-full items-center rounded-[14px] bg-surface px-4 text-left text-[17px] font-semibold disabled:text-disabled" onClick={() => { app.setOrderMode("delivery"); setModeOpen(false); }}>Delivery</button>
          <p className="text-[15px] text-muted-foreground">Delivery availability to be confirmed by the restaurant.</p>
        </div>
      </Sheet>
        <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[15px]">
          {["Instagram", "Facebook", "X", "TikTok", "YouTube"].map((name) => (
            <button key={name} type="button" className="font-semibold text-muted-foreground" onClick={() => nav.push("contact")}>
              {name}
            </button>
          ))}
          <button type="button" className="font-semibold text-primary" onClick={() => nav.push("privacy")}>
            Privacy
          </button>
          <button type="button" className="font-semibold text-primary" onClick={() => nav.push("terms")}>
            Terms
          </button>
        </footer>
      </div>
    </Screen>
  );
}

function Quick({ icon, label, onClick }: { icon: SFName; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1">
      <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
        <SFIcon name={icon} size={22} />
      </span>
      <span className="text-center text-[13px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

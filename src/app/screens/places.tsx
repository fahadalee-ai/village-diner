import { useMemo, useState } from "react";
import { logo } from "@/lib/images";
import { ALLERGEN_DISCLAIMER, business, directionsUrl, HOURS_LABEL, openStatus, socials, statusLabel, todayHours, weeklyHours } from "@/data/business";
import { archivedEvents, cateringCategories, cateringPackages, cateringTrays, contactServices as services, events, faqs, partyTypes, privacyPolicy, reviews, story, termsOfService, upcomingEvents } from "@/data/content";
import { getItem } from "@/data/menu";
import { downloadIcs, formatMoney, isEmail, isPhone, isSameDay } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useNav } from "@/app/nav";
import { Badge, EmptyState, Field, FoodImage, ListRow, NavBar, PrimaryButton, Screen, SecondaryButton, Sheet, Stars, TextArea, TextButton, ToggleRow } from "@/components/ios";
import { SFIcon } from "@/components/sf";

export function CateringHome() {
  const nav = useNav();
  return (
    <Screen header={<NavBar title="Catering" onBack={() => nav.pop()} />}>
      <div className="pb-8">
        <div className="relative h-52">
          <FoodImage folder="catering" file="hero.jpg" alt="" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[13px] font-semibold uppercase tracking-wide">Sample menu</p>
            <h1 className="display text-[28px]">Great Food for Every Occasion</h1>
          </div>
        </div>
        <div className="space-y-3 px-5 pt-5">
          <p className="text-[16px] leading-relaxed">The website still lists catering as coming soon. Browse sample trays and packages built from the diner menu, then request a quote. Prices marked Sample are not final.</p>
          <PrimaryButton onClick={() => nav.push("catering-menu")}>Browse catering menu</PrimaryButton>
          <SecondaryButton onClick={() => nav.push("catering-packages")}>View packages</SecondaryButton>
          <SecondaryButton onClick={() => nav.push("catering-form")}>Request custom quote</SecondaryButton>
          <ContactCatering />
        </div>
      </div>
    </Screen>
  );
}

function ContactCatering() {
  return (
    <div className="rounded-[16px] bg-surface p-4">
      <p className="text-[17px] font-semibold">Contact the catering team</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={`tel:${business.phoneTel}`} className="flex h-11 items-center justify-center rounded-[14px] bg-primary text-[16px] font-semibold text-white">Call</a>
        <a href={`mailto:${business.email}`} className="flex h-11 items-center justify-center rounded-[14px] border-2 border-primary text-[16px] font-semibold text-primary">Email</a>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">{business.phone} · {business.email}</p>
    </div>
  );
}

export function CateringMenu() {
  const nav = useNav();
  return (
    <Screen header={<NavBar title="Catering menu" large onBack={() => nav.pop()} />}>
      <div className="space-y-6 px-5 pb-8">
        <p className="text-[15px] text-muted-foreground">Sample – to be confirmed. Built from dishes already on the diner menu.</p>
        {cateringCategories.map((category) => (
          <section key={category}>
            <h2 className="display mb-3 text-[22px]">{category}</h2>
            <div className="space-y-3">
              {cateringTrays.filter((tray) => tray.category === category).map((tray) => {
                const item = getItem(tray.itemId);
                if (!item) return null;
                return (
                  <button key={tray.id} type="button" onClick={() => nav.push("item", { id: item.id })} className="flex w-full gap-3 rounded-[16px] bg-surface p-2 text-left">
                    <FoodImage folder="menu" file={item.image} alt="" className="h-20 w-20 rounded-[16px]" />
                    <span>
                      <span className="block text-[17px] font-semibold">{item.name}</span>
                      <span className="text-[13px] text-muted-foreground">{tray.serves}</span>
                      <span className="mt-1 block text-[15px] font-semibold text-primary">{formatMoney(tray.samplePrice)} · Sample</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <PrimaryButton onClick={() => nav.push("catering-form")}>Request custom quote</PrimaryButton>
      </div>
    </Screen>
  );
}

export function CateringPackages() {
  const nav = useNav();
  return (
    <Screen header={<NavBar title="Packages" large onBack={() => nav.pop()} />}>
      <div className="space-y-4 px-5 pb-8">
        {cateringPackages.map((pack) => (
          <article key={pack.id} className="overflow-hidden rounded-[16px] bg-surface diner-shadow">
            <FoodImage folder="catering" file={pack.image} alt="" className="h-36 w-full" />
            <div className="p-4">
              <Badge tone="amber">Sample – to be confirmed</Badge>
              <h2 className="display mt-2 text-[22px]">{pack.name}</h2>
              <p className="text-[15px] text-muted-foreground">{pack.guests}</p>
              <p className="mt-1 text-[17px] font-semibold">From {formatMoney(pack.samplePrice)}</p>
              <ul className="mt-2 list-disc pl-5 text-[15px]">
                {pack.includes.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
          </article>
        ))}
        <PrimaryButton onClick={() => nav.push("catering-form")}>Request this quote</PrimaryButton>
      </div>
    </Screen>
  );
}

export function CateringForm() {
  const nav = useNav();
  const app = useApp();
  const [form, setForm] = useState({ name: app.user?.name ?? "", phone: app.user?.phone ?? "", email: app.user?.email ?? "", eventType: "Family gathering", date: "", time: "11:00", guests: 20, mode: "Pickup", address: "", diet: "", notes: "", budget: "" });
  const [error, setError] = useState("");
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  return (
    <Screen header={<NavBar title="Request a quote" onBack={() => nav.pop()} />} footer={<div className="px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"><PrimaryButton onClick={() => {
      if (form.name.trim().length < 2 || !isPhone(form.phone) || !isEmail(form.email) || !form.date) {
        setError("Add your name, phone, email, and event date.");
        return;
      }
      app.notify({ kind: "order", title: "Catering request sent", body: "The diner will follow up by phone or email.", screen: "catering" });
      nav.push("catering-done");
    }}>Request Custom Quote</PrimaryButton></div>}>
      <div className="space-y-3 px-5 pb-6">
        {error ? <p className="text-[13px] text-danger">{error}</p> : null}
        <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
        <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} type="tel" />
        <Field label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
        <label className="block text-[13px] text-muted-foreground">Event type
          <select value={form.eventType} onChange={(e) => set("eventType", e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[17px] text-foreground">{partyTypes.map((type) => <option key={type}>{type}</option>)}</select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[13px] text-muted-foreground">Date<input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px]" /></label>
          <label className="text-[13px] text-muted-foreground">Time<input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px]" /></label>
        </div>
        <div className="flex items-center justify-between rounded-[14px] bg-surface px-4 py-3">
          <span className="text-[17px]">Guests</span>
          <span className="flex items-center gap-3">
            <button type="button" aria-label="Fewer guests" className="flex h-11 w-11 items-center justify-center" onClick={() => set("guests", Math.max(4, form.guests - 1))}><SFIcon name="minus" size={16} /></button>
            <span className="w-8 text-center text-[17px] font-semibold">{form.guests}</span>
            <button type="button" aria-label="More guests" className="flex h-11 w-11 items-center justify-center" onClick={() => set("guests", form.guests + 1)}><SFIcon name="plus" size={16} /></button>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Pickup", "Delivery"].map((mode) => (
            <button key={mode} type="button" onClick={() => set("mode", mode)} className={form.mode === mode ? "h-11 rounded-full bg-primary text-[16px] font-semibold text-white" : "h-11 rounded-full bg-surface text-[16px] font-semibold"}>{mode}</button>
          ))}
        </div>
        {form.mode === "Delivery" ? <Field label="Address" value={form.address} onChange={(v) => set("address", v)} /> : null}
        <Field label="Dietary requirements" value={form.diet} onChange={(v) => set("diet", v)} />
        <TextArea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} />
        <Field label="Budget range" value={form.budget} onChange={(v) => set("budget", v)} />
      </div>
    </Screen>
  );
}

export function CateringDone() {
  const nav = useNav();
  return (
    <Screen header={<NavBar title="Request sent" right={<button type="button" className="text-[17px] font-semibold text-primary" onClick={() => nav.reset("home")}>Done</button>} />}>
      <div className="px-5 text-center">
        <span className="anim-check mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-white"><SFIcon name="checkmark" size={36} /></span>
        <h1 className="display mt-4 text-[28px]">Request sent</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">The Village Diner will follow up about your quote. Sample prices are not a confirmation.</p>
        <div className="mt-6 space-y-3 text-left"><ContactCatering /></div>
        <div className="mt-4"><TextButton onClick={() => nav.reset("home")}>Back to Home</TextButton></div>
      </div>
    </Screen>
  );
}

export function EventsScreen() {
  const nav = useNav();
  const upcoming = upcomingEvents();
  const archived = archivedEvents();
  return (
    <Screen header={<NavBar title="Events" large onBack={() => nav.pop()} />}>
      <div className="space-y-4 px-5 pb-8">
        <p className="text-[16px] text-muted-foreground">Village dates from the diner's events page. Past dates move to the archive on their own.</p>
        {upcoming.length === 0 ? <EmptyState icon="calendar" title="No upcoming events" body="Check the archive below, or ask the diner what's next." /> : null}
        {upcoming.map((event) => <EventCard key={event.id} id={event.id} />)}
        {archived.length ? <h2 className="display pt-2 text-[22px]">Archive</h2> : null}
        {archived.map((event) => <EventCard key={event.id} id={event.id} />)}
        <button type="button" onClick={() => nav.push("parties")} className="w-full rounded-[16px] bg-surface p-4 text-left">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">Private parties</p>
          <p className="display text-[22px]">Birthdays, families, and groups</p>
          <p className="text-[15px] text-muted-foreground">Request the dining room for your gathering.</p>
        </button>
      </div>
    </Screen>
  );
}

function EventCard({ id }: { id: string }) {
  const nav = useNav();
  const event = events.find((item) => item.id === id);
  if (!event) return null;
  return (
    <button type="button" onClick={() => nav.push("event", { id })} className="w-full overflow-hidden rounded-[16px] bg-surface text-left diner-shadow">
      <span className="relative block h-36">
        <FoodImage folder="events" file={event.image} alt="" className="h-full w-full" />
        <span className="absolute left-3 top-3"><Badge>{event.dateTbc || !event.date ? "Date TBC" : event.dateLabel}</Badge></span>
      </span>
      <span className="block p-4">
        <span className="block text-[17px] font-semibold">{event.name}</span>
        <span className="text-[15px] text-muted-foreground">{event.startLabel}–{event.endLabel}</span>
      </span>
    </button>
  );
}

export function EventDetail() {
  const nav = useNav();
  const app = useApp();
  const event = events.find((item) => item.id === nav.current.params?.id);
  const [book, setBook] = useState(false);
  const [email, setEmail] = useState(app.user?.email ?? "");
  if (!event) return <Screen header={<NavBar title="Event" onBack={() => nav.pop()} />}><EmptyState title="Event unavailable" body="It may have been updated." /></Screen>;
  function remind() {
    app.notify({ kind: "event", title: event!.name, body: "Reminder saved on this phone.", screen: "event", params: { id: event!.id } });
    app.pushToast("Reminder set", event!.name);
  }
  function calendar() {
    if (!event?.date) {
      app.pushToast("Date TBC", "Calendar holds off until the date is confirmed.");
      return;
    }
    const [y, m, d] = event.date.split("-").map(Number);
    const [sh, sm] = event.startTime.split(":").map(Number);
    const [eh, em] = event.endTime.split(":").map(Number);
    const start = new Date(y, m - 1, d, sh, sm);
    const end = new Date(y, m - 1, d, eh, em);
    downloadIcs({ title: event.name, start, end, details: event.description, location: event.location });
  }
  return (
    <Screen header={<NavBar title="Event" onBack={() => nav.pop()} right={<button type="button" aria-label="Share event" className="flex h-11 w-11 items-center justify-center" onClick={() => { const text = `${event.name} — ${event.dateLabel}`; if (navigator.share) void navigator.share({ title: event.name, text }).catch(() => undefined); else app.pushToast("Copied"); }}><SFIcon name="share" /></button>} />}>
      <div className="pb-8">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
          {event.gallery.map((file) => (
            <FoodImage key={file} folder="events" file={file} alt="" className="h-48 w-72 shrink-0 rounded-[16px]" />
          ))}
        </div>
        <div className="px-5 pt-4">
          <Badge>{event.dateTbc || !event.date ? "Date TBC" : event.dateLabel}</Badge>
          <h1 className="display mt-2 text-[28px]">{event.name}</h1>
          <p className="mt-1 text-[16px] text-muted-foreground">{event.startLabel}–{event.endLabel}{event.rainDate ? ` · ${event.rainDate}` : ""}</p>
          <p className="mt-3 text-[16px] leading-relaxed">{event.description}</p>
          <p className="mt-3 flex items-center gap-2 text-[16px]"><SFIcon name="mappin" size={18} /> {event.location}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <PrimaryButton onClick={() => setBook(true)}>Book Now</PrimaryButton>
            <SecondaryButton onClick={calendar}>Add to Calendar</SecondaryButton>
          </div>
          <div className="mt-2"><SecondaryButton onClick={remind}>Remind Me</SecondaryButton></div>
        </div>
      </div>
      <Sheet open={book} title="Tickets" onClose={() => setBook(false)} footer={<PrimaryButton onClick={() => { if (email && !isEmail(email)) return; app.notify({ kind: "event", title: "We'll send ticket news", body: event.name, screen: "event", params: { id: event.id } }); setBook(false); app.pushToast("You're on the list"); }}>Stay tuned</PrimaryButton>}>
        <p className="text-[16px]">Stay tuned for updates and tickets. Leave an email and the diner can reach you when booking opens.</p>
        <div className="mt-3 pb-2"><Field label="Email" value={email} onChange={setEmail} type="email" /></div>
      </Sheet>
    </Screen>
  );
}

export function PartiesScreen() {
  const nav = useNav();
  return (
    <Screen header={<NavBar title="Private parties" onBack={() => nav.pop()} />}>
      <div className="space-y-4 px-5 pb-8">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {["private-party.jpg", "party-table.jpg", "party-room.jpg"].map((file) => (
            <FoodImage key={file} folder="events" file={file} alt="Private party at the diner" className="h-40 w-64 shrink-0 rounded-[16px]" />
          ))}
        </div>
        {partyTypes.map((type) => (
          <div key={type} className="rounded-[16px] bg-surface p-4">
            <p className="text-[17px] font-semibold">{type}</p>
            <p className="text-[15px] text-muted-foreground">Breakfast or lunch for your group, in the dining room on Keswick Avenue.</p>
          </div>
        ))}
        <PrimaryButton onClick={() => nav.push("party-form")}>Request a Booking</PrimaryButton>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${business.phoneTel}`} className="flex h-11 items-center justify-center rounded-[14px] bg-primary font-semibold text-white">Call</a>
          <a href={`mailto:${business.email}`} className="flex h-11 items-center justify-center rounded-[14px] border-2 border-primary font-semibold text-primary">Email</a>
        </div>
      </div>
    </Screen>
  );
}

export function PartyForm() {
  const nav = useNav();
  const app = useApp();
  const [name, setName] = useState(app.user?.name ?? "");
  const [phone, setPhone] = useState(app.user?.phone ?? "");
  const [email, setEmail] = useState(app.user?.email ?? "");
  const [type, setType] = useState(partyTypes[0]);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(12);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  return (
    <Screen header={<NavBar title="Request a booking" onBack={() => nav.pop()} />} footer={<div className="px-5 py-3"><PrimaryButton onClick={() => {
      if (name.trim().length < 2 || !isPhone(phone) || !isEmail(email) || !date) { setError("Add your name, phone, email, and date."); return; }
      app.pushToast("Booking request sent");
      nav.pop();
    }}>Send request</PrimaryButton></div>}>
      <div className="space-y-3 px-5">
        {error ? <p className="text-[13px] text-danger">{error}</p> : null}
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <label className="block text-[13px] text-muted-foreground">Event type
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[17px]">{partyTypes.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="block text-[13px] text-muted-foreground">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px]" /></label>
        <div className="flex items-center justify-between">
          <span>Guests</span>
          <span className="flex items-center">
            <button type="button" aria-label="Fewer guests" className="h-11 w-11" onClick={() => setGuests((n) => Math.max(2, n - 1))}>−</button>
            <span className="w-8 text-center font-semibold">{guests}</span>
            <button type="button" aria-label="More guests" className="h-11 w-11" onClick={() => setGuests((n) => n + 1)}>+</button>
          </span>
        </div>
        <TextArea label="Notes" value={notes} onChange={setNotes} />
      </div>
    </Screen>
  );
}

export function ContactScreen() {
  const nav = useNav();
  const app = useApp();
  const status = openStatus();
  const [name, setName] = useState(app.user?.name === "Guest" ? "" : app.user?.name ?? "");
  const [email, setEmail] = useState(app.user?.email ?? "");
  const [service, setService] = useState(services[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const z = 17;
  const n = 2 ** z;
  const x = Math.floor(((business.lon + 180) / 360) * n);
  const latRad = (business.lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  const average = reviews.reduce((sum, review) => sum + review.food, 0) / reviews.length;
  return (
    <Screen header={<NavBar title="Location & contact" onBack={() => nav.pop()} />}>
      <div className="space-y-5 px-5 pb-10">
        <div className="relative h-44 overflow-hidden rounded-[16px]">
          <img alt="Map showing The Village Diner" className="h-full w-full object-cover" src={`https://tile.openstreetmap.org/${z}/${x}/${y}.png`} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-primary"><SFIcon name="mappin" size={32} /></span>
          <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 text-[13px]">© OpenStreetMap</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={directionsUrl} className="flex h-11 items-center justify-center rounded-[14px] bg-primary font-semibold text-white">Get Directions</a>
          <button type="button" className="h-11 rounded-[14px] border-2 border-primary font-semibold text-primary" onClick={() => { const text = business.address; if (navigator.share) void navigator.share({ title: business.name, text }).catch(() => undefined); else { void navigator.clipboard?.writeText(text); app.pushToast("Address copied"); } }}>Share Location</button>
          {app.locationPermission === "unknown" ? (
            <button type="button" className="col-span-2 h-11 rounded-[14px] bg-surface font-semibold" onClick={() => nav.push("location-priming")}>Allow location</button>
          ) : null}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">Hours</h2>
            <Badge tone={status === "open" ? "green" : status === "closed" ? "neutral" : "amber"}>{statusLabel(status)}</Badge>
          </div>
          <p className="text-[15px] text-muted-foreground">{HOURS_LABEL}</p>
          <table className="mt-2 w-full text-left text-[16px]">
            <tbody>
              {weeklyHours.map((day) => (
                <tr key={day.day} className="border-b border-divider">
                  <th className="py-2 font-medium">{day.day}</th>
                  <td className="py-2 text-right text-muted-foreground">{day.open && day.close ? `${day.open}–${day.close}` : "TBD"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-[13px] text-muted-foreground">Today: {todayHours().open ? `${todayHours().open}–${todayHours().close}` : "TBD"}</p>
        </div>
        <a href={`tel:${business.phoneTel}`} className="flex min-h-[52px] items-center gap-3 text-[17px] font-semibold text-primary"><SFIcon name="phone" /> {business.phone}</a>
        <a href={`mailto:${business.email}`} className="flex min-h-[52px] items-center gap-3 text-[17px] font-semibold text-primary"><SFIcon name="envelope" /> {business.email}</a>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (name.trim().length < 2 || !isEmail(email) || message.trim().length < 8) { setError("Add your name, email, and a message."); return; } setError(""); app.pushToast("Message sent", "The diner will reply by email."); setMessage(""); }}>
          <h2 className="text-[17px] font-semibold">Contact form</h2>
          {error ? <p className="text-[13px] text-danger">{error}</p> : null}
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <label className="block text-[13px] text-muted-foreground">Service
            <select value={service} onChange={(e) => setService(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[17px] text-foreground">{services.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <TextArea label="Message" value={message} onChange={setMessage} />
          <PrimaryButton type="submit">Submit</PrimaryButton>
        </form>
        <div className="flex flex-wrap gap-2">
          {socials.map((social) => (
            <button key={social.id} type="button" className="h-11 rounded-full bg-surface px-4 text-[15px] font-semibold" onClick={() => { if (social.url) window.open(social.url, "_blank", "noopener"); else app.pushToast(`${social.label} link coming soon`, "Add the profile URL in the business file."); }}>{social.label}</button>
          ))}
        </div>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="display text-[22px]">Reviews</h2>
            <span className="text-[16px] font-semibold">{average.toFixed(1)}</span>
          </div>
          <Stars value={5} />
          <div className="mt-3 space-y-3">
            {reviews.map((review) => (
              <figure key={review.id} className="rounded-[16px] bg-surface p-4">
                <div className="flex justify-between"><figcaption className="font-semibold">{review.name}</figcaption><span className="text-[13px] text-muted-foreground">{review.when}</span></div>
                <p className="mt-1 text-[13px] text-muted-foreground">Food {review.food}/5 · Service {review.service}/5 · Atmosphere {review.atmosphere}/5</p>
                <blockquote className="mt-2 text-[16px]">“{review.quote}”</blockquote>
              </figure>
            ))}
          </div>
          <div className="mt-3"><SecondaryButton onClick={() => setReviewOpen(true)}>Write a Review</SecondaryButton></div>
        </section>
        <p className="text-[13px] text-muted-foreground">{ALLERGEN_DISCLAIMER}</p>
      </div>
      <ReviewSheet open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </Screen>
  );
}

export function ReviewSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const [food, setFood] = useState(5);
  const [service, setService] = useState(5);
  const [atmosphere, setAtmosphere] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <Sheet open={open} title="Write a review" onClose={onClose} footer={<PrimaryButton onClick={() => { if (comment.trim().length < 4) { app.pushToast("Add a short comment"); return; } app.pushToast("Thanks for the review"); onClose(); }}>Submit review</PrimaryButton>}>
      <div className="space-y-3 pb-2">
        <Rate label="Food" value={food} onChange={setFood} />
        <Rate label="Service" value={service} onChange={setService} />
        <Rate label="Atmosphere" value={atmosphere} onChange={setAtmosphere} />
        <TextArea label="Comment" value={comment} onChange={setComment} />
      </div>
    </Sheet>
  );
}

function Rate({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[16px]">{label}</span>
      <span className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <button key={i} type="button" aria-label={`${label} ${i + 1} stars`} onClick={() => onChange(i + 1)} className="flex h-11 w-9 items-center justify-center text-primary">
            <SFIcon name={i < value ? "star.fill" : "star"} size={18} />
          </button>
        ))}
      </span>
    </div>
  );
}

export function AboutScreen() {
  const nav = useNav();
  return (
    <Screen header={<NavBar title="About" onBack={() => nav.pop()} />}>
      <div className="pb-8">
        <div className="px-5 pt-2">
          <img src={logo} alt="The Village Diner" className="mx-auto h-24 w-24 rounded-full object-cover" />
          <h1 className="display mt-3 text-center text-[28px]">{business.name}</h1>
          <p className="text-center text-[16px] text-muted-foreground">{business.tagline}</p>
          <p className="mt-4 text-[16px] leading-relaxed">{story.body}</p>
          <div className="mt-4 space-y-3">
            {story.values.map((value) => (
              <div key={value.title} className="rounded-[16px] bg-surface p-4">
                <p className="text-[17px] font-semibold">{value.title}</p>
                <p className="text-[15px] text-muted-foreground">{value.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <FoodImage folder="banners" file="our-story.jpg" alt="Diner breakfast on the table" className="h-32 rounded-[16px]" />
            <FoodImage folder="banners" file="diner-interior.jpg" alt="Warm diner dining room" className="h-32 rounded-[16px]" />
          </div>
        </div>
      </div>
    </Screen>
  );
}

export function SupportScreen() {
  const nav = useNav();
  const [open, setOpen] = useState<number | null>(0);
  const [issue, setIssue] = useState("");
  return (
    <Screen header={<NavBar title="Support" onBack={() => nav.pop()} />}>
      <div className="space-y-3 px-5 pb-8">
        {faqs.map((faq, index) => (
          <div key={faq.q} className="rounded-[16px] bg-surface">
            <button type="button" className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-[16px] font-semibold" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>
              {faq.q}
              <SFIcon name="chevron.down" size={16} />
            </button>
            {open === index ? <p className="px-4 pb-4 text-[15px] leading-relaxed text-muted-foreground">{faq.a}</p> : null}
          </div>
        ))}
        <ListRow icon="phone" title="Call the diner" detail={business.phone} onClick={() => { window.location.href = `tel:${business.phoneTel}`; }} />
        <ListRow icon="envelope" title="Email" detail={business.email} onClick={() => { window.location.href = `mailto:${business.email}`; }} />
        <h2 className="pt-2 text-[17px] font-semibold">Report an order issue</h2>
        <TextArea label="What went wrong?" value={issue} onChange={setIssue} />
        <PrimaryButton onClick={() => { if (issue.trim().length < 8) return; setIssue(""); nav.push("contact"); }}>Send to the diner</PrimaryButton>
      </div>
    </Screen>
  );
}

export function FeedbackScreen() {
  const nav = useNav();
  const [open, setOpen] = useState(true);
  return (
    <Screen header={<NavBar title="Feedback" onBack={() => nav.pop()} />}>
      <div className="px-5">
        <p className="text-[16px] leading-relaxed">After pickup, tell us how the meal was. Ratings stay with the diner so the kitchen can see what guests loved.</p>
        <div className="mt-4"><PrimaryButton onClick={() => setOpen(true)}>Rate your visit</PrimaryButton></div>
      </div>
      <ReviewSheet open={open} onClose={() => { setOpen(false); }} />
    </Screen>
  );
}

export function LegalScreen({ kind }: { kind: "privacy" | "terms" }) {
  const nav = useNav();
  const paragraphs = kind === "privacy" ? privacyPolicy : termsOfService;
  return (
    <Screen header={<NavBar title={kind === "privacy" ? "Privacy Policy" : "Terms of Service"} onBack={() => nav.pop()} />}>
      <div className="space-y-4 px-5 pb-10">
        {paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)} className="text-[16px] leading-relaxed">{paragraph}</p>)}
      </div>
    </Screen>
  );
}

export function NotificationsScreen() {
  const nav = useNav();
  const app = useApp();
  const groups = useMemo(() => {
    const today = app.notices.filter((notice) => isSameDay(notice.createdAt));
    const earlier = app.notices.filter((notice) => !isSameDay(notice.createdAt));
    return { today, earlier };
  }, [app.notices]);
  const icons = { order: "checkmark.circle", status: "clock", special: "sparkles", menu: "fork", reward: "gift", event: "calendar" } as const;
  function open(screen: string, params?: Record<string, string>) {
    if (screen === "home" || screen === "menu" || screen === "rewards") nav.goTab(screen);
    else nav.push(screen as "item", params);
  }
  return (
    <Screen header={<NavBar title="Notifications" onBack={() => nav.pop()} right={<button type="button" className="text-[16px] font-semibold text-primary" onClick={() => app.markAllNotices()}>Read</button>} />}>
      {app.notices.length === 0 ? <EmptyState icon="bell" title="You're all caught up" body="Order updates, specials, and village events will show up here." /> : (
        <div className="px-5 pb-8">
          {(["today", "earlier"] as const).map((group) => groups[group].length ? (
            <section key={group}>
              <h2 className="mb-2 mt-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{group === "today" ? "Today" : "Earlier"}</h2>
              <ul>
                {groups[group].map((notice) => (
                  <li key={notice.id}>
                    <button type="button" onClick={() => { app.markNotice(notice.id); open(notice.screen, notice.params); }} className="flex w-full gap-3 border-b border-divider py-3 text-left">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><SFIcon name={icons[notice.kind]} size={18} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2"><span className={notice.read ? "text-[16px]" : "text-[16px] font-semibold"}>{notice.title}</span>{notice.read ? null : <span className="h-2 w-2 rounded-full bg-primary" />}</span>
                        <span className="block text-[15px] text-muted-foreground">{notice.body}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null)}
          {groups.today.length === 0 ? <p className="py-6 text-center text-[16px] text-muted-foreground">Nothing new today.</p> : null}
        </div>
      )}
    </Screen>
  );
}

export function NotifPrefs() {
  const nav = useNav();
  const app = useApp();
  const rows: { key: "orders" | "specials" | "menu" | "rewards" | "events"; label: string; detail: string }[] = [
    { key: "orders", label: "Order updates", detail: "Confirmation and status changes" },
    { key: "specials", label: "Daily specials", detail: "Early Bird and the plate of the day" },
    { key: "menu", label: "New menu items", detail: "Like the Chicken Caesar Wrap" },
    { key: "rewards", label: "Rewards", detail: "Points and birthday offers" },
    { key: "events", label: "Events", detail: "Keswick Village dates" },
  ];
  return (
    <Screen header={<NavBar title="Notifications" onBack={() => nav.pop()} />}>
      <div className="px-5">
        {app.notifPermission !== "granted" ? <div className="mb-3"><PrimaryButton onClick={() => nav.push("notif-priming")}>Turn on notifications</PrimaryButton></div> : null}
        {rows.map((row) => <ToggleRow key={row.key} label={row.label} detail={row.detail} checked={app.prefs[row.key]} onChange={() => app.togglePref(row.key)} />)}
      </div>
    </Screen>
  );
}

export function NotifPriming() {
  const nav = useNav();
  const app = useApp();
  return (
    <Screen header={<NavBar title="Notifications" onBack={() => nav.pop()} />}>
      <div className="px-5">
        <h1 className="display text-[28px]">Know when it's ready</h1>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">We'll tell you when the kitchen starts your order, when it's ready for pickup, and when a village event is coming up. You can turn each type off later.</p>
        <div className="mt-6 space-y-2">
          <PrimaryButton onClick={async () => {
            let result: NotificationPermission = "denied";
            try { result = await Notification.requestPermission(); } catch { result = "denied"; }
            app.setNotifPermission(result === "granted" ? "granted" : "denied");
            app.pushToast(result === "granted" ? "Notifications on" : "Notifications stayed off");
            nav.pop();
          }}>Continue</PrimaryButton>
          <TextButton className="w-full" onClick={() => nav.pop()}>Not now</TextButton>
        </div>
      </div>
    </Screen>
  );
}

export function LocationPriming() {
  const nav = useNav();
  const app = useApp();
  return (
    <Screen header={<NavBar title="Location" onBack={() => nav.pop()} />}>
      <div className="px-5">
        <h1 className="display text-[28px]">Find the diner</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">Location is used for directions to 299 N. Keswick Avenue and, later, a delivery address. Pickup works without it.</p>
        <div className="mt-6"><PrimaryButton onClick={() => {
          if (!navigator.geolocation) { app.setLocationPermission("denied"); nav.pop(); return; }
          navigator.geolocation.getCurrentPosition(() => { app.setLocationPermission("granted"); app.pushToast("Location on"); nav.pop(); }, () => { app.setLocationPermission("denied"); nav.pop(); });
        }}>Continue</PrimaryButton></div>
      </div>
    </Screen>
  );
}

export function OfflineScreen() {
  const nav = useNav();
  return (
    <Screen>
      <div className="flex h-full flex-col justify-center px-6 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface text-primary"><SFIcon name="wifi.slash" size={32} /></span>
        <h1 className="display mt-4 text-[28px]">You're offline</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">The menu will load again when you're back on Wi-Fi or cellular. Your cart stays on this phone.</p>
        <div className="mt-6"><PrimaryButton onClick={() => nav.pop()}>Try again</PrimaryButton></div>
      </div>
    </Screen>
  );
}

export function MaintenanceScreen() {
  const nav = useNav();
  return (
    <Screen>
      <div className="flex h-full flex-col justify-center px-6 text-center">
        <h1 className="display text-[28px]">We'll be back shortly</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">The Village Diner app is getting a quick update. Call {business.phone} if you need the diner right now.</p>
        <div className="mt-6 space-y-2">
          <a href={`tel:${business.phoneTel}`} className="flex h-[52px] items-center justify-center rounded-[14px] bg-primary font-semibold text-white">Call the diner</a>
          <TextButton onClick={() => nav.reset("home")}>Close preview</TextButton>
        </div>
      </div>
    </Screen>
  );
}

export function ForceUpdateScreen() {
  const nav = useNav();
  const app = useApp();
  return (
    <Screen>
      <div className="flex h-full flex-col justify-center px-6 text-center">
        <h1 className="display text-[28px]">Update required</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">A newer version of The Village Diner app is ready. Update to keep ordering pickup.</p>
        <div className="mt-6"><PrimaryButton onClick={() => app.pushToast("App Store", "The store listing opens here in the live app.")}>Update</PrimaryButton></div>
        <TextButton onClick={() => nav.reset("home")}>Close preview</TextButton>
      </div>
    </Screen>
  );
}

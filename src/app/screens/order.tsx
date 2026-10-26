import { useMemo, useState } from "react";
import { business, directionsUrl, orderingWindow } from "@/data/business";
import { getItem, upsellIds } from "@/data/menu";
import { discountFor, quote, subtotalOf } from "@/lib/cart";
import { cardBrand, downloadIcs, formatMoney, haptic, isEmail, isPhone, luhnOk } from "@/lib/format";
import { useApp, type OrderMode, type SavedAddress } from "@/lib/store";
import { useNav } from "@/app/nav";
import { EmptyState, Field, FoodImage, NavBar, PrimaryButton, Screen, SecondaryButton, Segmented, Sheet, StatusStepper, Stepper, TextButton } from "@/components/ios";
import { SFIcon } from "@/components/sf";

export function CartScreen() {
  const nav = useNav();
  const app = useApp();
  const [code, setCode] = useState("");
  const subtotal = subtotalOf(app.cart);
  const tip = app.tipChoice === "custom" ? Math.max(0, Number(app.customTip) || 0) : moneyPercent(subtotal, Number(app.tipChoice));
  const summary = quote({
    cart: app.cart,
    promoCode: app.promoCode,
    rewardId: app.rewardId,
    tip,
    delivery: app.orderMode === "delivery" && app.deliveryAvailable,
  });

  if (!app.cart.length) {
    return (
      <Screen header={<NavBar title="Cart" large />}>
        <EmptyState icon="bag" title="Your cart is empty" body="The griddle is ready when you are. Browse breakfast, lunch, and the kids' menu." action={<PrimaryButton onClick={() => nav.openMenu()}>Browse Menu</PrimaryButton>} />
      </Screen>
    );
  }

  return (
    <Screen
      header={<NavBar title="Cart" large />}
      footer={
        <div className="border-t border-divider bg-background px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <PrimaryButton
            onClick={() => nav.push("checkout")}
            disabled={!!summary.discount.blocked}
          >
            Checkout – {formatMoney(summary.total)}
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-4 px-5 pb-6">
        <ul className="space-y-3">
          {app.cart.map((line) => (
            <CartRow key={line.id} id={line.id} />
          ))}
        </ul>
        <div>
          <p className="mb-2 text-[17px] font-semibold">Add a drink or side</p>
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {upsellIds.map((id) => {
              const item = getItem(id);
              if (!item) return null;
              return (
                <button key={id} type="button" onClick={() => nav.push("item", { id })} className="w-28 shrink-0 text-left">
                  <FoodImage folder="menu" file={item.image} alt="" className="h-20 w-28 rounded-[16px]" />
                  <span className="mt-1 block text-[13px] font-semibold leading-tight">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Promo or reward code"
            aria-label="Promo code"
            className="h-12 flex-1 rounded-[14px] border border-divider bg-surface px-3 text-[16px]"
          />
          <button
            type="button"
            className="h-12 rounded-[14px] bg-primary px-4 text-[16px] font-semibold text-white"
            onClick={() => {
              const result = app.applyPromo(code);
              app.pushToast(result.ok ? result.title : "Code not applied", result.ok ? undefined : result.reason);
              if (result.ok) setCode("");
            }}
          >
            Apply
          </button>
        </div>
        {app.promoCode ? (
          <p className="text-[15px]">
            Code {app.promoCode} applied. <button type="button" className="font-semibold text-primary" onClick={() => app.clearPromo()}>Remove</button>
          </p>
        ) : null}
        {app.rewardId ? (
          <p className="text-[15px]">
            Reward applied. <button type="button" className="font-semibold text-primary" onClick={() => app.clearReward()}>Remove</button>
          </p>
        ) : null}
        <div>
          <p className="mb-2 text-[17px] font-semibold">Tip</p>
          <Segmented
            ariaLabel="Tip"
            value={app.tipChoice}
            onChange={app.setTipChoice}
            options={[
              { id: "10", label: "10%" },
              { id: "15", label: "15%" },
              { id: "20", label: "20%" },
              { id: "custom", label: "Custom" },
            ]}
          />
          {app.tipChoice === "custom" ? (
            <div className="mt-2">
              <Field label="Tip amount" value={app.customTip} onChange={app.setCustomTip} inputMode="decimal" />
            </div>
          ) : null}
        </div>
        <Summary summary={summary} delivery={app.orderMode === "delivery" && app.deliveryAvailable} />
      </div>
    </Screen>
  );
}

function moneyPercent(amount: number, pct: number) {
  return Math.round(amount * pct) / 100;
}

function CartRow({ id }: { id: string }) {
  const app = useApp();
  const nav = useNav();
  const line = app.cart.find((entry) => entry.id === id);
  const [drag, setDrag] = useState(0);
  if (!line) return null;
  return (
    <li className="relative overflow-hidden rounded-[16px]">
      <button type="button" aria-label={`Delete ${line.name}`} onClick={() => app.removeLine(line.id)} className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-danger text-[15px] font-semibold text-white">
        Delete
      </button>
      <div
        className="relative flex gap-3 bg-surface p-3"
        style={{ transform: `translateX(${drag}px)` }}
        onPointerDown={(event) => {
          const startX = event.clientX;
          const start = drag;
          const move = (e: PointerEvent) => setDrag(Math.max(-96, Math.min(0, start + e.clientX - startX)));
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            setDrag((value) => (value < -48 ? -96 : 0));
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
      >
        <FoodImage folder="menu" file={line.image} alt="" className="h-16 w-16 rounded-[12px]" />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold">{line.name}</p>
          {line.optionsLabel ? <p className="line-clamp-2 text-[13px] text-muted-foreground">{line.optionsLabel}</p> : null}
          {line.instructions ? <p className="text-[13px] text-muted-foreground">“{line.instructions}”</p> : null}
          <div className="mt-1 flex items-center justify-between">
            <Stepper value={line.qty} min={0} onChange={(qty) => app.setQty(line.id, qty)} />
            <span className="text-[16px] font-semibold tabular-nums">{formatMoney(line.unitPrice * line.qty)}</span>
          </div>
          <button type="button" className="mt-1 text-[15px] font-semibold text-primary" onClick={() => nav.push("item", { id: line.itemId, lineId: line.id })}>
            Edit
          </button>
        </div>
      </div>
    </li>
  );
}

function Summary({
  summary,
  delivery,
}: {
  summary: ReturnType<typeof quote>;
  delivery: boolean;
}) {
  return (
    <dl className="space-y-1 text-[16px]">
      <Row label="Subtotal" value={formatMoney(summary.subtotal)} />
      <Row label={summary.discount.label ? `Discount · ${summary.discount.label}` : "Discount"} value={`-${formatMoney(summary.discount.amount)}`} />
      {summary.discount.blocked ? <p className="text-[13px] text-danger">{summary.discount.blocked}</p> : null}
      <Row label={`Tax (${Math.round(business.taxRate * 100)}%)`} value={formatMoney(summary.tax)} />
      <Row label="Tip" value={formatMoney(summary.tip)} />
      {delivery ? <Row label="Delivery fee" value={formatMoney(summary.fee)} /> : null}
      <div className="flex justify-between border-t border-divider pt-2 text-[17px] font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatMoney(summary.total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

type PayMethod = "card" | "saved" | "pickup";
type CheckoutStep = "type" | "time" | "place" | "contact" | "pay" | "review";

function clockLabel(value: string) {
  const [hh, mm] = value.split(":").map(Number);
  return new Date(2026, 0, 1, hh ?? 0, mm ?? 0).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function scheduleLabel(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function prettyWhen(label: string) {
  const match = /^(\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2})$/.exec(label);
  return match ? scheduleLabel(match[1], match[2]) : label;
}

export function CheckoutScreen() {
  const nav = useNav();
  const app = useApp();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<OrderMode>(app.orderMode);
  const [when, setWhen] = useState<"asap" | "later">("asap");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(orderingWindow.start);
  const [addressId, setAddressId] = useState(app.addresses.find((a) => a.isDefault)?.id ?? app.addresses[0]?.id ?? "");
  const [addressOpen, setAddressOpen] = useState(false);
  const registered = !!app.user && !app.user.guest && !!app.user.name && !!app.user.phone && !!app.user.email;
  const [name, setName] = useState(registered ? app.user?.name ?? "" : "");
  const [phone, setPhone] = useState(registered ? app.user?.phone ?? "" : "");
  const [email, setEmail] = useState(registered ? app.user?.email ?? "" : "");
  const [pay, setPay] = useState<PayMethod>(app.cards.length ? "saved" : "card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [savedCard, setSavedCard] = useState(app.cards[0]?.id ?? "");
  const [error, setError] = useState("");
  const subtotal = subtotalOf(app.cart);
  const tip = app.tipChoice === "custom" ? Math.max(0, Number(app.customTip) || 0) : moneyPercent(subtotal, Number(app.tipChoice));
  const summary = quote({ cart: app.cart, promoCode: app.promoCode, rewardId: app.rewardId, tip, delivery: type === "delivery" });
  const whenLabel = when === "asap" ? "ASAP (15–25 min)" : scheduleLabel(date, time);
  const steps: CheckoutStep[] = registered ? ["type", "time", "place", "pay", "review"] : ["type", "time", "place", "contact", "pay", "review"];
  const current = steps[step] ?? "type";
  const titles: Record<CheckoutStep, string> = {
    type: "Order type",
    time: "Time",
    place: "Details",
    contact: "Contact",
    pay: "Payment",
    review: "Review",
  };
  const contact = registered
    ? { name: app.user?.name ?? "", phone: app.user?.phone ?? "", email: app.user?.email ?? "" }
    : { name: name.trim(), phone: phone.trim(), email: email.trim() };

  function next() {
    setError("");
    if (current === "time" && when === "later") {
      if (!date) return setError("Choose a date.");
      if (time < orderingWindow.start || time > orderingWindow.end) {
        return setError(`Choose a time between ${clockLabel(orderingWindow.start)} and ${clockLabel(orderingWindow.end)}.`);
      }
    }
    if (current === "place" && type === "delivery" && !addressId) {
      setError("Add a delivery address.");
      return;
    }
    if (current === "contact") {
      if (name.trim().length < 2) return setError("Enter the name for the order.");
      if (!isPhone(phone)) return setError("Enter a phone number.");
      if (!isEmail(email)) return setError("Enter an email for the receipt.");
    }
    if (current === "pay" && pay === "card") {
      if (!luhnOk(cardNumber)) return setError("Enter a valid card number. No charge is placed in this preview.");
      if (!/^\d{2}\/\d{2}$/.test(exp)) return setError("Use an expiration like 08/28.");
      if (cvc.length < 3) return setError("Enter the security code.");
    }
    if (current === "pay" && pay === "saved" && !savedCard) return setError("Choose a saved card or pay at pickup.");
    if (step < steps.length - 1) setStep((n) => n + 1);
    else place();
  }

  function paymentLabel() {
    if (pay === "pickup") return "Pay at pickup";
    if (pay === "saved") {
      const card = app.cards.find((c) => c.id === savedCard);
      return card ? `${card.brand} •••• ${card.last4}` : "Saved card";
    }
    return `${cardBrand(cardNumber)} •••• ${cardNumber.replace(/\D/g, "").slice(-4)}`;
  }

  function place() {
    if (!app.cart.length) {
      nav.goTab("cart");
      return;
    }
    const address = app.addresses.find((a) => a.id === addressId);
    const order = app.placeOrder({
      type,
      whenLabel,
      contact,
      address: type === "delivery" && address ? `${address.line1}, ${address.city}, ${address.state} ${address.zip}` : business.address,
      paymentLabel: paymentLabel(),
      tip,
      discount: summary.discount.amount,
      fee: summary.fee,
    });
    if (pay === "card") {
      app.saveCard({ id: `card${Date.now()}`, brand: cardBrand(cardNumber), last4: cardNumber.replace(/\D/g, "").slice(-4), exp });
    }
    haptic("success");
    app.pushToast("Order placed", contact.email ? `Receipt sent to ${contact.email}` : "We'll see you at the diner.");
    nav.push("confirm", { id: order.id });
  }

  const last = step === steps.length - 1;
  const masked = cardNumber.replace(/\D/g, "");

  return (
    <Screen
      header={<NavBar title={titles[current]} onBack={() => (step === 0 ? nav.pop() : setStep((n) => n - 1))} />}
      footer={
        <div className="border-t border-divider bg-background px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="mb-2 flex items-center justify-between text-[15px]">
            <span className="text-muted-foreground">{app.cartCount} {app.cartCount === 1 ? "item" : "items"}</span>
            <span className="font-semibold tabular-nums">{formatMoney(summary.total)}</span>
          </div>
          <PrimaryButton onClick={next}>{last ? `Place order – ${formatMoney(summary.total)}` : "Continue"}</PrimaryButton>
        </div>
      }
    >
      <div className="px-5 pb-6">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Step {step + 1} of {steps.length}</p>
        <div className="mb-5 flex gap-1">
          {steps.map((id, index) => (
            <span key={id} className={index <= step ? "h-1.5 flex-1 rounded-full bg-primary" : "h-1.5 flex-1 rounded-full bg-divider"} />
          ))}
        </div>
        {error ? <p className="mb-3 text-[15px] text-danger">{error}</p> : null}
        {current === "type" ? (
          <div className="space-y-3">
            <h2 className="display text-[28px] leading-tight">How do you want it?</h2>
            <ChoiceCard active={type === "pickup"} icon="takeout" title="Pickup" body="Ready at the diner on North Keswick Avenue." onClick={() => { setType("pickup"); app.setOrderMode("pickup"); }} />
            <ChoiceCard
              active={type === "delivery"}
              icon="mappin"
              title="Delivery"
              body={app.deliveryAvailable ? "We'll bring it to a saved address." : "Delivery availability to be confirmed by the restaurant."}
              disabled={!app.deliveryAvailable}
              onClick={() => {
                if (!app.deliveryAvailable) return;
                setType("delivery");
                app.setOrderMode("delivery");
                if (pay === "pickup") setPay(app.cards.length ? "saved" : "card");
              }}
            />
          </div>
        ) : null}
        {current === "time" ? (
          <div className="space-y-3">
            <h2 className="display text-[28px] leading-tight">When should we make it?</h2>
            <ChoiceCard active={when === "asap"} icon="clock" title="ASAP (15–25 min)" body="We'll start it as soon as the ticket prints." onClick={() => setWhen("asap")} />
            <ChoiceCard active={when === "later"} icon="calendar" title="Schedule for later" body={`Placeholder window ${clockLabel(orderingWindow.start)}–${clockLabel(orderingWindow.end)} until hours are confirmed.`} onClick={() => setWhen("later")} />
            {when === "later" ? (
              <div className="grid grid-cols-2 gap-2 rounded-[16px] bg-surface p-4">
                <label className="text-[13px] text-muted-foreground">
                  Date
                  <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px] text-foreground" />
                </label>
                <label className="text-[13px] text-muted-foreground">
                  Time
                  <input type="time" min={orderingWindow.start} max={orderingWindow.end} value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px] text-foreground" />
                </label>
                <p className="col-span-2 text-[16px] font-semibold">{scheduleLabel(date, time)}</p>
              </div>
            ) : null}
          </div>
        ) : null}
        {current === "place" ? (
          type === "pickup" ? (
            <div className="space-y-3">
              <h2 className="display text-[28px] leading-tight">Pickup at the diner</h2>
              <div className="overflow-hidden rounded-[16px] bg-surface">
                <MiniMap />
                <div className="p-4">
                  <p className="text-[17px] font-semibold">{business.name}</p>
                  <p className="mt-1 text-[16px] leading-snug">{business.address}</p>
                  <p className="mt-2 text-[15px] text-muted-foreground">{whenLabel}</p>
                  <a href={directionsUrl} className="mt-3 inline-flex min-h-11 items-center text-[16px] font-semibold text-primary">Open in Apple Maps</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="display text-[28px] leading-tight">Where should we deliver?</h2>
              {app.addresses.map((address) => (
                <button key={address.id} type="button" onClick={() => setAddressId(address.id)} className={address.id === addressId ? "w-full rounded-[16px] border-2 border-primary bg-primary/10 p-4 text-left" : "w-full rounded-[16px] border-2 border-transparent bg-surface p-4 text-left"}>
                  <span className="block text-[17px] font-semibold">{address.label}{address.isDefault ? " · Default" : ""}</span>
                  <span className="text-[15px] text-muted-foreground">{address.line1}, {address.city}, {address.state} {address.zip}</span>
                </button>
              ))}
              <SecondaryButton onClick={() => setAddressOpen(true)}>Add address</SecondaryButton>
            </div>
          )
        ) : null}
        {current === "contact" ? (
          <div className="space-y-3">
            <h2 className="display text-[28px] leading-tight">How can we reach you?</h2>
            <p className="text-[16px] leading-relaxed text-muted-foreground">Guest checkout. We only use this for the order and the receipt.</p>
            <Field label="Name" value={name} onChange={setName} autoComplete="name" />
            <Field label="Phone" value={phone} onChange={setPhone} type="tel" inputMode="tel" />
            <Field label="Email" value={email} onChange={setEmail} type="email" inputMode="email" />
          </div>
        ) : null}
        {current === "pay" ? (
          <div className="space-y-3">
            <h2 className="display text-[28px] leading-tight">How would you like to pay?</h2>
            {app.cards.length ? (
              <div className="space-y-2">
                <p className="text-[15px] font-semibold text-muted-foreground">Saved cards</p>
                {app.cards.map((card) => (
                  <button key={card.id} type="button" onClick={() => { setPay("saved"); setSavedCard(card.id); }} className={pay === "saved" && savedCard === card.id ? "flex min-h-[64px] w-full items-center justify-between rounded-[16px] border-2 border-primary bg-primary/10 px-4 text-left" : "flex min-h-[64px] w-full items-center justify-between rounded-[16px] border-2 border-transparent bg-surface px-4 text-left"}>
                    <span>
                      <span className="block text-[17px] font-semibold">{card.brand} •••• {card.last4}</span>
                      <span className="text-[13px] text-muted-foreground">Exp {card.exp}</span>
                    </span>
                    {pay === "saved" && savedCard === card.id ? <SFIcon name="checkmark" size={18} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
            <ChoiceCard active={pay === "card"} icon="creditcard" title="Credit or debit card" body="Enter a new card. This preview does not charge it." onClick={() => setPay("card")} />
            {pay === "card" ? (
              <div className="space-y-3 rounded-[16px] bg-surface p-4">
                <div className="rounded-[16px] bg-foreground p-4 text-background">
                  <p className="text-[13px] text-background/70">Card number</p>
                  <p className="mt-1 text-[20px] tracking-[0.12em]">{masked ? masked.replace(/(\d{4})(?=\d)/g, "$1 ").trim() : "•••• •••• •••• ••••"}</p>
                  <div className="mt-4 flex justify-between text-[15px]">
                    <span>{cardName || "Name on card"}</span>
                    <span>{exp || "MM/YY"}</span>
                  </div>
                </div>
                <Field label="Name on card" value={cardName} onChange={setCardName} autoComplete="cc-name" />
                <Field label="Card number" value={cardNumber} onChange={(value) => setCardNumber(value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim())} inputMode="numeric" autoComplete="cc-number" />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="MM/YY" value={exp} onChange={(value) => { const digits = value.replace(/\D/g, "").slice(0, 4); setExp(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); }} autoComplete="cc-exp" />
                  <Field label="CVC" value={cvc} onChange={(value) => setCvc(value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" />
                </div>
              </div>
            ) : null}
            {type === "pickup" ? <ChoiceCard active={pay === "pickup"} icon="takeout" title="Pay at pickup" body="Pay when you collect the order at the counter." onClick={() => setPay("pickup")} /> : null}
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <SFIcon name="lock" size={14} /> Secure payment. Full card numbers are not stored.
            </p>
          </div>
        ) : null}
        {current === "review" ? (
          <div className="space-y-4">
            <h2 className="display text-[28px] leading-tight">Review your order</h2>
            <div className="rounded-[16px] bg-surface p-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">{type === "delivery" ? "Delivery" : "Pickup"}</p>
              <p className="mt-1 text-[17px] font-semibold">{whenLabel}</p>
              <p className="text-[15px] text-muted-foreground">{type === "delivery" ? (app.addresses.find((a) => a.id === addressId)?.line1 ?? "Add an address") : business.address}</p>
            </div>
            <ul className="space-y-3">
              {app.cart.map((line) => (
                <li key={line.id} className="flex gap-3">
                  <FoodImage folder="menu" file={line.image} alt="" className="h-16 w-16 rounded-[12px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold">{line.qty} × {line.name}</p>
                    {line.optionsLabel ? <p className="line-clamp-2 text-[13px] text-muted-foreground">{line.optionsLabel}</p> : null}
                  </div>
                  <span className="text-[16px] font-semibold tabular-nums">{formatMoney(line.unitPrice * line.qty)}</span>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 text-[17px] font-semibold">Tip</p>
              <Segmented
                ariaLabel="Tip"
                value={app.tipChoice}
                onChange={app.setTipChoice}
                options={[
                  { id: "10", label: "10%" },
                  { id: "15", label: "15%" },
                  { id: "20", label: "20%" },
                  { id: "custom", label: "Custom" },
                ]}
              />
              {app.tipChoice === "custom" ? (
                <div className="mt-2">
                  <Field label="Tip amount" value={app.customTip} onChange={app.setCustomTip} inputMode="decimal" />
                </div>
              ) : null}
            </div>
            <div className="rounded-[16px] bg-surface p-4">
              <Summary summary={summary} delivery={type === "delivery"} />
            </div>
            <div className="rounded-[16px] bg-surface p-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">{registered ? "Ordering as" : "Guest"}</p>
              <p className="mt-1 text-[17px] font-semibold">{contact.name}</p>
              <p className="text-[15px] text-muted-foreground">{contact.phone}</p>
              <p className="text-[15px] text-muted-foreground">{contact.email}</p>
              <p className="mt-2 text-[16px] font-semibold">{paymentLabel()}</p>
            </div>
          </div>
        ) : null}
      </div>
      <AddressSheet open={addressOpen} onClose={() => setAddressOpen(false)} />
    </Screen>
  );
}

function ChoiceCard({
  active,
  title,
  body,
  icon,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  body: string;
  icon: "takeout" | "mappin" | "clock" | "calendar" | "creditcard";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={active ? "flex w-full items-start gap-3 rounded-[16px] border-2 border-primary bg-primary/10 p-4 text-left" : "flex w-full items-start gap-3 rounded-[16px] border-2 border-transparent bg-surface p-4 text-left disabled:opacity-50"}>
      <span className={active ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-primary"}>
        <SFIcon name={icon} size={20} />
      </span>
      <span>
        <span className="block text-[17px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-[15px] leading-snug text-muted-foreground">{body}</span>
      </span>
    </button>
  );
}

function MiniMap() {
  const z = 17;
  const lat = business.lat;
  const lon = business.lon;
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return (
    <div className="relative h-40 overflow-hidden">
      <img alt="Map of The Village Diner on North Keswick Avenue" className="h-full w-full object-cover" src={`https://tile.openstreetmap.org/${z}/${x}/${y}.png`} />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-primary">
        <SFIcon name="mappin" size={28} />
      </span>
      <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 text-[13px]">© OpenStreetMap</span>
    </div>
  );
}

export function AddressSheet({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: SavedAddress }) {
  const app = useApp();
  const [label, setLabel] = useState(initial?.label ?? "Home");
  const [line1, setLine1] = useState(initial?.line1 ?? "");
  const [city, setCity] = useState(initial?.city ?? "Glenside");
  const [state, setState] = useState(initial?.state ?? "PA");
  const [zip, setZip] = useState(initial?.zip ?? "19038");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? app.addresses.length === 0);
  const [error, setError] = useState("");
  return (
    <Sheet
      open={open}
      title={initial ? "Edit address" : "Add address"}
      onClose={onClose}
      footer={
        <PrimaryButton
          onClick={() => {
            if (line1.trim().length < 4) {
              setError("Enter a street address.");
              return;
            }
            app.saveAddress({
              id: initial?.id ?? `ad${Date.now()}`,
              label: label || "Home",
              line1: line1.trim(),
              city: city.trim(),
              state: state.trim(),
              zip: zip.trim(),
              isDefault,
            });
            onClose();
          }}
        >
          Save address
        </PrimaryButton>
      }
    >
      <div className="space-y-3 pb-2">
        {error ? <p className="text-[13px] text-danger">{error}</p> : null}
        <Field label="Label" value={label} onChange={setLabel} />
        <Field label="Street" value={line1} onChange={setLine1} />
        <Field label="City" value={city} onChange={setCity} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="State" value={state} onChange={setState} />
          <Field label="ZIP" value={zip} onChange={setZip} inputMode="numeric" />
        </div>
        <label className="flex items-center gap-2 text-[16px]">
          <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} className="h-5 w-5 accent-primary" />
          Set as default
        </label>
      </div>
    </Sheet>
  );
}

export function ConfirmScreen() {
  const nav = useNav();
  const app = useApp();
  const order = app.orders.find((entry) => entry.id === nav.current.params?.id) ?? app.orders[0];
  if (!order) {
    return (
      <Screen header={<NavBar title="Order" onBack={() => nav.reset("home")} />}>
        <EmptyState title="No order yet" body="Place an order and the confirmation will land here." />
      </Screen>
    );
  }
  return (
    <Screen header={<NavBar title="Order placed" right={<button type="button" className="text-[17px] font-semibold text-primary" onClick={() => nav.reset("home")}>Done</button>} />}>
      <div className="px-5 pb-8">
        <div className="text-center">
          <span className="anim-check mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-white">
            <SFIcon name="checkmark" size={36} />
          </span>
          <h1 className="display mt-4 text-[34px] leading-tight">Order placed</h1>
          <p className="mt-2 text-[16px] text-muted-foreground">We'll have it ready for you.</p>
        </div>
        <article className="diner-shadow mt-6 overflow-hidden rounded-[16px] bg-surface">
          <div className="bg-primary px-4 py-5 text-center text-white">
            <p className="text-[13px] font-semibold uppercase tracking-wide">The Village Diner</p>
            <p className="display mt-1 text-[32px] leading-none text-white">{order.number}</p>
            <p className="mt-2 text-[16px]">{order.type === "delivery" ? "Delivery" : "Pickup"} · {prettyWhen(order.whenLabel)}</p>
          </div>
          <div className="space-y-4 p-4">
            <p className="text-[16px] leading-snug">{order.type === "delivery" ? order.address : business.address}</p>
            <ul className="space-y-3 border-t border-dashed border-divider pt-4">
              {order.lines.map((line) => (
                <li key={line.id} className="flex gap-3">
                  <FoodImage folder="menu" file={line.image} alt="" className="h-14 w-14 rounded-[12px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold">{line.qty} × {line.name}</p>
                    {line.optionsLabel ? <p className="line-clamp-2 text-[13px] text-muted-foreground">{line.optionsLabel}</p> : null}
                  </div>
                  <span className="text-[16px] tabular-nums">{formatMoney(line.unitPrice * line.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t border-divider pt-3 text-[16px]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatMoney(order.subtotal)}</dd></div>
              {order.discount ? <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="tabular-nums">-{formatMoney(order.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular-nums">{formatMoney(order.tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tip</dt><dd className="tabular-nums">{formatMoney(order.tip)}</dd></div>
              {order.fee ? <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="tabular-nums">{formatMoney(order.fee)}</dd></div> : null}
              <div className="flex justify-between border-t border-divider pt-2 text-[17px] font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.total)}</dd></div>
            </dl>
            <p className="text-[15px] text-muted-foreground">{order.paymentLabel}</p>
            <p className="text-[15px] text-muted-foreground">{order.contact.name} · {order.contact.phone}</p>
          </div>
        </article>
        <div className="mt-6 space-y-3">
          <PrimaryButton onClick={() => nav.push("track", { id: order.id })}>Track Order</PrimaryButton>
          <SecondaryButton
            onClick={() => {
              const start = new Date(Date.now() + 20 * 60 * 1000);
              const end = new Date(start.getTime() + 30 * 60 * 1000);
              downloadIcs({ title: `Village Diner ${order.number}`, start, end, details: order.whenLabel, location: business.address });
            }}
          >
            Add to Calendar
          </SecondaryButton>
          <TextButton className="w-full" onClick={() => nav.reset("home")}>
            Back to Home
          </TextButton>
        </div>
      </div>
    </Screen>
  );
}

export function TrackScreen() {
  const nav = useNav();
  const app = useApp();
  const order = app.orders.find((entry) => entry.id === nav.current.params?.id);
  const steps = useMemo(() => (order?.type === "delivery" ? ["Received", "Preparing", "Out for Delivery", "Completed"] : ["Received", "Preparing", "Ready for Pickup", "Completed"]), [order?.type]);
  if (!order) {
    return (
      <Screen header={<NavBar title="Order" onBack={() => nav.pop()} />}>
        <EmptyState title="Order not found" body="It may have been cleared from this phone." />
      </Screen>
    );
  }
  const index = order.status === "received" ? 0 : order.status === "preparing" ? 1 : order.status === "completed" ? 3 : 2;
  return (
    <Screen
      header={<NavBar title={order.number} onBack={() => nav.pop()} />}
      footer={
        <div className="grid grid-cols-2 gap-2 border-t border-divider bg-background px-5 py-3 pb-[max(20px,env(safe-area-inset-bottom))]">
          <a href={`tel:${business.phoneTel}`} className="flex h-[52px] items-center justify-center rounded-[14px] bg-primary text-[17px] font-semibold text-white">Call diner</a>
          <button type="button" onClick={() => nav.push("support")} className="h-[52px] rounded-[14px] border-2 border-primary text-[17px] font-semibold text-primary">Support</button>
        </div>
      }
    >
      <div className="space-y-5 px-5 pb-6">
        <StatusStepper steps={steps} current={index} />
        <p className="text-center text-[16px] text-muted-foreground">{prettyWhen(order.whenLabel)}</p>
        <div className="overflow-hidden rounded-[16px]">
          <MiniMap />
        </div>
        <ul className="space-y-3 rounded-[16px] bg-surface p-4">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 text-[16px]">
              <span>{line.qty} × {line.name}</span>
              <span className="tabular-nums">{formatMoney(line.unitPrice * line.qty)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}

export function OrdersScreen() {
  const nav = useNav();
  const app = useApp();
  const mine = app.orders.filter((order) => !app.user || order.userId === app.user.id || app.user.guest);
  return (
    <Screen header={<NavBar title="Order history" large onBack={() => nav.pop()} />}>
      {mine.length === 0 ? (
        <EmptyState icon="clock" title="No orders yet" body="When you place a pickup, it will show up here with a reorder button." action={<PrimaryButton onClick={() => nav.openMenu()}>Browse Menu</PrimaryButton>} />
      ) : (
        <ul className="px-5">
          {mine.map((order) => (
            <li key={order.id}>
              <button type="button" onClick={() => nav.push("order", { id: order.id })} className="flex w-full items-center justify-between border-b border-divider py-4 text-left">
                <span>
                  <span className="block text-[17px] font-semibold">{order.number}</span>
                  <span className="text-[13px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()} · {order.status}</span>
                </span>
                <span className="text-[16px] font-semibold tabular-nums">{formatMoney(order.total)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}

export function OrderDetail() {
  const nav = useNav();
  const app = useApp();
  const order = app.orders.find((entry) => entry.id === nav.current.params?.id);
  if (!order) return <Screen header={<NavBar title="Order" onBack={() => nav.pop()} />}><EmptyState title="Missing order" body="Head back to your history." /></Screen>;
  return (
    <Screen
      header={<NavBar title={order.number} onBack={() => nav.pop()} />}
      footer={
        <div className="px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <PrimaryButton
            onClick={() => {
              app.reorder(order.id);
              app.pushToast("Added to cart");
              nav.goTab("cart");
            }}
          >
            Reorder
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-3 px-5">
        <p className="text-[16px] capitalize">{order.status.replace("delivering", "out for delivery")} · {prettyWhen(order.whenLabel)}</p>
        {order.lines.map((line) => (
          <div key={line.id} className="flex gap-3">
            <FoodImage folder="menu" file={line.image} alt="" className="h-14 w-14 rounded-[12px]" />
            <div>
              <p className="text-[16px] font-semibold">{line.qty} × {line.name}</p>
              {line.optionsLabel ? <p className="text-[13px] text-muted-foreground">{line.optionsLabel}</p> : null}
            </div>
          </div>
        ))}
        <p className="text-[17px] font-semibold">Total {formatMoney(order.total)}</p>
        <button type="button" className="text-[16px] font-semibold text-primary" onClick={() => nav.push("feedback")}>Rate this order</button>
      </div>
    </Screen>
  );
}

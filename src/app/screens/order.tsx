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
  const [name, setName] = useState(app.user && !app.user.guest ? app.user.name : "");
  const [phone, setPhone] = useState(app.user?.phone ?? "");
  const [email, setEmail] = useState(app.user?.email ?? "");
  const [pay, setPay] = useState<"apple" | "card" | "pickup" | "saved">("apple");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [savedCard, setSavedCard] = useState(app.cards[0]?.id ?? "");
  const [error, setError] = useState("");
  const subtotal = subtotalOf(app.cart);
  const tip = app.tipChoice === "custom" ? Math.max(0, Number(app.customTip) || 0) : moneyPercent(subtotal, Number(app.tipChoice));
  const summary = quote({ cart: app.cart, promoCode: app.promoCode, rewardId: app.rewardId, tip, delivery: type === "delivery" });
  const whenLabel = when === "asap" ? "ASAP (15–25 min)" : `${date} at ${time}`;

  const titles = ["Order type", "Time", "Details", "Contact", "Payment", "Review"];

  function next() {
    setError("");
    if (step === 2 && type === "delivery" && !addressId) {
      setError("Add a delivery address.");
      return;
    }
    if (step === 3) {
      if (name.trim().length < 2) return setError("Enter the name for the order.");
      if (!isPhone(phone)) return setError("Enter a phone number.");
      if (!isEmail(email)) return setError("Enter an email for the receipt.");
    }
    if (step === 4 && pay === "card") {
      if (!luhnOk(cardNumber)) return setError("Enter a valid card number. No charge is placed in this preview.");
      if (!/^\d{2}\/\d{2}$/.test(exp)) return setError("Use an expiration like 08/28.");
      if (cvc.length < 3) return setError("Enter the security code.");
    }
    if (step === 4 && pay === "saved" && !savedCard) return setError("Choose a saved card or another way to pay.");
    if (step < 5) setStep((n) => n + 1);
    else place();
  }

  function paymentLabel() {
    if (pay === "apple") return "Apple Pay";
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
      contact: { name: name.trim(), phone: phone.trim(), email: email.trim() },
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
    app.pushToast("Order placed", `Receipt sent to ${email.trim()}`);
    nav.push("confirm", { id: order.id });
  }

  return (
    <Screen
      header={<NavBar title={titles[step] ?? "Checkout"} onBack={() => (step === 0 ? nav.pop() : setStep((n) => n - 1))} />}
      footer={
        <div className="border-t border-divider px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <PrimaryButton onClick={next}>{step === 5 ? `Place order – ${formatMoney(summary.total)}` : "Continue"}</PrimaryButton>
        </div>
      }
    >
      <div className="px-5 pb-6">
        <div className="mb-4 flex gap-1">
          {titles.map((title, index) => (
            <span key={title} className={index <= step ? "h-1 flex-1 rounded-full bg-primary" : "h-1 flex-1 rounded-full bg-divider"} />
          ))}
        </div>
        {error ? <p className="mb-3 text-[15px] text-danger">{error}</p> : null}
        {step === 0 ? (
          <div className="space-y-3">
            <Segmented
              ariaLabel="Order type"
              value={type}
              onChange={(value) => {
                setType(value);
                app.setOrderMode(value);
              }}
              options={[
                { id: "pickup", label: "Pickup" },
                { id: "delivery", label: "Delivery", disabled: !app.deliveryAvailable },
              ]}
            />
            <p className="text-[15px] text-muted-foreground">Delivery availability to be confirmed by the restaurant. Pickup is ready now.</p>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="space-y-3">
            <button type="button" onClick={() => setWhen("asap")} className={when === "asap" ? "w-full rounded-[16px] bg-primary/10 p-4 text-left" : "w-full rounded-[16px] bg-surface p-4 text-left"}>
              <span className="block text-[17px] font-semibold">ASAP (15–25 min)</span>
              <span className="text-[15px] text-muted-foreground">We'll start it as soon as the ticket prints.</span>
            </button>
            <button type="button" onClick={() => setWhen("later")} className={when === "later" ? "w-full rounded-[16px] bg-primary/10 p-4 text-left" : "w-full rounded-[16px] bg-surface p-4 text-left"}>
              <span className="block text-[17px] font-semibold">Schedule for later</span>
              <span className="text-[15px] text-muted-foreground">Placeholder window {orderingWindow.start}–{orderingWindow.end} until hours are confirmed.</span>
            </button>
            {when === "later" ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[13px] text-muted-foreground">
                  Date
                  <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px] text-foreground" />
                </label>
                <label className="text-[13px] text-muted-foreground">
                  Time
                  <input type="time" min={orderingWindow.start} max={orderingWindow.end} value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-divider bg-background px-3 text-[16px] text-foreground" />
                </label>
              </div>
            ) : null}
          </div>
        ) : null}
        {step === 2 ? (
          type === "pickup" ? (
            <div className="rounded-[16px] bg-surface p-4">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">Pickup</p>
              <p className="mt-1 text-[17px] font-semibold">{business.name}</p>
              <p className="text-[16px]">{business.address}</p>
              <MiniMap />
              <a href={directionsUrl} className="mt-3 inline-flex text-[16px] font-semibold text-primary">Open in Apple Maps</a>
            </div>
          ) : (
            <div className="space-y-3">
              {app.addresses.map((address) => (
                <button key={address.id} type="button" onClick={() => setAddressId(address.id)} className={address.id === addressId ? "w-full rounded-[16px] bg-primary/10 p-4 text-left" : "w-full rounded-[16px] bg-surface p-4 text-left"}>
                  <span className="block text-[17px] font-semibold">{address.label}{address.isDefault ? " · Default" : ""}</span>
                  <span className="text-[15px] text-muted-foreground">{address.line1}, {address.city}</span>
                </button>
              ))}
              <SecondaryButton onClick={() => setAddressOpen(true)}>Add address</SecondaryButton>
            </div>
          )
        ) : null}
        {step === 3 ? (
          <div className="space-y-3">
            <Field label="Name" value={name} onChange={setName} autoComplete="name" />
            <Field label="Phone" value={phone} onChange={setPhone} type="tel" inputMode="tel" />
            <Field label="Email" value={email} onChange={setEmail} type="email" inputMode="email" />
            {!app.user || app.user.guest ? <p className="text-[13px] text-muted-foreground">Guest checkout. We'll use this only for the order.</p> : null}
          </div>
        ) : null}
        {step === 4 ? (
          <div className="space-y-3">
            <PayChoice active={pay === "apple"} onClick={() => setPay("apple")} label="Apple Pay" icon="apple" />
            <PayChoice active={pay === "card"} onClick={() => setPay("card")} label="Credit or debit card" icon="creditcard" />
            {app.cards.length ? <PayChoice active={pay === "saved"} onClick={() => setPay("saved")} label="Saved card" icon="creditcard" /> : null}
            {type === "pickup" ? <PayChoice active={pay === "pickup"} onClick={() => setPay("pickup")} label="Pay at pickup" icon="takeout" /> : null}
            {pay === "card" ? (
              <div className="space-y-2">
                <Field label="Name on card" value={cardName} onChange={setCardName} />
                <Field label="Card number" value={cardNumber} onChange={setCardNumber} inputMode="numeric" />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="MM/YY" value={exp} onChange={setExp} />
                  <Field label="CVC" value={cvc} onChange={setCvc} inputMode="numeric" />
                </div>
              </div>
            ) : null}
            {pay === "saved" ? (
              <div className="space-y-2">
                {app.cards.map((card) => (
                  <button key={card.id} type="button" onClick={() => setSavedCard(card.id)} className="flex min-h-11 w-full items-center justify-between rounded-[14px] bg-surface px-3 text-left">
                    {card.brand} •••• {card.last4}
                    {savedCard === card.id ? <SFIcon name="checkmark" size={16} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <SFIcon name="lock" size={14} /> Secure payment. This preview does not charge a card.
            </p>
          </div>
        ) : null}
        {step === 5 ? (
          <div className="space-y-3">
            <p className="text-[16px]">{type === "delivery" ? "Delivery" : "Pickup"} · {whenLabel}</p>
            <ul className="space-y-2">
              {app.cart.map((line) => (
                <li key={line.id} className="flex justify-between gap-3 text-[16px]">
                  <span>{line.qty} × {line.name}</span>
                  <span className="tabular-nums">{formatMoney(line.unitPrice * line.qty)}</span>
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
            <Summary summary={summary} delivery={type === "delivery"} />
            <p className="text-[15px] text-muted-foreground">{name} · {phone} · {email}</p>
            <p className="text-[15px] text-muted-foreground">{paymentLabel()}</p>
          </div>
        ) : null}
      </div>
      <AddressSheet open={addressOpen} onClose={() => setAddressOpen(false)} />
    </Screen>
  );
}

function PayChoice({ active, label, onClick, icon }: { active: boolean; label: string; onClick: () => void; icon: "apple" | "creditcard" | "takeout" }) {
  return (
    <button type="button" onClick={onClick} className={active ? "flex h-[52px] w-full items-center gap-3 rounded-[14px] bg-primary px-4 text-left text-[17px] font-semibold text-white" : "flex h-[52px] w-full items-center gap-3 rounded-[14px] bg-surface px-4 text-left text-[17px] font-semibold"}>
      <SFIcon name={icon} size={18} />
      {label}
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
    <div className="relative mt-3 h-32 overflow-hidden rounded-[16px]">
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
    <Screen>
      <div className="px-5 pb-8 pt-[max(28px,env(safe-area-inset-top))] text-center">
        <span className="anim-check mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-white">
          <SFIcon name="checkmark" size={36} />
        </span>
        <h1 className="display mt-4 text-[28px]">Order placed</h1>
        <p className="mt-1 text-[16px] text-muted-foreground">{order.number}</p>
        <p className="mt-2 text-[17px] font-semibold">{order.whenLabel}</p>
        <p className="text-[16px] text-muted-foreground">{order.type === "delivery" ? order.address : business.address}</p>
        <ul className="mt-4 space-y-1 text-left text-[16px]">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between">
              <span>{line.qty} × {line.name}</span>
              <span>{formatMoney(line.unitPrice * line.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[17px] font-semibold">Total {formatMoney(order.total)}</p>
        <div className="mt-6 space-y-2">
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
    <Screen header={<NavBar title={order.number} onBack={() => nav.pop()} />}>
      <div className="space-y-5 px-5 pb-8">
        <StatusStepper steps={steps} current={index} />
        <p className="text-center text-[16px] text-muted-foreground">{order.whenLabel}</p>
        <MiniMap />
        <ul className="space-y-2">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between text-[16px]">
              <span>{line.qty} × {line.name}</span>
              <span>{formatMoney(line.unitPrice * line.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${business.phoneTel}`} className="flex h-11 items-center justify-center rounded-[14px] bg-primary font-semibold text-white">Call diner</a>
          <button type="button" onClick={() => nav.push("support")} className="h-11 rounded-[14px] border-2 border-primary font-semibold text-primary">Support</button>
        </div>
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
        <p className="text-[16px] capitalize">{order.status.replace("delivering", "out for delivery")} · {order.whenLabel}</p>
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

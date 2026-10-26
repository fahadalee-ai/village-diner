import { useState, type ReactNode } from "react";
import { business } from "@/data/business";
import { coupons, rewardCatalog, rewardTiers } from "@/data/content";
import { getItem } from "@/data/menu";
import { formatMoney, haptic, initials, isEmail, isPhone } from "@/lib/format";
import { useApp, type SavedAddress } from "@/lib/store";
import { useNav } from "@/app/nav";
import { AddressSheet } from "./order";
import { ActionSheet, Badge, EmptyState, Field, FoodImage, ListRow, NavBar, PrimaryButton, Screen, SecondaryButton, Segmented, Sheet, ToggleRow } from "@/components/ios";
import { SFIcon } from "@/components/sf";
import { defaultSelection, selectionLabel, selectionPrice } from "@/data/menu";

function ProfileGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="overflow-hidden rounded-[16px] bg-surface px-4">{children}</div>
    </section>
  );
}

function Avatar({ text, url }: { text: string; url?: string }) {
  if (url) return <img src={url} alt="" className="h-[88px] w-[88px] rounded-full object-cover ring-4 ring-white/30" />;
  return <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white text-[28px] font-semibold text-primary ring-4 ring-white/30">{text}</span>;
}

export function AccountScreen() {
  const nav = useNav();
  const app = useApp();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const user = app.user;

  if (!user) {
    return (
      <Screen>
        <div className="bg-primary px-5 pb-14 pt-[max(36px,env(safe-area-inset-top))] text-center text-white">
          <span className="mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white/15 ring-4 ring-white/30">
            <SFIcon name="person" size={36} />
          </span>
          <h1 className="display mt-4 text-[34px] leading-[1.15] text-white">Your account</h1>
          <p className="mx-auto mt-2 max-w-[280px] text-[16px] leading-snug text-white">{business.tagline}</p>
        </div>
        <div className="-mt-6 rounded-t-[24px] bg-background px-5 pb-8 pt-6">
          <p className="text-center text-[16px] leading-relaxed text-muted-foreground">Sign in to save favorites, track rewards, and reorder breakfast faster.</p>
          <div className="mt-5 space-y-3">
            <PrimaryButton onClick={() => nav.reset("login")}>Log In</PrimaryButton>
            <SecondaryButton onClick={() => nav.push("register")}>Create an account</SecondaryButton>
          </div>
          <ProfileGroup title="The diner">
            <ListRow icon="question" title="Support" onClick={() => nav.push("support")} />
            <ListRow icon="info" title="About" detail={`Version ${business.version}`} onClick={() => nav.push("about")} />
            <ListRow icon="gear" title="Settings" onClick={() => nav.push("settings")} />
          </ProfileGroup>
        </div>
      </Screen>
    );
  }

  const tier = [...rewardTiers].reverse().find((entry) => user.points >= entry.min) ?? rewardTiers[0];
  const orderCount = app.orders.filter((order) => order.userId === user.id).length;

  return (
    <Screen>
      <div className="bg-primary px-5 pb-16 pt-[max(36px,env(safe-area-inset-top))] text-center text-white">
        <Avatar text={user.avatarText} url={user.avatarUrl} />
        <h1 className="display mt-4 text-[34px] leading-[1.15] text-white">{user.name}</h1>
        <p className="mx-auto mt-2 max-w-[280px] truncate text-[16px] text-white">{user.guest ? "Guest checkout" : user.email}</p>
        {!user.guest ? <p className="mt-1 text-[16px] text-white">{tier.name} · {user.points} points</p> : null}
        <button type="button" onClick={() => nav.push("edit-profile")} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold text-primary">
          <SFIcon name="pencil" size={16} />
          Edit profile
        </button>
      </div>
      <div className="-mt-6 rounded-t-[24px] bg-background px-5 pb-8 pt-5">
        {!user.guest ? (
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => nav.goTab("rewards")} className="rounded-[16px] bg-surface px-2 py-3 text-center">
              <span className="block text-[22px] font-semibold tabular-nums">{user.points}</span>
              <span className="text-[13px] text-muted-foreground">Points</span>
            </button>
            <button type="button" onClick={() => nav.push("orders")} className="rounded-[16px] bg-surface px-2 py-3 text-center">
              <span className="block text-[22px] font-semibold tabular-nums">{orderCount}</span>
              <span className="text-[13px] text-muted-foreground">Orders</span>
            </button>
            <button type="button" onClick={() => nav.push("favorites")} className="rounded-[16px] bg-surface px-2 py-3 text-center">
              <span className="block text-[22px] font-semibold tabular-nums">{app.favorites.length}</span>
              <span className="text-[13px] text-muted-foreground">Favorites</span>
            </button>
          </div>
        ) : (
          <div className="rounded-[16px] bg-surface p-4">
            <p className="text-[16px] leading-relaxed">Create an account to keep points, addresses, and order history.</p>
            <div className="mt-3">
              <PrimaryButton onClick={() => nav.push("register")}>Create an account</PrimaryButton>
            </div>
          </div>
        )}
        <ProfileGroup title="Your diner">
          <ListRow icon="mappin" title="Saved addresses" detail={app.addresses.length ? `${app.addresses.length} saved` : "None yet"} onClick={() => nav.push("addresses")} />
          <ListRow icon="creditcard" title="Payment methods" detail="Apple Pay and saved cards" onClick={() => nav.push("payments")} />
          <ListRow icon="clock" title="Order history" onClick={() => nav.push("orders")} />
          <ListRow icon="heart" title="Favorites" onClick={() => nav.push("favorites")} />
        </ProfileGroup>
        <ProfileGroup title="Rewards">
          <ListRow icon="gift" title="Rewards" detail={user.guest ? "Sign in to earn points" : tier.name} onClick={() => nav.goTab("rewards")} />
          <ListRow icon="bell" title="Notifications" onClick={() => nav.push("notif-prefs")} />
        </ProfileGroup>
        <ProfileGroup title="Help">
          <ListRow icon="question" title="Support" onClick={() => nav.push("support")} />
          <ListRow icon="star" title="Feedback and ratings" onClick={() => nav.push("feedback")} />
          <ListRow icon="info" title="About" detail={`Version ${business.version}`} onClick={() => nav.push("about")} />
          <ListRow icon="gear" title="Settings" onClick={() => nav.push("settings")} />
        </ProfileGroup>
        <ProfileGroup title="Legal">
          <ListRow icon="doc" title="Privacy Policy" onClick={() => nav.push("privacy")} />
          <ListRow icon="doc" title="Terms of Service" onClick={() => nav.push("terms")} />
        </ProfileGroup>
        <ProfileGroup title="Account">
          <ListRow icon="person" title="Log out" destructive onClick={() => setLogoutOpen(true)} />
          {!user.guest ? <ListRow title="Delete account" destructive onClick={() => setDeleteOpen(true)} /> : null}
        </ProfileGroup>
      </div>
      <ActionSheet
        open={logoutOpen}
        title="Log out?"
        message="Your cart on this phone will be cleared."
        onClose={() => setLogoutOpen(false)}
        actions={[{ label: "Log Out", destructive: true, onPress: () => { app.logout(); setLogoutOpen(false); nav.reset("login"); } }]}
      />
      <ActionSheet
        open={deleteOpen}
        title="Delete account?"
        message="Orders and points saved on this phone for this account will be removed."
        onClose={() => setDeleteOpen(false)}
        actions={[{ label: "Delete Account", destructive: true, onPress: () => { app.deleteAccount(); setDeleteOpen(false); nav.reset("login"); } }]}
      />
    </Screen>
  );
}

export function EditProfile() {
  const nav = useNav();
  const app = useApp();
  const user = app.user;
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [birthday, setBirthday] = useState(user?.birthday ?? "");
  const [error, setError] = useState("");
  if (!user) return null;

  function save() {
    if (name.trim().length < 2) return setError("Enter your name.");
    if (email && !isEmail(email)) return setError("Enter a valid email.");
    if (phone && !isPhone(phone)) return setError("Enter a valid phone number.");
    app.updateUser({ name: name.trim(), phone: phone.trim(), email: email.trim(), birthday, avatarText: initials(name) });
    haptic("success");
    app.pushToast("Profile saved");
    nav.pop();
  }

  return (
    <div className="relative h-full">
      <Screen
        footer={
          <div className="border-t border-divider bg-background px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <PrimaryButton onClick={save}>Save</PrimaryButton>
          </div>
        }
      >
        <div className="bg-primary px-5 pb-14 pt-[max(36px,env(safe-area-inset-top))] text-center text-white">
          <label className="mx-auto block w-fit">
            <span className="relative mx-auto block h-[88px] w-[88px]">
              <Avatar text={user.avatarText} url={user.avatarUrl} />
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary">
                <SFIcon name="pencil" size={14} />
              </span>
            </span>
            <span className="mt-3 block text-[16px] font-semibold text-white">Change photo</span>
            <input
              type="file"
              accept="image/*"
              aria-label="Profile photo"
              className="absolute h-px w-px overflow-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    ctx.drawImage(img, 0, 0, 128, 128);
                    app.updateUser({ avatarUrl: canvas.toDataURL("image/jpeg", 0.8) });
                  };
                  img.src = String(reader.result);
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
        <div className="-mt-6 space-y-3 rounded-t-[24px] bg-background px-5 pb-8 pt-6">
          {error ? <p className="text-[13px] text-danger">{error}</p> : null}
          <Field label="Name" value={name} onChange={setName} autoComplete="name" />
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" inputMode="tel" autoComplete="tel" />
          <Field label="Email" value={email} onChange={setEmail} type="email" inputMode="email" autoComplete="email" />
          <label className="block rounded-[16px] bg-surface p-4">
            <span className="block text-[17px] font-semibold">Birthday</span>
            <span className="mt-1 block text-[15px] leading-snug text-muted-foreground">Used for your birthday offer.</span>
            <input type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} className="mt-3 h-12 w-full rounded-[14px] border border-divider bg-background px-4 text-[17px] text-foreground" />
          </label>
        </div>
      </Screen>
      <button type="button" aria-label="Back" onClick={() => nav.pop()} className="absolute left-3 top-[max(8px,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white">
        <SFIcon name="chevron.left" size={22} />
      </button>
    </div>
  );
}

export function AddressesScreen() {
  const nav = useNav();
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const current = app.addresses.find((a) => a.id === editing);
  return (
    <Screen header={<NavBar title="Addresses" onBack={() => nav.pop()} />} footer={<div className="px-5 py-3"><PrimaryButton onClick={() => { setEditing(null); setOpen(true); }}>Add address</PrimaryButton></div>}>
      {app.addresses.length === 0 ? <EmptyState icon="mappin" title="No saved addresses" body="Add one for a future delivery order." /> : (
        <ul className="px-5">
          {app.addresses.map((address) => (
            <li key={address.id} className="border-b border-divider py-3">
              <p className="text-[17px] font-semibold">{address.label}{address.isDefault ? " · Default" : ""}</p>
              <p className="text-[15px] text-muted-foreground">{address.line1}, {address.city}, {address.state} {address.zip}</p>
              <div className="mt-2 flex gap-4">
                <button type="button" className="text-[16px] font-semibold text-primary" onClick={() => { setEditing(address.id); setOpen(true); }}>Edit</button>
                <button type="button" className="text-[16px] font-semibold text-danger" onClick={() => app.removeAddress(address.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open ? <AddressEditor key={editing ?? "new"} initial={current} onClose={() => setOpen(false)} /> : null}
    </Screen>
  );
}

function AddressEditor({ initial, onClose }: { initial?: SavedAddress; onClose: () => void }) {
  return <AddressSheet open onClose={onClose} initial={initial} />;
}

export function PaymentsScreen() {
  const nav = useNav();
  const app = useApp();
  return (
    <Screen header={<NavBar title="Payment methods" onBack={() => nav.pop()} />}>
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-[16px] bg-black px-4 py-4 text-white">
          <SFIcon name="apple" />
          <div>
            <p className="text-[17px] font-semibold">Apple Pay</p>
            <p className="text-[13px] text-white/70">Primary way to pay at checkout</p>
          </div>
        </div>
        <ul className="mt-4">
          {app.cards.map((card) => (
            <li key={card.id} className="flex items-center justify-between border-b border-divider py-3">
              <span>
                <span className="block text-[17px]">{card.brand} •••• {card.last4}</span>
                <span className="text-[13px] text-muted-foreground">Exp {card.exp}</span>
              </span>
              <button type="button" className="text-[16px] font-semibold text-danger" onClick={() => app.removeCard(card.id)}>Remove</button>
            </li>
          ))}
        </ul>
        {app.cards.length === 0 ? <p className="mt-4 text-[16px] text-muted-foreground">Cards you enter at checkout are saved here by last four digits only.</p> : null}
        <p className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground"><SFIcon name="lock" size={14} /> Secure payment. Full card numbers are not stored.</p>
      </div>
    </Screen>
  );
}

export function FavoritesScreen() {
  const nav = useNav();
  const app = useApp();
  const items = app.favorites.map((id) => getItem(id)).filter((item) => !!item);
  return (
    <Screen header={<NavBar title="Favorites" large onBack={() => nav.pop()} />}>
      {items.length === 0 ? (
        <EmptyState icon="heart" title="No favorites yet" body="Tap the heart on a dish to keep it here." action={<PrimaryButton onClick={() => nav.openMenu()}>Browse Menu</PrimaryButton>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5">
          {items.map((item) => item ? (
            <div key={item.id} className="overflow-hidden rounded-[16px] bg-surface text-left diner-shadow">
              <button type="button" onClick={() => nav.push("item", { id: item.id })} className="block w-full text-left">
                <FoodImage folder="menu" file={item.image} alt="" className="h-28 w-full" />
                <span className="block p-3">
                  <span className="block text-[16px] font-semibold leading-tight">{item.name}</span>
                  <span className="text-[15px] text-primary">{formatMoney(item.price)}</span>
                </span>
              </button>
              <div className="flex justify-end px-3 pb-3">
                <button
                  type="button"
                  aria-label={`Add ${item.name}`}
                  onClick={() => {
                    const selection = defaultSelection(item);
                    app.addLine({ itemId: item.id, name: item.name, image: item.image, qty: 1, unitPrice: selectionPrice(item, selection), optionsLabel: selectionLabel(item, selection), instructions: "", selection });
                    haptic("success");
                    app.pushToast("Added to cart", item.name);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"
                >
                  <SFIcon name="plus" size={18} />
                </button>
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </Screen>
  );
}

export function SettingsScreen() {
  const nav = useNav();
  const app = useApp();
  return (
    <Screen header={<NavBar title="Settings" onBack={() => nav.pop()} />}>
      <div className="space-y-5 px-5 pb-8">
        <div>
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Appearance</p>
          <Segmented ariaLabel="Appearance" value={app.theme} onChange={app.setTheme} options={[{ id: "system", label: "System" }, { id: "light", label: "Light" }, { id: "dark", label: "Dark" }]} />
        </div>
        <ListRow icon="bell" title="Notifications" onClick={() => nav.push("notif-prefs")} />
        <div>
          <p className="text-[17px]">Language</p>
          <p className="text-[15px] text-muted-foreground">English</p>
        </div>
        <ToggleRow label="Delivery ordering" detail="Off until the restaurant confirms delivery. Turn on to preview the delivery checkout." checked={app.deliveryPreview || business.deliveryEnabled} onChange={(on) => app.setDeliveryPreview(on)} />
        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">App status</p>
        <ListRow title="Offline" detail="What guests see with no connection" onClick={() => nav.push("offline")} />
        <ListRow title="Maintenance" onClick={() => nav.push("maintenance")} />
        <ListRow title="Update required" onClick={() => nav.push("force-update")} />
        <p className="text-[13px] text-muted-foreground">Version {business.version}</p>
      </div>
    </Screen>
  );
}

export function RewardsScreen() {
  const nav = useNav();
  const app = useApp();
  const [redeem, setRedeem] = useState<string | null>(null);
  const points = app.user && !app.user.guest ? app.user.points : 0;
  const next = rewardTiers.find((tier) => tier.min > points) ?? rewardTiers[rewardTiers.length - 1];
  const prev = [...rewardTiers].reverse().find((tier) => tier.min <= points) ?? rewardTiers[0];
  const span = Math.max(1, next.min - prev.min);
  const progress = next.min === prev.min ? 1 : Math.min(1, (points - prev.min) / span);
  const birthday = app.user?.birthday?.slice(5, 7) === String(new Date().getMonth() + 1).padStart(2, "0");
  const offer = rewardCatalog.find((item) => item.id === redeem);

  return (
    <Screen header={<NavBar title="Rewards" large right={<button type="button" aria-label="Share referral" className="flex h-11 w-11 items-center justify-center" onClick={() => { const text = "Join me at The Village Diner and earn points on breakfast and lunch."; if (navigator.share) void navigator.share({ title: "Village Diner", text, url: business.website }).catch(() => undefined); else { void navigator.clipboard?.writeText(text); app.pushToast("Invite copied"); } }}><SFIcon name="share" /></button>} />}>
      <div className="space-y-6 px-5 pb-8">
        <section className="rounded-[16px] bg-primary p-5 text-white diner-shadow">
          <p className="text-[13px] uppercase tracking-wide text-white/80">{prev.name}</p>
          <p className="display text-[34px]">{points} pts</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/30">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mt-2 text-[15px]">{next.min === prev.min ? prev.perk : `${Math.max(0, next.min - points)} points to ${next.name}`}</p>
        </section>
        <section>
          <h2 className="display text-[22px]">How it works</h2>
          <ol className="mt-3 grid grid-cols-3 gap-2 text-center">
            {["Order", "Earn", "Redeem"].map((label, index) => (
              <li key={label} className="rounded-[16px] bg-surface p-3">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white">{index + 1}</span>
                <span className="mt-2 block text-[15px] font-semibold">{label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[16px] text-muted-foreground">Earn {business.pointsPerDollar} point per $1 on food. This rate is editable before launch.</p>
        </section>
        <section>
          <h2 className="display mb-3 text-[22px]">Available rewards</h2>
          <div className="space-y-3">
            {rewardCatalog.map((reward) => {
              const locked = points < reward.points || !app.user || app.user.guest;
              return (
                <div key={reward.id} className="rounded-[16px] bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[17px] font-semibold">{reward.name}</p>
                      <p className="text-[15px] text-muted-foreground">{reward.detail}</p>
                      <p className="mt-1 text-[13px] font-semibold text-primary">{reward.points} points</p>
                    </div>
                    <button type="button" disabled={locked} onClick={() => setRedeem(reward.id)} className="h-11 rounded-full bg-primary px-4 text-[15px] font-semibold text-white disabled:bg-disabled">Redeem</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <h2 className="display mb-3 text-[22px]">Coupons and promotions</h2>
          {coupons.map((coupon) => (
            <div key={coupon.id} className="mb-3 rounded-[16px] border border-dashed border-primary/40 bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[17px] font-semibold">{coupon.title}</p>
                  <p className="text-[15px] text-muted-foreground">{coupon.detail}</p>
                  <p className="mt-1 text-[13px]">Code {coupon.code} · Expires {coupon.expires}</p>
                </div>
                <button type="button" className="h-11 rounded-full bg-primary px-4 text-[15px] font-semibold text-white" onClick={() => { const result = app.applyPromo(coupon.code); app.pushToast(result.ok ? "Applied at checkout" : "Couldn't apply", result.ok ? coupon.title : result.reason); if (result.ok) nav.goTab("cart"); }}>Apply</button>
              </div>
            </div>
          ))}
        </section>
        <section className={birthday ? "rounded-[16px] bg-primary/10 p-4" : "rounded-[16px] bg-surface p-4"}>
          <Badge tone={birthday ? "red" : "neutral"}>{birthday ? "Unlocked" : "Birthday month"}</Badge>
          <h2 className="display mt-2 text-[22px]">Birthday offer</h2>
          <p className="mt-1 text-[16px] text-muted-foreground">{birthday ? "It's your birthday month. Enjoy a free coffee on your next order — ask the diner to confirm the treat." : "Add your birthday to your profile. The offer unlocks during your birthday month."}</p>
          {birthday ? <div className="mt-3"><PrimaryButton onClick={() => { const result = app.applyReward("coffee"); if (!result.ok && points < 50) { app.pushToast("Birthday coffee", "Show this screen when you pick up. Points reward stays optional."); } else if (result.ok) { app.pushToast("Coffee reward applied"); nav.goTab("cart"); } }}>Use birthday coffee</PrimaryButton></div> : <div className="mt-3"><SecondaryButton onClick={() => nav.push("edit-profile")}>Add birthday</SecondaryButton></div>}
        </section>
        <section>
          <h2 className="display mb-3 text-[22px]">Points history</h2>
          {app.user && !app.user.guest && app.user.pointsHistory.length ? (
            <ul>
              {app.user.pointsHistory.map((row) => (
                <li key={row.id} className="flex items-center justify-between border-b border-divider py-3">
                  <span>
                    <span className="block text-[16px]">{row.label}</span>
                    <span className="text-[13px] text-muted-foreground">{new Date(row.at).toLocaleDateString()}</span>
                  </span>
                  <span className={row.points < 0 ? "font-semibold text-danger" : "font-semibold text-success"}>{row.points > 0 ? "+" : ""}{row.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="gift" title="No points yet" body={app.user?.guest ? "Create an account to keep the points you earn." : "Points land here after your first order."} action={app.user?.guest ? <PrimaryButton onClick={() => nav.push("register")}>Create account</PrimaryButton> : undefined} />
          )}
        </section>
        <section className="rounded-[16px] bg-surface p-4">
          <h2 className="text-[17px] font-semibold">Invite a friend</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">Share The Village Diner. Referral credit can be turned on when the diner sets the rule.</p>
          <div className="mt-3"><SecondaryButton onClick={() => { const text = `Breakfast and lunch at ${business.name}. ${business.website}`; if (navigator.share) void navigator.share({ title: business.name, text, url: business.website }).catch(() => undefined); else app.pushToast("Link copied"); }}>Share</SecondaryButton></div>
        </section>
        <section>
          <h2 className="text-[17px] font-semibold">Tier perks</h2>
          <ul className="mt-2 space-y-2">
            {rewardTiers.map((tier) => (
              <li key={tier.name} className="rounded-[16px] bg-surface px-4 py-3">
                <p className="text-[16px] font-semibold">{tier.name} · {tier.min}+ pts</p>
                <p className="text-[15px] text-muted-foreground">{tier.perk}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Sheet open={!!offer} title="Redeem reward?" onClose={() => setRedeem(null)} footer={offer ? <PrimaryButton onClick={() => { const result = app.applyReward(offer.id); setRedeem(null); if (!result.ok) app.pushToast("Not redeemed", result.reason); else { haptic("success"); app.pushToast("Reward applied", "It will come off an eligible order."); nav.goTab("cart"); } }}>Apply at checkout</PrimaryButton> : undefined}>
        {offer ? <p className="pb-2 text-[16px]">Use {offer.points} points for {offer.name}. {offer.detail}</p> : null}
      </Sheet>
    </Screen>
  );
}

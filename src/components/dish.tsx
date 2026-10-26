import { useState } from "react";
import { displayPrice, getItem, selectionLabel, selectionPrice, defaultSelection, type MenuItem } from "@/data/menu";
import { haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useNav } from "@/app/nav";
import { ActionSheet, Badge, FoodImage } from "./ios";
import { SFIcon } from "./sf";

export function useDishActions() {
  const app = useApp();
  const nav = useNav();

  function open(item: MenuItem, lineId?: string) {
    if (item.builder) nav.push("omelette", lineId ? { lineId } : undefined);
    else nav.push("item", lineId ? { id: item.id, lineId } : { id: item.id });
  }

  function quickAdd(item: MenuItem) {
    if (item.builder || item.orderable === false) {
      open(item);
      return;
    }
    const selection = defaultSelection(item);
    app.addLine({
      itemId: item.id,
      name: item.name,
      image: item.image,
      qty: 1,
      unitPrice: selectionPrice(item, selection),
      optionsLabel: selectionLabel(item, selection),
      instructions: "",
      selection,
    });
    haptic("success");
    app.pushToast("Added to cart", item.name);
  }

  return { open, quickAdd, favorites: app.favorites, toggleFavorite: app.toggleFavorite };
}

export function DishRow({ item }: { item: MenuItem }) {
  const { open, quickAdd, favorites, toggleFavorite } = useDishActions();
  const app = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const loved = favorites.includes(item.id);
  return (
    <>
      <article
        className="flex gap-3 rounded-[16px] bg-surface p-3 diner-shadow"
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuOpen(true);
        }}
      >
        <button type="button" onClick={() => open(item)} className="h-24 w-24 shrink-0 overflow-hidden rounded-[16px]" aria-label={item.name}>
          <FoodImage folder="menu" file={item.image} alt="" className="h-24 w-24" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-2">
            <button type="button" onClick={() => open(item)} className="min-w-0 flex-1 text-left">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[17px] font-semibold leading-tight">{item.name}</span>
                {item.popular ? <Badge>Popular</Badge> : null}
                {item.isNew ? <Badge>New</Badge> : null}
                {item.dineInOnly ? <Badge tone="amber">Dine-in</Badge> : null}
              </span>
              <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-muted-foreground">{item.description}</span>
            </button>
            <button
              type="button"
              aria-label={loved ? `Remove ${item.name} from favorites` : `Save ${item.name}`}
              aria-pressed={loved}
              onClick={() => {
                toggleFavorite(item.id);
                haptic("light");
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center text-primary"
            >
              <SFIcon name={loved ? "heart.fill" : "heart"} size={20} />
            </button>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <p className="text-[16px] font-semibold tabular-nums">{displayPrice(item)}</p>
            <button
              type="button"
              aria-label={item.orderable === false ? `View ${item.name}` : `Add ${item.name}`}
              onClick={() => quickAdd(item)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white active:bg-primary-pressed"
            >
              <SFIcon name="plus" size={18} />
            </button>
          </div>
        </div>
      </article>
      <ActionSheet
        open={menuOpen}
        title={item.name}
        onClose={() => setMenuOpen(false)}
        actions={[
          {
            label: item.orderable === false ? "View details" : "Add to cart",
            onPress: () => {
              setMenuOpen(false);
              quickAdd(item);
            },
          },
          {
            label: loved ? "Remove favorite" : "Save to favorites",
            onPress: () => {
              toggleFavorite(item.id);
              setMenuOpen(false);
            },
          },
          {
            label: "Share",
            onPress: () => {
              setMenuOpen(false);
              const text = `${item.name} — ${displayPrice(item)} at The Village Diner`;
              if (navigator.share) void navigator.share({ title: item.name, text }).catch(() => undefined);
              else {
                void navigator.clipboard?.writeText(text);
                app.pushToast("Copied", item.name);
              }
            },
          },
        ]}
      />
    </>
  );
}

export function FeatureCard({ id }: { id: string }) {
  const item = getItem(id);
  const { open } = useDishActions();
  if (!item) return null;
  return (
    <button type="button" onClick={() => open(item)} className="w-[200px] shrink-0 overflow-hidden rounded-[16px] bg-surface text-left diner-shadow">
      <FoodImage folder="menu" file={item.image} alt="" className="h-[132px] w-full" />
      <span className="block p-3">
        <span className="line-clamp-2 block text-[16px] font-semibold leading-tight">{item.name}</span>
        <span className="mt-1 block text-[15px] font-semibold text-primary tabular-nums">{displayPrice(item)}</span>
      </span>
    </button>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ALLERGEN_DISCLAIMER, CONSUMER_ADVISORY } from "@/data/business";
import {
  TAG_LABEL,
  categories,
  categoryById,
  defaultSelection,
  displayPrice,
  getItem,
  itemsInCategory,
  matchesFilters,
  mealMatch,
  menu,
  omeletteBuilder,
  omelettePrice,
  openFilters,
  selectionLabel,
  selectionPrice,
  type DietTag,
  type MenuFilters,
  type MenuItem,
} from "@/data/menu";
import { formatMoney, haptic } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useNav } from "@/app/nav";
import { DishRow } from "@/components/dish";
import {
  Badge,
  Chip,
  EmptyState,
  ErrorState,
  Field,
  FoodImage,
  NavBar,
  PrimaryButton,
  Screen,
  SearchField,
  SectionTitle,
  Segmented,
  Sheet,
  SkeletonRows,
  Stepper,
  useDelayedReady,
  useOnline,
} from "@/components/ios";
import { SFIcon } from "@/components/sf";

export function MenuScreen() {
  const nav = useNav();
  const online = useOnline();
  const ready = useDelayedReady(650);
  const [meal, setMeal] = useState<"all" | "breakfast" | "lunch" | "kids">("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MenuFilters>(openFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<MenuFilters>(openFilters);
  const focus = nav.menuFocus;

  useEffect(() => {
    if (!focus) return;
    if (focus.meal === "breakfast" || focus.meal === "lunch" || focus.meal === "kids" || focus.meal === "all") {
      setMeal(focus.meal === "all" ? "all" : focus.meal);
    }
    if (focus.q) setQuery(focus.q);
    if (focus.category) {
      window.setTimeout(() => {
        document.getElementById(`cat-${focus.category}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
    nav.clearMenuFocus();
  }, [focus, nav]);

  const visibleCats = categories.filter((category) => {
    if (meal === "all") return true;
    if (meal === "kids") return category.meal === "kids";
    return category.meal === meal || category.meal === "all";
  });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((item) => {
      if (!mealMatch(item, meal)) return false;
      if (!matchesFilters(item, filters)) return false;
      if (!q) return true;
      return `${item.name} ${item.description}`.toLowerCase().includes(q);
    });
  }, [query, meal, filters]);

  const popular = results.filter((item) => item.popular || item.isNew).slice(0, 6);
  const recommended = results.filter((item) => item.tags.includes("vegetarian") || item.popular).slice(0, 4);

  return (
    <Screen
      header={
        <div className="bg-background px-5 pt-[max(8px,env(safe-area-inset-top))]">
          <div className="flex items-end justify-between">
            <h1 className="display text-[34px]">Menu</h1>
            <button type="button" aria-label="Filters" onClick={() => { setDraft(filters); setFilterOpen(true); }} className="flex h-11 w-11 items-center justify-center">
              <SFIcon name="slider" />
            </button>
          </div>
          <div className="mt-2">
            <SearchField value={query} onChange={setQuery} />
          </div>
          <div className="mt-3">
            <Segmented
              ariaLabel="Meal"
              value={meal}
              onChange={setMeal}
              options={[
                { id: "all", label: "All" },
                { id: "breakfast", label: "Breakfast" },
                { id: "lunch", label: "Lunch" },
                { id: "kids", label: "Kids" },
              ]}
            />
          </div>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-3">
            {visibleCats.map((category) => (
              <Chip key={category.id} onClick={() => document.getElementById(`cat-${category.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                {category.name}
              </Chip>
            ))}
          </div>
        </div>
      }
    >
      {!online ? (
        <ErrorState title="No connection" body="The menu needs a connection to refresh. Your cart is still on this phone." onRetry={() => window.location.reload()} />
      ) : !ready ? (
        <div className="pt-2">
          <SkeletonRows />
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon="search" title="Nothing matches" body="Try a different search, or clear the filters to see the full menu." action={<PrimaryButton onClick={() => { setQuery(""); setFilters(openFilters); }}>Clear filters</PrimaryButton>} />
      ) : (
        <div className="space-y-8 px-5 pb-8">
          {query ? (
            <section>
              <SectionTitle>Results</SectionTitle>
              <div className="space-y-3">
                {results.map((item) => (
                  <DishRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : (
            <>
              {popular.length ? (
                <section>
                  <SectionTitle>Popular</SectionTitle>
                  <div className="space-y-3">
                    {popular.map((item) => (
                      <DishRow key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ) : null}
              {recommended.length ? (
                <section>
                  <SectionTitle>Recommended for You</SectionTitle>
                  <div className="space-y-3">
                    {recommended.map((item) => (
                      <DishRow key={`r-${item.id}`} item={item} />
                    ))}
                  </div>
                </section>
              ) : null}
              {visibleCats.map((category) => {
                const items = itemsInCategory(category.id).filter((item) => mealMatch(item, meal) && matchesFilters(item, filters));
                if (!items.length) return null;
                return (
                  <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-4">
                    <div className="relative mb-3 h-28 overflow-hidden rounded-[16px]">
                      <FoodImage folder="menu" file={category.image} alt="" className="absolute inset-0 h-full w-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                        <h2 className="display text-[22px]">{category.name}</h2>
                        <p className="text-[13px] text-white/90">{category.blurb}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <DishRow key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
          <p className="text-[13px] leading-relaxed text-muted-foreground">{CONSUMER_ADVISORY}</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{ALLERGEN_DISCLAIMER}</p>
        </div>
      )}
      <Sheet
        open={filterOpen}
        title="Filters"
        tall
        onClose={() => setFilterOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="h-[52px] rounded-[14px] text-[17px] font-semibold text-primary" onClick={() => setDraft(openFilters)}>
              Reset
            </button>
            <PrimaryButton onClick={() => { setFilters(draft); setFilterOpen(false); }}>Show results</PrimaryButton>
          </div>
        }
      >
        <FilterBody draft={draft} setDraft={setDraft} />
      </Sheet>
    </Screen>
  );
}

function FilterBody({ draft, setDraft }: { draft: MenuFilters; setDraft: (f: MenuFilters) => void }) {
  const diets: DietTag[] = ["vegetarian", "dairy", "eggs", "gluten", "meat"];
  function toggleCat(id: string) {
    setDraft({ ...draft, categories: draft.categories.includes(id) ? draft.categories.filter((c) => c !== id) : [...draft.categories, id] });
  }
  function toggleDiet(id: DietTag) {
    setDraft({ ...draft, diets: draft.diets.includes(id) ? draft.diets.filter((c) => c !== id) : [...draft.diets, id] });
  }
  return (
    <div className="space-y-5 pb-4">
      <div>
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip key={category.id} active={draft.categories.includes(category.id)} onClick={() => toggleCat(category.id)}>
              {category.name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Dietary</p>
        <div className="flex flex-wrap gap-2">
          {diets.map((diet) => (
            <Chip key={diet} active={draft.diets.includes(diet)} onClick={() => toggleDiet(diet)}>
              {TAG_LABEL[diet]}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">Tags are a guide. {ALLERGEN_DISCLAIMER}</p>
      </div>
      <label className="block">
        <span className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Price up to ${draft.maxPrice.toFixed(0)}</span>
        <input
          type="range"
          min={4}
          max={20}
          value={draft.maxPrice}
          onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })}
          className="mt-3 w-full accent-primary"
        />
      </label>
      <label className="flex items-center gap-3 text-[17px]">
        <input type="checkbox" checked={draft.popularOnly} onChange={(event) => setDraft({ ...draft, popularOnly: event.target.checked })} className="h-5 w-5 accent-primary" />
        Popular only
      </label>
    </div>
  );
}

export function ItemScreen() {
  const nav = useNav();
  const app = useApp();
  const id = nav.current.params?.id ?? "";
  const lineId = nav.current.params?.lineId;
  const item = getItem(id);
  const existing = app.cart.find((line) => line.id === lineId);
  const [qty, setQty] = useState(existing?.qty ?? 1);
  const [selection, setSelection] = useState<Record<string, string[]>>(existing?.selection ?? (item ? defaultSelection(item) : {}));
  const [instructions, setInstructions] = useState(existing?.instructions ?? "");
  if (!item) {
    return (
      <Screen header={<NavBar title="Menu" onBack={() => nav.pop()} />}>
        <EmptyState title="Item unavailable" body="That dish isn't on the current menu." action={<PrimaryButton onClick={() => nav.pop()}>Back to menu</PrimaryButton>} />
      </Screen>
    );
  }
  const loved = app.favorites.includes(item.id);
  const unit = selectionPrice(item, selection);
  const pairs = (item.pairs ?? []).map((pair) => getItem(pair)).filter((pair): pair is MenuItem => !!pair);
  const category = categoryById(item.category);

  function choose(groupId: string, choiceId: string, multiple?: boolean) {
    setSelection((prev) => {
      const current = prev[groupId] ?? [];
      if (multiple) {
        const next = current.includes(choiceId) ? current.filter((id) => id !== choiceId) : [...current, choiceId];
        return { ...prev, [groupId]: next };
      }
      return { ...prev, [groupId]: [choiceId] };
    });
  }

  const dish = item;
  function add() {
    if (dish.orderable === false) return;
    const payload = {
      itemId: dish.id,
      name: dish.name,
      image: dish.image,
      qty,
      unitPrice: unit,
      optionsLabel: selectionLabel(dish, selection),
      instructions,
      selection,
    };
    if (lineId) app.updateLine(lineId, payload);
    else app.addLine(payload);
    haptic("success");
    app.pushToast(lineId ? "Cart updated" : "Added to cart", dish.name);
    nav.pop();
  }

  return (
    <Screen
      footer={
        <div className="border-t border-divider bg-background px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {item.orderable === false ? (
            <p className="text-center text-[16px] font-semibold text-muted-foreground">Dine-in only — not available for pickup</p>
          ) : (
            <div className="flex items-center gap-3">
              <Stepper value={qty} onChange={setQty} />
              <PrimaryButton onClick={add}>
                {lineId ? "Update" : "Add to Cart"} – {formatMoney(unit * qty)}
              </PrimaryButton>
            </div>
          )}
        </div>
      }
    >
      <div className="relative">
        <FoodImage folder="menu" file={item.image} alt={item.name} className="h-72 w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute left-3 right-3 top-[max(8px,env(safe-area-inset-top))] flex justify-between">
          <button type="button" aria-label="Close" onClick={() => nav.pop()} className="flex h-11 w-11 items-center justify-center rounded-full bg-background/90">
            <SFIcon name="xmark" />
          </button>
          <button
            type="button"
            aria-label={loved ? "Remove favorite" : "Save favorite"}
            onClick={() => app.toggleFavorite(item.id)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-primary"
          >
            <SFIcon name={loved ? "heart.fill" : "heart"} />
          </button>
        </div>
      </div>
      <div className="space-y-5 px-5 py-5">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {item.popular ? <Badge>Popular</Badge> : null}
            {item.isNew ? <Badge>New</Badge> : null}
            {item.dineInOnly ? <Badge tone="amber">Dine-in only</Badge> : null}
            {category ? <Badge tone="neutral">{category.name}</Badge> : null}
          </div>
          <h1 className="display mt-2 text-[28px]">{item.name}</h1>
          <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{item.description}</p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums">{displayPrice(item)}</p>
          {item.priceNeedsConfirmation ? <p className="mt-1 text-[13px] text-warning">Price pending confirmation ($7.75 shown; $7.25 also appears on the website).</p> : null}
          {item.note ? <p className="mt-2 text-[15px]">{item.note}</p> : null}
        </div>
        {item.tags.length ? (
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Dietary and allergens</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} tone="neutral">{TAG_LABEL[tag]}</Badge>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">{ALLERGEN_DISCLAIMER}</p>
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground">{ALLERGEN_DISCLAIMER}</p>
        )}
        {item.options?.map((group) => (
          <fieldset key={group.id}>
            <legend className="text-[17px] font-semibold">
              {group.name}
              {group.required ? <span className="text-primary"> *</span> : null}
            </legend>
            {group.hint ? <p className="text-[13px] text-muted-foreground">{group.hint}</p> : null}
            <div className="mt-2 space-y-2">
              {group.choices.map((choice) => {
                const selected = (selection[group.id] ?? []).includes(choice.id);
                return (
                  <label key={choice.id} className="flex min-h-11 items-center gap-3 rounded-[14px] bg-surface px-3">
                    <input
                      type={group.multiple ? "checkbox" : "radio"}
                      name={group.id}
                      checked={selected}
                      onChange={() => choose(group.id, choice.id, group.multiple)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="flex-1 text-[16px]">{choice.name}</span>
                    {choice.price ? <span className="text-[15px] text-muted-foreground">+{formatMoney(choice.price)}</span> : null}
                    {choice.replaces != null && choice.replaces !== item.price ? <span className="text-[15px] tabular-nums">{formatMoney(choice.replaces)}</span> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        <Field label="Special instructions" value={instructions} onChange={setInstructions} />
        {pairs.length ? (
          <div>
            <p className="mb-2 text-[17px] font-semibold">Pairs well with</p>
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
              {pairs.map((pair) => (
                <button key={pair.id} type="button" onClick={() => nav.push("item", { id: pair.id })} className="w-28 shrink-0 text-left">
                  <FoodImage folder="menu" file={pair.image} alt="" className="h-20 w-28 rounded-[16px]" />
                  <span className="mt-1 block text-[13px] font-semibold leading-tight">{pair.name}</span>
                  <span className="text-[13px] text-primary">{displayPrice(pair)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}

export function OmeletteScreen() {
  const nav = useNav();
  const app = useApp();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");
  const current = omeletteBuilder.steps[step];
  const price = omelettePrice(selected);
  const last = step === omeletteBuilder.steps.length - 1;

  function toggle(name: string) {
    if (!current) return;
    setSelected((prev) => {
      const list = prev[current.id] ?? [];
      const next = list.includes(name) ? list.filter((item) => item !== name) : [...list, name];
      return { ...prev, [current.id]: next };
    });
  }

  function add() {
    const parts = omeletteBuilder.steps.flatMap((group) => selected[group.id] ?? []);
    app.addLine({
      itemId: "build-your-own-omelette",
      name: "Build Your Own Omelette",
      image: "build-your-own-omelette.jpg",
      qty,
      unitPrice: price,
      optionsLabel: parts.length ? parts.join(", ") : "Plain omelette",
      instructions,
      selection: selected,
    });
    haptic("success");
    app.pushToast("Added to cart", "Build Your Own Omelette");
    nav.pop();
  }

  return (
    <Screen
      header={<NavBar title="Build Your Omelette" onBack={() => (step === 0 ? nav.pop() : setStep((n) => n - 1))} />}
      footer={
        <div className="border-t border-divider bg-background px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="mb-2 flex items-center justify-between text-[16px]">
            <span>Omelette</span>
            <span className="font-semibold tabular-nums">{formatMoney(price)}</span>
          </div>
          {last ? (
            <div className="flex items-center gap-3">
              <Stepper value={qty} onChange={setQty} />
              <PrimaryButton onClick={add}>Add to Cart – {formatMoney(price * qty)}</PrimaryButton>
            </div>
          ) : (
            <PrimaryButton onClick={() => setStep((n) => n + 1)}>Next</PrimaryButton>
          )}
        </div>
      }
    >
      <div className="px-5">
        <div className="mb-4 flex gap-1">
          {omeletteBuilder.steps.map((group, index) => (
            <span key={group.id} className={index <= step ? "h-1 flex-1 rounded-full bg-primary" : "h-1 flex-1 rounded-full bg-divider"} />
          ))}
        </div>
        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Starts at $8.95</p>
        <h1 className="display mt-1 text-[28px]">{current.name}</h1>
        <p className="mt-1 text-[16px] text-muted-foreground">
          {current.price > 0 ? `Add any from this group for ${formatMoney(current.price)}.` : ""} The group price covers every selection in this step.
        </p>
        <div className="mt-4 space-y-2">
          {current.items.map((name) => {
            const on = (selected[current.id] ?? []).includes(name);
            return (
              <button key={name} type="button" onClick={() => toggle(name)} className={on ? "flex min-h-[52px] w-full items-center justify-between rounded-[14px] bg-primary/10 px-4 text-left text-[17px] font-semibold text-primary" : "flex min-h-[52px] w-full items-center justify-between rounded-[14px] bg-surface px-4 text-left text-[17px]"}>
                {name}
                {on ? <SFIcon name="checkmark" size={18} /> : null}
              </button>
            );
          })}
        </div>
        {last ? (
          <div className="mt-5">
            <Field label="Special instructions" value={instructions} onChange={setInstructions} />
            <ul className="mt-4 space-y-1 text-[15px] text-muted-foreground">
              <li>Omelette {formatMoney(omeletteBuilder.base)}</li>
              {omeletteBuilder.steps.map((group) =>
                (selected[group.id] ?? []).length ? (
                  <li key={group.id}>
                    {group.name} {formatMoney(group.price)} — {(selected[group.id] ?? []).join(", ")}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}

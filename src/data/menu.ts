/**
 * Full Village Diner menu, taken from the published menu.
 * Edit prices, tags, and options here. Screens read this file only.
 *
 * Shortstack Buttermilk Pancakes is listed as $7.75. The website also shows
 * $7.25 in one listing — see priceNeedsConfirmation.
 */

export type Meal = "breakfast" | "lunch" | "kids" | "all";

export type DietTag = "vegetarian" | "dairy" | "eggs" | "gluten" | "meat";

export type Choice = {
  id: string;
  name: string;
  /** Added on top of the item price. */
  price?: number;
  /** Replaces the item price when selected. */
  replaces?: number;
};

export type OptionGroup = {
  id: string;
  name: string;
  required?: boolean;
  multiple?: boolean;
  hint?: string;
  choices: Choice[];
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  meal: Meal;
  description: string;
  price: number;
  priceMax?: number;
  image: string;
  tags: DietTag[];
  popular?: boolean;
  isNew?: boolean;
  /** Early Bird is dine-in information only. */
  orderable?: boolean;
  dineInOnly?: boolean;
  priceNeedsConfirmation?: boolean;
  note?: string;
  builder?: boolean;
  options?: OptionGroup[];
  pairs?: string[];
};

export const TAG_LABEL: Record<DietTag, string> = {
  vegetarian: "Vegetarian",
  dairy: "Contains Dairy",
  eggs: "Contains Eggs",
  gluten: "Contains Gluten",
  meat: "Contains Meat",
};

export type Category = {
  id: string;
  name: string;
  meal: Meal;
  blurb: string;
  image: string;
};

export const categories: Category[] = [
  { id: "breakfast-mains", name: "Breakfast Mains", meal: "breakfast", blurb: "Eggs, pancakes, French toast, and waffles.", image: "cat-breakfast-mains.jpg" },
  { id: "breakfast-specials", name: "Breakfast Specials", meal: "breakfast", blurb: "House plates served through the morning.", image: "cat-breakfast-specials.jpg" },
  { id: "omelettes", name: "Omelettes", meal: "breakfast", blurb: "House omelettes, and a build-your-own starting at $8.95.", image: "cat-omelettes.jpg" },
  { id: "breakfast-sides", name: "Breakfast Sides", meal: "breakfast", blurb: "Homefries, meats, toast, and more.", image: "cat-breakfast-sides.jpg" },
  { id: "kids-breakfast", name: "Kid's Breakfast", meal: "kids", blurb: "12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.", image: "cat-kids-breakfast.jpg" },
  { id: "starters", name: "Starters", meal: "lunch", blurb: "Soup, fries, and shareables.", image: "cat-starters.jpg" },
  { id: "village-specials", name: "Village Specials", meal: "lunch", blurb: "Diner classics for lunch.", image: "cat-village-specials.jpg" },
  { id: "burgers", name: "Burgers", meal: "lunch", blurb: "Grilled burgers.", image: "cat-burgers.jpg" },
  { id: "sandwiches", name: "Sandwiches", meal: "lunch", blurb: "Clubs, melts, and classics.", image: "cat-sandwiches.jpg" },
  { id: "steak-sandwiches", name: "Steak Sandwiches", meal: "lunch", blurb: "Steaks and chicken steaks.", image: "cat-steak-sandwiches.jpg" },
  { id: "kids-lunch", name: "Kid's Lunch", meal: "kids", blurb: "12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.", image: "cat-kids-lunch.jpg" },
  { id: "wraps", name: "Wraps", meal: "lunch", blurb: "Warm tortillas, packed for lunch.", image: "cat-wraps.jpg" },
  { id: "drinks", name: "Drinks", meal: "all", blurb: "Coffee, tea, juice, and fountain drinks.", image: "cat-drinks.jpg" },
];

/** Home screen chips, in the order guests expect. */
export const homeChips: { id: string; label: string; category?: string; meal?: Meal }[] = [
  { id: "breakfast-mains", label: "Breakfast Mains", category: "breakfast-mains" },
  { id: "breakfast-specials", label: "Breakfast Specials", category: "breakfast-specials" },
  { id: "omelettes", label: "Omelettes", category: "omelettes" },
  { id: "village-specials", label: "Village Specials", category: "village-specials" },
  { id: "burgers", label: "Burgers", category: "burgers" },
  { id: "sandwiches", label: "Sandwiches", category: "sandwiches" },
  { id: "steak-sandwiches", label: "Steak Sandwiches", category: "steak-sandwiches" },
  { id: "wraps", label: "Wraps", category: "wraps" },
  { id: "kids", label: "Kid's", meal: "kids" },
  { id: "drinks", label: "Drinks", category: "drinks" },
  { id: "starters", label: "Starters", category: "starters" },
];

function slug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function opts(names: string[], prices?: Array<number | undefined>, replaces?: Array<number | undefined>): Choice[] {
  return names.map((name, i) => {
    const choice: Choice = { id: slug(name), name };
    if (prices?.[i]) choice.price = prices[i];
    if (replaces?.[i] != null) choice.replaces = replaces[i];
    return choice;
  });
}

function group(
  id: string,
  name: string,
  names: string[],
  extra?: { required?: boolean; multiple?: boolean; hint?: string; prices?: Array<number | undefined>; replaces?: Array<number | undefined> },
): OptionGroup {
  return {
    id,
    name,
    required: extra?.required,
    multiple: extra?.multiple,
    hint: extra?.hint,
    choices: opts(names, extra?.prices, extra?.replaces),
  };
}

const eggStyle = group("egg-style", "Egg style", ["Scrambled", "Sunny side up", "Over easy", "Over medium", "Over hard", "Poached"], { required: true });
const toast = group("toast", "Choice of toast", ["White", "Wheat", "Rye", "Sourdough"], { required: true });
const bread = group("bread", "Choice of bread", ["White", "Wheat", "Rye", "Sourdough"], { required: true });
const breakfastMeat = group("breakfast-meat", "Breakfast meat", ["Bacon", "Sausage", "Pork roll", "Ham", "Turkey sausage"], { required: true });
const cheese = group("cheese", "Cheese", ["American", "Swiss", "Provolone", "Cheddar", "Mozzarella"], { required: true });
const side = group("side", "Side", ["Homefries", "Grits", "Sliced tomatoes"], { required: true });
const coffeeOrTea = group("drink", "Included drink", ["Coffee", "Tea"], { required: true, hint: "Included. No substitutions." });
const kidDrink = group("kid-drink", "Included drink", ["Milk", "Chocolate milk", "Juice", "Fountain drink"], { required: true, hint: "Included with the kids' meal." });
const kidSide = group("kid-side", "Side", ["French fries", "Apple sauce"], { required: true });
const baconOrSausage = group("meat", "Side", ["Two slices of bacon", "One sausage link"], { required: true });
const sauceNamed = (names: string[], required = true) => group("sauce", "Sauce", names, { required });
const breakfastPairs = ["coffee", "juice", "homefries-or-grits"];
const lunchPairs = ["fountain-drinks", "french-fries", "iced-tea"];

const twoEggPlate: OptionGroup = {
  id: "plate",
  name: "How would you like it",
  required: true,
  choices: [
    { id: "full", name: "Two eggs, side, and toast", replaces: 7.25 },
    { id: "toast-only", name: "With only toast", replaces: 5.95 },
    { id: "one-side", name: "One egg with homefries and toast", replaces: 5.25 },
    { id: "one-toast", name: "One egg and toast", replaces: 3.95 },
  ],
};

function item(entry: MenuItem): MenuItem {
  return { orderable: true, ...entry };
}

export const menu: MenuItem[] = [
  item({
    id: "two-eggs",
    name: "Two Eggs",
    category: "breakfast-mains",
    meal: "breakfast",
    description: "Any style served with homefries, grits or sliced tomatoes and your choice of toast.",
    price: 7.25,
    priceMax: 7.25,
    image: "two-eggs.jpg",
    tags: ["vegetarian", "eggs", "gluten"],
    popular: true,
    options: [twoEggPlate, eggStyle, side, toast],
    pairs: breakfastPairs,
  }),
  item({
    id: "shortstack-pancakes",
    name: "Shortstack Buttermilk Pancakes",
    category: "breakfast-mains",
    meal: "breakfast",
    description: "Two pancakes served with butter.",
    price: 7.75,
    image: "shortstack-pancakes.jpg",
    tags: ["vegetarian", "eggs", "gluten", "dairy"],
    popular: true,
    priceNeedsConfirmation: true,
    note: "Listed at $7.75. The website also shows $7.25 in one listing — confirm before printing.",
    options: [
      group("add-in", "Add-in", ["Butter only", "Blueberries", "Chocolate chips"], {
        required: true,
        prices: [undefined, 2.75, 2.75],
      }),
    ],
    pairs: breakfastPairs,
  }),
  item({
    id: "texas-french-toast",
    name: "Texas French Toast",
    category: "breakfast-mains",
    meal: "breakfast",
    description: "Two slices served with butter and topped with powdered sugar.",
    price: 8.25,
    image: "texas-french-toast.jpg",
    tags: ["vegetarian", "eggs", "gluten", "dairy"],
    popular: true,
    pairs: breakfastPairs,
  }),
  item({
    id: "belgian-waffle",
    name: "Belgian Waffle",
    category: "breakfast-mains",
    meal: "breakfast",
    description: "Served with butter, powdered sugar and whipped cream (upon request).",
    price: 8.5,
    image: "belgian-waffle.jpg",
    tags: ["vegetarian", "eggs", "gluten", "dairy"],
    options: [group("whip", "Whipped cream", ["Upon request", "No whipped cream"], { required: true })],
    pairs: breakfastPairs,
  }),
  item({
    id: "jumbo-breakfast-sandwich",
    name: "Jumbo Breakfast Sandwich",
    category: "breakfast-mains",
    meal: "breakfast",
    description: "Two eggs (any style) with cheese and your choice of breakfast meat.",
    price: 8.5,
    image: "jumbo-breakfast-sandwich.jpg",
    tags: ["eggs", "gluten", "dairy", "meat"],
    options: [eggStyle, cheese, breakfastMeat],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "breakfast-wrap",
    name: "Breakfast Wrap",
    category: "breakfast-mains",
    meal: "breakfast",
    description: "Two scrambled eggs with cheese and your choice of bacon, sausage, pork roll, ham or turkey sausage in a warm tortilla.",
    price: 8.25,
    image: "breakfast-wrap.jpg",
    tags: ["eggs", "gluten", "dairy", "meat"],
    options: [cheese, breakfastMeat],
    pairs: ["coffee", "homefries-or-grits"],
  }),

  item({
    id: "village-sampler",
    name: "The Village Sampler",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Two eggs (any style), two pancakes or two slices of French toast, two strips of bacon, two sausage links, homefries and toast (no substitutions).",
    price: 13.5,
    image: "village-sampler.jpg",
    tags: ["eggs", "gluten", "dairy", "meat"],
    popular: true,
    note: "No substitutions.",
    options: [
      eggStyle,
      group("griddle", "Griddle side", ["Two pancakes", "Two slices of French toast"], { required: true }),
    ],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "biscuits-and-gravy",
    name: "Biscuits And Gravy",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Two buttermilk biscuits topped with homemade sausage gravy.",
    price: 11.5,
    image: "biscuits-and-gravy.jpg",
    tags: ["gluten", "dairy", "meat"],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "creamed-chipped-beef",
    name: "Homemade Creamed Chipped Beef",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Made fresh daily and served over toast.",
    price: 11.5,
    image: "creamed-chipped-beef.jpg",
    tags: ["dairy", "gluten", "meat"],
    popular: true,
    options: [toast],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "village-breakfast-scramble",
    name: "Village Breakfast Scramble",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Two scrambled eggs with onions and peppers and your choice of bacon, sausage, pork roll, ham or turkey sausage, topped with cheese over homefries with toast.",
    price: 11.5,
    image: "village-breakfast-scramble.jpg",
    tags: ["eggs", "dairy", "gluten", "meat"],
    options: [breakfastMeat, cheese, toast],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "corned-beef-hash",
    name: "Corned Beef Hash",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Topped with two eggs (any style) and served with toast.",
    price: 10.95,
    image: "corned-beef-hash.jpg",
    tags: ["eggs", "gluten", "meat"],
    options: [eggStyle, toast],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "specialty-pancakes",
    name: "Specialty Pancakes",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Ask your server about our pancakes of the day.",
    price: 11.25,
    image: "specialty-pancakes.jpg",
    tags: ["vegetarian", "eggs", "gluten", "dairy"],
    note: "Pancake of the day. The kitchen's flavor is confirmed when you pick up.",
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "the-classic",
    name: "The Classic",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Pork roll, egg and cheese on a kaiser roll with coffee or tea (no substitutions).",
    price: 7.5,
    image: "the-classic.jpg",
    tags: ["eggs", "dairy", "gluten", "meat"],
    note: "No substitutions.",
    options: [eggStyle, coffeeOrTea],
    pairs: ["homefries-or-grits"],
  }),
  item({
    id: "the-mojo",
    name: "The Mojo",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Bacon, egg and cheese on a bagel with coffee or tea (no substitutions).",
    price: 7.5,
    image: "the-mojo.jpg",
    tags: ["eggs", "dairy", "gluten", "meat"],
    note: "No substitutions.",
    options: [eggStyle, coffeeOrTea],
    pairs: ["homefries-or-grits"],
  }),
  item({
    id: "stuffed-homefries",
    name: "Stuffed Homefries",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Homefries topped with peppers, onions, mushrooms, bacon and cheddar cheese.",
    price: 10.25,
    image: "stuffed-homefries.jpg",
    tags: ["dairy", "meat"],
    pairs: ["coffee", "two-eggs"],
  }),
  item({
    id: "early-bird",
    name: "Early Bird Special",
    category: "breakfast-specials",
    meal: "breakfast",
    description: "Two eggs (any style) with homefries, toast and coffee or tea. Mon–Fri 8:00–9:00 AM. Dine in only.",
    price: 6.75,
    image: "early-bird.jpg",
    tags: ["eggs", "gluten"],
    orderable: false,
    dineInOnly: true,
    note: "Dine-in only. Not available for pickup or delivery.",
  }),

  item({
    id: "veggie-omelette",
    name: "Veggie Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Tomatoes, onions, peppers, mushroom, spinach and cheese.",
    price: 12.25,
    image: "veggie-omelette.jpg",
    tags: ["vegetarian", "eggs", "dairy"],
    options: [cheese],
    pairs: breakfastPairs,
  }),
  item({
    id: "denver-omelette",
    name: "Denver Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Ham, peppers, onions and cheese.",
    price: 12.5,
    image: "denver-omelette.jpg",
    tags: ["eggs", "dairy", "meat"],
    options: [cheese],
    pairs: breakfastPairs,
  }),
  item({
    id: "chicken-fajita-omelette",
    name: "Chicken Fajita Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Shredded chicken, peppers, onions and cheddar cheese with sour cream and salsa.",
    price: 12.5,
    image: "chicken-fajita-omelette.jpg",
    tags: ["eggs", "dairy", "meat"],
    pairs: breakfastPairs,
  }),
  item({
    id: "italian-omelette",
    name: "Italian Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Sausage, peppers, onions and mozzarella topped with marinara.",
    price: 12.5,
    image: "italian-omelette.jpg",
    tags: ["eggs", "dairy", "meat"],
    pairs: breakfastPairs,
  }),
  item({
    id: "meatlovers-omelette",
    name: "Meatlovers Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Ham, bacon and sausage.",
    price: 12.5,
    image: "meatlovers-omelette.jpg",
    tags: ["eggs", "meat"],
    pairs: breakfastPairs,
  }),
  item({
    id: "potato-cheese-onion-omelette",
    name: "Potato, Cheese And Onion",
    category: "omelettes",
    meal: "breakfast",
    description: "Potatoes, onions and cheese.",
    price: 12.25,
    image: "potato-cheese-onion-omelette.jpg",
    tags: ["vegetarian", "eggs", "dairy"],
    options: [cheese],
    pairs: breakfastPairs,
  }),
  item({
    id: "cheesesteak-omelette",
    name: "Cheesesteak Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Steak meat, onions and cheese.",
    price: 12.5,
    image: "cheesesteak-omelette.jpg",
    tags: ["eggs", "dairy", "meat"],
    options: [cheese],
    pairs: breakfastPairs,
  }),
  item({
    id: "build-your-own-omelette",
    name: "Build Your Own Omelette",
    category: "omelettes",
    meal: "breakfast",
    description: "Start at $8.95, then add cheese, veggies, meat, and extras.",
    price: 8.95,
    image: "build-your-own-omelette.jpg",
    tags: ["eggs"],
    builder: true,
    pairs: breakfastPairs,
  }),

  item({
    id: "homefries-or-grits",
    name: "Homefries Or Grits",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "A side of homefries or grits.",
    price: 4.95,
    image: "homefries-or-grits.jpg",
    tags: ["vegetarian"],
    popular: true,
    options: [group("style", "Choice", ["Homefries", "Grits"], { required: true })],
    pairs: ["coffee", "two-eggs"],
  }),
  item({
    id: "breakfast-meat",
    name: "Breakfast Meat",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "Bacon, sausage, pork roll, ham, scrapple or turkey sausage.",
    price: 4.99,
    image: "breakfast-meat.jpg",
    tags: ["meat"],
    options: [group("meat", "Choice", ["Bacon", "Sausage", "Pork roll", "Ham", "Scrapple", "Turkey sausage"], { required: true })],
    pairs: ["two-eggs", "coffee"],
  }),
  item({
    id: "oatmeal",
    name: "Oatmeal",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "With brown sugar and raisins.",
    price: 4.25,
    priceMax: 5.5,
    image: "oatmeal.jpg",
    tags: ["vegetarian", "gluten"],
    options: [group("size", "Size", ["Small", "Large"], { required: true, replaces: [4.25, 5.5] })],
    pairs: ["coffee", "juice"],
  }),
  item({
    id: "side-corned-beef-hash",
    name: "Side Corned Beef Hash",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "No toast.",
    price: 6.95,
    image: "side-corned-beef-hash.jpg",
    tags: ["meat"],
    pairs: ["two-eggs", "toast"],
  }),
  item({
    id: "one-french-toast",
    name: "One French Toast",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "A single slice of French toast.",
    price: 4.75,
    image: "one-french-toast.jpg",
    tags: ["vegetarian", "eggs", "gluten", "dairy"],
    pairs: ["coffee", "breakfast-meat"],
  }),
  item({
    id: "side-creamed-chipped-beef",
    name: "Side Creamed Chipped Beef",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "No toast.",
    price: 7.5,
    priceMax: 9.25,
    image: "side-creamed-chipped-beef.jpg",
    tags: ["dairy", "meat"],
    note: "Small and large follow the published $7.50–$9.25 range.",
    options: [group("size", "Size", ["Small", "Large"], { required: true, replaces: [7.5, 9.25] })],
    pairs: ["toast", "coffee"],
  }),
  item({
    id: "side-sausage-gravy",
    name: "Side Sausage Gravy",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "No biscuit.",
    price: 7.5,
    priceMax: 9.25,
    image: "side-sausage-gravy.jpg",
    tags: ["dairy", "meat"],
    note: "Small and large follow the published $7.50–$9.25 range.",
    options: [group("size", "Size", ["Small", "Large"], { required: true, replaces: [7.5, 9.25] })],
    pairs: ["biscuits-and-gravy", "coffee"],
  }),
  item({
    id: "bagel-cream-cheese",
    name: "Bagel With Cream Cheese",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "With cream cheese, or with butter.",
    price: 4.5,
    image: "bagel-cream-cheese.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    options: [group("spread", "Spread", ["With cream cheese", "With butter"], { required: true, replaces: [4.5, 4.25] })],
    pairs: ["coffee", "breakfast-meat"],
  }),
  item({
    id: "cinnamon-buns",
    name: "Cinnamon Buns",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "A warm cinnamon bun.",
    price: 4.75,
    image: "cinnamon-buns.jpg",
    tags: ["vegetarian", "gluten", "dairy"],
    pairs: ["coffee"],
  }),
  item({
    id: "muffins",
    name: "Muffins",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "A fresh muffin.",
    price: 4.5,
    image: "muffins.jpg",
    tags: ["vegetarian", "gluten", "eggs", "dairy"],
    pairs: ["coffee"],
  }),
  item({
    id: "english-muffin",
    name: "English Muffin",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "A toasted English muffin.",
    price: 2.99,
    image: "english-muffin.jpg",
    tags: ["vegetarian", "gluten"],
    pairs: ["coffee", "side-one-egg"],
  }),
  item({
    id: "side-one-egg",
    name: "Side One Egg",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "One egg, any style.",
    price: 2.25,
    image: "side-one-egg.jpg",
    tags: ["vegetarian", "eggs"],
    options: [eggStyle],
    pairs: ["toast", "homefries-or-grits"],
  }),
  item({
    id: "side-two-eggs",
    name: "Side Two Eggs",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "Two eggs, any style.",
    price: 4.5,
    image: "side-two-eggs.jpg",
    tags: ["vegetarian", "eggs"],
    options: [eggStyle],
    pairs: ["toast", "homefries-or-grits"],
  }),
  item({
    id: "fruit-cup",
    name: "Fruit Cup (Seasonal)",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "Seasonal fruit cup.",
    price: 5.25,
    image: "fruit-cup.jpg",
    tags: ["vegetarian"],
    pairs: ["oatmeal", "coffee"],
  }),
  item({
    id: "toast",
    name: "Toast",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "Your choice of toast.",
    price: 2.75,
    image: "toast.jpg",
    tags: ["vegetarian", "gluten"],
    options: [toast],
    pairs: ["side-two-eggs", "coffee"],
  }),
  item({
    id: "apple-sauce",
    name: "Apple Sauce",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "A side of apple sauce.",
    price: 2.95,
    image: "apple-sauce.jpg",
    tags: ["vegetarian"],
    pairs: ["grilled-hot-dog"],
  }),
  item({
    id: "sliced-tomatoes",
    name: "Side Sliced Tomatoes",
    category: "breakfast-sides",
    meal: "breakfast",
    description: "Sliced tomatoes.",
    price: 2.25,
    image: "sliced-tomatoes.jpg",
    tags: ["vegetarian"],
    pairs: ["two-eggs"],
  }),

  item({
    id: "joey-special",
    name: "Joey Special",
    category: "kids-breakfast",
    meal: "kids",
    description: "One egg (any style) with homefries and toast. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 7.25,
    image: "joey-special.jpg",
    tags: ["eggs", "gluten"],
    options: [eggStyle, toast, kidDrink],
    pairs: ["apple-sauce"],
  }),
  item({
    id: "frankie-special",
    name: "Frankie Special",
    category: "kids-breakfast",
    meal: "kids",
    description: "Two small pancakes with two slices of bacon or one sausage link. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 7.25,
    image: "frankie-special.jpg",
    tags: ["eggs", "gluten", "dairy", "meat"],
    options: [baconOrSausage, kidDrink],
    pairs: ["apple-sauce"],
  }),
  item({
    id: "amanda-special",
    name: "Amanda Special",
    category: "kids-breakfast",
    meal: "kids",
    description: "One slice of Texas French toast with two slices of bacon or one sausage link. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 8.95,
    image: "amanda-special.jpg",
    tags: ["eggs", "gluten", "dairy", "meat"],
    options: [baconOrSausage, kidDrink],
    pairs: ["apple-sauce"],
  }),
  item({
    id: "danny-special",
    name: "Danny Special",
    category: "kids-breakfast",
    meal: "kids",
    description: "Belgian waffle with butter, powdered sugar and whipped cream (upon request). 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 8.95,
    image: "danny-special.jpg",
    tags: ["vegetarian", "eggs", "gluten", "dairy"],
    options: [group("whip", "Whipped cream", ["Upon request", "No whipped cream"], { required: true }), kidDrink],
    pairs: ["apple-sauce"],
  }),
  item({
    id: "matthew-special",
    name: "Matthew Special",
    category: "kids-breakfast",
    meal: "kids",
    description: "Mini Sampler with one egg (any style), homefries, toast, one small pancake and two slices of bacon. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 9.95,
    image: "matthew-special.jpg",
    tags: ["eggs", "gluten", "dairy", "meat"],
    options: [eggStyle, toast, kidDrink],
    pairs: ["apple-sauce"],
  }),

  item({
    id: "soup-of-the-day",
    name: "Soup Of The Day",
    category: "starters",
    meal: "lunch",
    description: "Cup or bowl. Ask the diner which soup is on today.",
    price: 4.75,
    priceMax: 6.25,
    image: "soup-of-the-day.jpg",
    tags: [],
    note: "Ingredients change daily. Confirm allergens with staff.",
    options: [group("size", "Size", ["Cup", "Bowl"], { required: true, replaces: [4.75, 6.25] })],
    pairs: ["grilled-cheese", "fountain-drinks"],
  }),
  item({
    id: "mozzarella-stix",
    name: "Mozzarella Stix",
    category: "starters",
    meal: "lunch",
    description: "Fried mozzarella sticks.",
    price: 6.95,
    image: "mozzarella-stix.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "onion-rings",
    name: "Onion Rings",
    category: "starters",
    meal: "lunch",
    description: "A basket of onion rings.",
    price: 6.95,
    image: "onion-rings.jpg",
    tags: ["vegetarian", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "chicken-tenders",
    name: "Basket Of Chicken Tenders",
    category: "starters",
    meal: "lunch",
    description: "A basket of chicken tenders.",
    price: 8.95,
    image: "chicken-tenders.jpg",
    tags: ["meat", "gluten"],
    options: [sauceNamed(["Honey mustard", "Ranch", "BBQ"])],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "chicken-quesadilla",
    name: "Chicken And Cheese Quesadilla",
    category: "starters",
    meal: "lunch",
    description: "Grilled chicken, peppers, onions and cheddar cheese.",
    price: 12.25,
    image: "chicken-quesadilla.jpg",
    tags: ["meat", "dairy", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "french-fries",
    name: "French Fries",
    category: "starters",
    meal: "lunch",
    description: "A side of French fries.",
    price: 5.75,
    image: "french-fries.jpg",
    tags: ["vegetarian"],
    pairs: ["cheese-burger", "fountain-drinks"],
  }),
  item({
    id: "village-fries",
    name: "Village Fries",
    category: "starters",
    meal: "lunch",
    description: "Fries topped with mozzarella, cheddar, bacon, served with ranch.",
    price: 10.25,
    image: "village-fries.jpg",
    tags: ["dairy", "meat"],
    pairs: ["fountain-drinks"],
  }),

  item({
    id: "grilled-reuben",
    name: "Grilled Reuben",
    category: "village-specials",
    meal: "lunch",
    description: "Lean corned beef or roasted turkey on grilled rye with Swiss, sauerkraut and Russian dressing.",
    price: 12.25,
    image: "grilled-reuben.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [group("meat", "Meat", ["Lean corned beef", "Roasted turkey"], { required: true })],
    pairs: lunchPairs,
  }),
  item({
    id: "tuna-melt",
    name: "Tuna Melt",
    category: "village-specials",
    meal: "lunch",
    description: "White tuna with celery and mayo, tomato and American cheese on a toasted English muffin.",
    price: 12.25,
    image: "tuna-melt.jpg",
    tags: ["dairy", "eggs", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "corned-beef-special",
    name: "Corned Beef Special",
    category: "village-specials",
    meal: "lunch",
    description: "Thinly sliced corned beef on rye with cole slaw and Russian dressing.",
    price: 12.25,
    image: "corned-beef-special.jpg",
    tags: ["meat", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "chicken-parm-sandwich",
    name: "Chicken Parm Sandwich",
    category: "village-specials",
    meal: "lunch",
    description: "Chicken tenders with homemade marinara and mozzarella on a hoagie roll.",
    price: 12.25,
    image: "chicken-parm-sandwich.jpg",
    tags: ["meat", "dairy", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "patty-melt",
    name: "Patty Melt",
    category: "village-specials",
    meal: "lunch",
    description: "Made-to-order Black Angus burger with fried onions and your choice of cheese on grilled rye.",
    price: 12.25,
    image: "patty-melt.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "chicken-salad-plate",
    name: "Crispy or Grilled Chicken Salad",
    category: "village-specials",
    meal: "lunch",
    description: "Lettuce, garden vegetables, homemade croutons, shredded mozzarella, choice of dressing (no French fries).",
    price: 11.95,
    image: "chicken-salad-plate.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [
      group("style", "Chicken", ["Crispy", "Grilled"], { required: true }),
      group("dressing", "Dressing", ["Ranch", "Honey mustard", "Russian", "Caesar"], { required: true }),
    ],
    pairs: ["iced-tea", "fountain-drinks"],
  }),
  item({
    id: "chicken-tender-platter",
    name: "Chicken Tender Platter",
    category: "village-specials",
    meal: "lunch",
    description: "Fried chicken tenders over French fries with cole slaw and honey mustard, ranch or BBQ.",
    price: 12.25,
    image: "chicken-tender-platter.jpg",
    tags: ["meat", "gluten"],
    popular: true,
    options: [sauceNamed(["Honey mustard", "Ranch", "BBQ"])],
    pairs: ["fountain-drinks", "iced-tea"],
  }),
  item({
    id: "caesar-salad",
    name: "Caesar Salad",
    category: "village-specials",
    meal: "lunch",
    description: "Romaine, shaved parmesan, homemade croutons and Caesar dressing. Add chicken.",
    price: 8.5,
    image: "caesar-salad.jpg",
    tags: ["vegetarian", "dairy", "gluten", "eggs"],
    options: [
      group("chicken", "Chicken", ["No chicken", "Add chicken"], { required: true, prices: [undefined, 3.75] }),
    ],
    pairs: ["iced-tea", "fountain-drinks"],
  }),

  item({
    id: "burger",
    name: "Burger",
    category: "burgers",
    meal: "lunch",
    description: "Grilled burger.",
    price: 9.25,
    image: "burger.jpg",
    tags: ["meat", "gluten"],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "cheese-burger",
    name: "Cheese Burger",
    category: "burgers",
    meal: "lunch",
    description: "Grilled burger with cheese.",
    price: 10.25,
    image: "cheese-burger.jpg",
    tags: ["meat", "dairy", "gluten"],
    popular: true,
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "bacon-cheese-burger",
    name: "Bacon Cheese Burger",
    category: "burgers",
    meal: "lunch",
    description: "Grilled burger with bacon and cheese.",
    price: 11.75,
    image: "bacon-cheese-burger.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),

  item({
    id: "triple-decker-club",
    name: "Triple Decker Club",
    category: "sandwiches",
    meal: "lunch",
    description: "Freshly sliced meat, lettuce, tomato and bacon with honey mustard, ranch or mayo.",
    price: 11.25,
    image: "triple-decker-club.jpg",
    tags: ["meat", "gluten", "eggs"],
    options: [sauceNamed(["Honey mustard", "Ranch", "Mayo"]), bread],
    pairs: lunchPairs,
  }),
  item({
    id: "grilled-chicken-sandwich",
    name: "Grilled Chicken Sandwich",
    category: "sandwiches",
    meal: "lunch",
    description: "Lettuce and tomato on a kaiser roll.",
    price: 11.75,
    image: "grilled-chicken-sandwich.jpg",
    tags: ["meat", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "blt",
    name: "B.L.T.",
    category: "sandwiches",
    meal: "lunch",
    description: "Bacon, lettuce and tomato on your choice of toast.",
    price: 9.25,
    image: "blt.jpg",
    tags: ["meat", "gluten"],
    options: [toast],
    pairs: lunchPairs,
  }),
  item({
    id: "grilled-cheese",
    name: "Grilled Cheese",
    category: "sandwiches",
    meal: "lunch",
    description: "Your choice of bread.",
    price: 8,
    image: "grilled-cheese.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    options: [bread, cheese],
    pairs: ["soup-of-the-day", "fountain-drinks"],
  }),
  item({
    id: "chicken-or-tuna-salad",
    name: "Chicken Salad or Tuna Salad",
    category: "sandwiches",
    meal: "lunch",
    description: "Chicken salad or tuna salad.",
    price: 9.95,
    image: "chicken-or-tuna-salad.jpg",
    tags: ["eggs", "gluten"],
    options: [group("salad", "Salad", ["Chicken salad", "Tuna salad"], { required: true }), bread],
    pairs: lunchPairs,
  }),
  item({
    id: "roasted-turkey",
    name: "Roasted Turkey",
    category: "sandwiches",
    meal: "lunch",
    description: "Freshly sliced roasted turkey, lettuce and tomato on your choice of toast.",
    price: 10.25,
    image: "roasted-turkey.jpg",
    tags: ["meat", "gluten"],
    options: [toast],
    pairs: lunchPairs,
  }),
  item({
    id: "grilled-veggie-sandwich",
    name: "Grilled Veggie Sandwich",
    category: "sandwiches",
    meal: "lunch",
    description: "Tomatoes, mushrooms, peppers, onions, spinach on a long roll with lettuce and your choice of cheese.",
    price: 10.5,
    image: "grilled-veggie-sandwich.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    options: [cheese],
    pairs: lunchPairs,
  }),
  item({
    id: "healthy-platter",
    name: "Healthy Platter",
    category: "sandwiches",
    meal: "lunch",
    description: "Tuna or chicken salad on lettuce with tomatoes and a side of cole slaw.",
    price: 10.25,
    image: "healthy-platter.jpg",
    tags: ["eggs"],
    options: [group("salad", "Salad", ["Tuna salad", "Chicken salad"], { required: true })],
    pairs: ["iced-tea"],
  }),
  item({
    id: "half-sandwich-soup",
    name: "1/2 Sandwich & Cup of Soup",
    category: "sandwiches",
    meal: "lunch",
    description: "B.L.T., Grilled Cheese, Chicken Salad or Tuna Salad with a cup of soup (no potato chips).",
    price: 9.25,
    image: "half-sandwich-soup.jpg",
    tags: ["gluten"],
    note: "No potato chips. Soup of the day — confirm allergens with staff.",
    options: [group("sandwich", "Half sandwich", ["B.L.T.", "Grilled Cheese", "Chicken Salad", "Tuna Salad"], { required: true })],
    pairs: ["fountain-drinks", "iced-tea"],
  }),
  item({
    id: "texas-tommy",
    name: "Texas Tommy",
    category: "sandwiches",
    meal: "lunch",
    description: "Grilled hot dog with bacon and cheese.",
    price: 8.75,
    image: "texas-tommy.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "grilled-hot-dog",
    name: "Grilled Hot Dog",
    category: "sandwiches",
    meal: "lunch",
    description: "Grilled hot dog.",
    price: 5.75,
    image: "grilled-hot-dog.jpg",
    tags: ["meat", "gluten"],
    pairs: ["french-fries", "fountain-drinks"],
  }),

  item({
    id: "plain-steak",
    name: "Plain Steak",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Steak sandwich.",
    price: 8.75,
    image: "plain-steak.jpg",
    tags: ["meat", "gluten"],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "cheese-steak",
    name: "Cheese Steak",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Steak sandwich with cheese.",
    price: 10.5,
    image: "cheese-steak.jpg",
    tags: ["meat", "dairy", "gluten"],
    popular: true,
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "pizza-steak",
    name: "Pizza Steak",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Steak sandwich with pizza sauce and cheese.",
    price: 11.5,
    image: "pizza-steak.jpg",
    tags: ["meat", "dairy", "gluten"],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "cheese-steak-hoagie",
    name: "Cheese Steak Hoagie",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Cheese steak on a hoagie roll.",
    price: 11.25,
    image: "cheese-steak-hoagie.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "chicken-steak",
    name: "Chicken Steak",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Chicken steak sandwich.",
    price: 10.25,
    image: "chicken-steak.jpg",
    tags: ["meat", "gluten"],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "chicken-cheese-steak",
    name: "Chicken Cheese Steak",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Chicken steak with cheese.",
    price: 11.75,
    image: "chicken-cheese-steak.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),
  item({
    id: "chicken-cheese-steak-hoagie",
    name: "Chicken Cheese Steak Hoagie",
    category: "steak-sandwiches",
    meal: "lunch",
    description: "Chicken cheese steak on a hoagie roll.",
    price: 12.25,
    image: "chicken-cheese-steak-hoagie.jpg",
    tags: ["meat", "dairy", "gluten"],
    options: [cheese],
    pairs: ["french-fries", "fountain-drinks"],
  }),

  item({
    id: "phillies",
    name: "Phillies",
    category: "kids-lunch",
    meal: "kids",
    description: "Hot dog (boiled or grilled) with French fries or apple sauce. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 8.5,
    image: "phillies.jpg",
    tags: ["meat", "gluten"],
    options: [group("dog", "Hot dog", ["Boiled", "Grilled"], { required: true }), kidSide, kidDrink],
  }),
  item({
    id: "eagles",
    name: "Eagles",
    category: "kids-lunch",
    meal: "kids",
    description: "Mozzarella stix with homemade marinara and French fries or apple sauce. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 8.75,
    image: "eagles.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    options: [kidSide, kidDrink],
  }),
  item({
    id: "sixers",
    name: "Sixers",
    category: "kids-lunch",
    meal: "kids",
    description: "Chicken tenders with honey mustard or BBQ, French fries or apple sauce. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 9.25,
    image: "sixers.jpg",
    tags: ["meat", "gluten"],
    options: [sauceNamed(["Honey mustard", "BBQ"]), kidSide, kidDrink],
  }),
  item({
    id: "flyers",
    name: "Flyers",
    category: "kids-lunch",
    meal: "kids",
    description: "Grilled cheese on your choice of bread with French fries or apple sauce. 12 and under. Includes a small milk, chocolate milk, juice, or fountain drink.",
    price: 8.75,
    image: "flyers.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    options: [bread, kidSide, kidDrink],
  }),

  item({
    id: "chicken-finger-wrap",
    name: "Chicken Finger Wrap",
    category: "wraps",
    meal: "lunch",
    description: "Fried or grilled chicken, cheddar, bacon, lettuce, tomato, choice of ranch, honey mustard, BBQ or buffalo.",
    price: 11.75,
    image: "chicken-finger-wrap.jpg",
    tags: ["meat", "dairy", "gluten"],
    popular: true,
    options: [
      group("style", "Chicken", ["Fried", "Grilled"], { required: true }),
      sauceNamed(["Ranch", "Honey mustard", "BBQ", "Buffalo"]),
    ],
    pairs: lunchPairs,
  }),
  item({
    id: "chicken-parm-wrap",
    name: "Chicken Parmesan Wrap",
    category: "wraps",
    meal: "lunch",
    description: "Chicken tenders with homemade marinara and mozzarella.",
    price: 12.25,
    image: "chicken-parm-wrap.jpg",
    tags: ["meat", "dairy", "gluten"],
    pairs: lunchPairs,
  }),
  item({
    id: "roasted-turkey-wrap",
    name: "Roasted Turkey Wrap",
    category: "wraps",
    meal: "lunch",
    description: "Roasted turkey, lettuce, tomato, bacon with honey mustard, ranch or mayo.",
    price: 11.25,
    image: "roasted-turkey-wrap.jpg",
    tags: ["meat", "gluten"],
    options: [sauceNamed(["Honey mustard", "Ranch", "Mayo"])],
    pairs: lunchPairs,
  }),
  item({
    id: "salad-wrap",
    name: "Chicken Salad or Tuna Salad Wrap",
    category: "wraps",
    meal: "lunch",
    description: "With lettuce, tomato and bacon, honey mustard, ranch or mayo.",
    price: 11.25,
    image: "salad-wrap.jpg",
    tags: ["eggs", "gluten", "meat"],
    options: [
      group("salad", "Salad", ["Chicken salad", "Tuna salad"], { required: true }),
      sauceNamed(["Honey mustard", "Ranch", "Mayo"]),
    ],
    pairs: lunchPairs,
  }),
  item({
    id: "veggie-wrap",
    name: "Veggie Wrap",
    category: "wraps",
    meal: "lunch",
    description: "Sauteed mushrooms, tomatoes, onions, peppers and spinach with your choice of cheese.",
    price: 11.25,
    image: "veggie-wrap.jpg",
    tags: ["vegetarian", "dairy", "gluten"],
    options: [cheese],
    pairs: lunchPairs,
  }),
  item({
    id: "chicken-caesar-wrap",
    name: "Chicken Caesar Wrap",
    category: "wraps",
    meal: "lunch",
    description: "Grilled chicken, romaine, parmesan and Caesar dressing.",
    price: 12.25,
    image: "chicken-caesar-wrap.jpg",
    tags: ["meat", "dairy", "gluten", "eggs"],
    isNew: true,
    pairs: ["iced-tea", "fountain-drinks"],
  }),

  item({
    id: "coffee",
    name: "Coffee",
    category: "drinks",
    meal: "all",
    description: "Regular or decaf.",
    price: 3.5,
    image: "coffee.jpg",
    tags: ["vegetarian"],
    options: [group("brew", "Brew", ["Regular", "Decaf"], { required: true })],
  }),
  item({
    id: "tea",
    name: "Tea",
    category: "drinks",
    meal: "all",
    description: "Regular or decaf.",
    price: 3.25,
    image: "tea.jpg",
    tags: ["vegetarian"],
    options: [group("brew", "Brew", ["Regular", "Decaf"], { required: true })],
  }),
  item({
    id: "hot-chocolate",
    name: "Hot Chocolate",
    category: "drinks",
    meal: "all",
    description: "A mug of hot chocolate.",
    price: 3.5,
    image: "hot-chocolate.jpg",
    tags: ["vegetarian", "dairy"],
  }),
  item({
    id: "juice",
    name: "Juice",
    category: "drinks",
    meal: "all",
    description: "Orange, apple, cranberry, tomato or grapefruit.",
    price: 3.5,
    priceMax: 4.75,
    image: "juice.jpg",
    tags: ["vegetarian"],
    options: [
      group("flavor", "Juice", ["Orange", "Apple", "Cranberry", "Tomato", "Grapefruit"], { required: true }),
      group("size", "Size", ["Small", "Large"], { required: true, replaces: [3.5, 4.75] }),
    ],
  }),
  item({
    id: "milk",
    name: "Milk",
    category: "drinks",
    meal: "all",
    description: "Cold milk.",
    price: 4.25,
    priceMax: 5.25,
    image: "milk.jpg",
    tags: ["vegetarian", "dairy"],
    options: [group("size", "Size", ["Small", "Large"], { required: true, replaces: [4.25, 5.25] })],
  }),
  item({
    id: "chocolate-milk",
    name: "Chocolate Milk",
    category: "drinks",
    meal: "all",
    description: "Cold chocolate milk.",
    price: 4.5,
    priceMax: 5.95,
    image: "chocolate-milk.jpg",
    tags: ["vegetarian", "dairy"],
    options: [group("size", "Size", ["Small", "Large"], { required: true, replaces: [4.5, 5.95] })],
  }),
  item({
    id: "fountain-drinks",
    name: "Fountain Drinks",
    category: "drinks",
    meal: "all",
    description: "Pepsi, Diet Pepsi, Sierra Mist, Root Beer or Mountain Dew.",
    price: 4.25,
    image: "fountain-drinks.jpg",
    tags: ["vegetarian"],
    options: [group("flavor", "Flavor", ["Pepsi", "Diet Pepsi", "Sierra Mist", "Root Beer", "Mountain Dew"], { required: true })],
  }),
  item({
    id: "iced-tea",
    name: "Unsweetened Iced Tea",
    category: "drinks",
    meal: "all",
    description: "Unsweetened iced tea.",
    price: 4.25,
    image: "iced-tea.jpg",
    tags: ["vegetarian"],
  }),
  item({
    id: "lemonade",
    name: "Lemonade",
    category: "drinks",
    meal: "all",
    description: "Lemonade.",
    price: 4.25,
    image: "lemonade.jpg",
    tags: ["vegetarian"],
  }),
];

export const menuById = new Map(menu.map((entry) => [entry.id, entry]));

export function getItem(id: string) {
  return menuById.get(id);
}

export function categoryById(id: string) {
  return categories.find((category) => category.id === id);
}

export function itemsInCategory(categoryId: string) {
  return menu.filter((entry) => entry.category === categoryId);
}

export function defaultSelection(entry: MenuItem): Record<string, string[]> {
  const selected: Record<string, string[]> = {};
  for (const option of entry.options ?? []) {
    if (option.required && !option.multiple && option.choices[0]) {
      selected[option.id] = [option.choices[0].id];
    }
  }
  return selected;
}

export function selectionPrice(entry: MenuItem, selected: Record<string, string[]>) {
  let base = entry.price;
  let extra = 0;
  for (const option of entry.options ?? []) {
    for (const id of selected[option.id] ?? []) {
      const choice = option.choices.find((c) => c.id === id);
      if (!choice) continue;
      if (choice.replaces != null) base = choice.replaces;
      else extra += choice.price ?? 0;
    }
  }
  return Math.round((base + extra) * 100) / 100;
}

export function selectionLabel(entry: MenuItem, selected: Record<string, string[]>) {
  const parts: string[] = [];
  for (const option of entry.options ?? []) {
    for (const id of selected[option.id] ?? []) {
      const choice = option.choices.find((c) => c.id === id);
      if (choice) parts.push(choice.name);
    }
  }
  return parts.join(" · ");
}

export function displayPrice(entry: MenuItem) {
  if (entry.priceMax && entry.priceMax > entry.price) {
    return `$${entry.price.toFixed(2)}–$${entry.priceMax.toFixed(2)}`;
  }
  if (entry.builder) return `From $${entry.price.toFixed(2)}`;
  return `$${entry.price.toFixed(2)}`;
}

export type MenuFilters = {
  categories: string[];
  diets: DietTag[];
  maxPrice: number;
  popularOnly: boolean;
};

export const openFilters: MenuFilters = {
  categories: [],
  diets: [],
  maxPrice: 20,
  popularOnly: false,
};

export function matchesFilters(entry: MenuItem, filters: MenuFilters) {
  if (filters.categories.length && !filters.categories.includes(entry.category)) return false;
  if (filters.popularOnly && !entry.popular && !entry.isNew) return false;
  if (entry.price > filters.maxPrice) return false;
  for (const diet of filters.diets) {
    if (!entry.tags.includes(diet)) return false;
  }
  return true;
}

export function mealMatch(entry: MenuItem, meal: "all" | "breakfast" | "lunch" | "kids") {
  if (meal === "all") return true;
  if (meal === "kids") return entry.meal === "kids";
  if (entry.meal === "all") return meal === "breakfast" || meal === "lunch";
  return entry.meal === meal;
}

export const featuredIds = ["village-sampler", "texas-french-toast", "belgian-waffle", "chicken-parm-sandwich", "patty-melt"];
export const todaySpecialIds = ["biscuits-and-gravy", "creamed-chipped-beef", "village-breakfast-scramble", "corned-beef-hash", "specialty-pancakes"];
export const popularMealIds = ["two-eggs", "shortstack-pancakes", "cheese-burger", "cheese-steak", "chicken-finger-wrap"];

export const omeletteBuilder = {
  base: 8.95,
  steps: [
    {
      id: "cheese",
      name: "Cheese",
      price: 2.75,
      items: ["American", "Swiss", "Provolone", "Cheddar", "Mozzarella", "Feta"],
    },
    {
      id: "veggies",
      name: "Veggies",
      price: 2.5,
      items: ["Onions", "Peppers", "Tomatoes", "Mushrooms", "Spinach"],
    },
    {
      id: "meat",
      name: "Meat",
      price: 3.95,
      items: ["Bacon", "Sausage", "Pork roll", "Ham", "Turkey sausage", "Steak meat", "Shredded chicken"],
    },
    {
      id: "extras",
      name: "Extras",
      price: 1.05,
      items: ["Salsa", "Sour cream", "Marinara sauce"],
    },
  ],
} as const;

export function omelettePrice(selected: Record<string, string[]>) {
  let total = omeletteBuilder.base;
  for (const step of omeletteBuilder.steps) {
    if ((selected[step.id] ?? []).length) total += step.price;
  }
  return Math.round(total * 100) / 100;
}

export const upsellIds = ["coffee", "juice", "french-fries", "homefries-or-grits", "fountain-drinks", "apple-sauce"];

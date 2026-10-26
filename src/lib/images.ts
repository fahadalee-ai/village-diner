import logoUrl from "../img/logo.png";

const modules = import.meta.glob("../img/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const byPath = new Map<string, string>();

for (const [path, url] of Object.entries(modules)) {
  const parts = path.split("/");
  const file = parts[parts.length - 1] ?? "";
  const folder = parts[parts.length - 2] ?? "";
  byPath.set(`${folder}/${file}`, url);
  if (!byPath.has(file)) byPath.set(file, url);
}

/** Public URL for a file under src/img, such as imageSrc("menu", "two-eggs.jpg"). */
export function imageSrc(folder: string, file: string) {
  return byPath.get(`${folder}/${file}`) ?? byPath.get(file) ?? "";
}

export const logo = logoUrl;

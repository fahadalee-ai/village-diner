import { asset } from "./utils";

/** Photos in public/img, served at /img/... so preview and production use the same URL. */
export function imageSrc(folder: string, file: string) {
  if (!folder || !file) return "";
  return asset(`img/${folder}/${file}`);
}

export const logo = asset("img/logo.png");

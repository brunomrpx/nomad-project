import type { Item } from "./items";

export function resolveItemPhotos(item: Item): ImageMetadata[] {
  const images = import.meta.glob<{ default: ImageMetadata }>(
    "/src/assets/items/**/*.{jpeg,jpg,png,webp,JPEG,JPG,PNG,WEBP}",
    { eager: true }
  );

  return item.photos
    .map((filename) => {
      const path = `/src/assets/items/${item.id}/${filename}`;
      const photo = images[path]?.default;
      if (!photo) {
        console.warn(`[resolveItemPhotos] foto não encontrada: ${path}`);
      }
      return photo;
    })
    .filter((photo): photo is ImageMetadata => Boolean(photo));
}

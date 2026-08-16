export type ItemStatus = "disponivel" | "reservado" | "vendido";

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  photos: string[];
  status: ItemStatus;
}

export const statusLabel: Record<ItemStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export function formatPrice(price: number): string {
  const [intPart, centsPart] = price.toFixed(2).split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${withThousands},${centsPart}`;
}

const STATUS_RANK: Record<ItemStatus, number> = {
  disponivel: 0,
  reservado: 1,
  vendido: 1,
};

export function sortItemsByStatus(items: Item[]): Item[] {
  return [...items].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}

export function buildWhatsappLink(whatsappNumber: string, item: Item): string {
  const message = `Olá! Tenho interesse em: ${item.title} — ${formatPrice(item.price)}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

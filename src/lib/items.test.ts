import { describe, it, expect } from "vitest";
import { formatPrice, sortItemsByStatus, buildWhatsappLink, type Item } from "./items";

describe("formatPrice", () => {
  it("formats a value below 1000 without a thousands separator", () => {
    expect(formatPrice(800)).toBe("R$ 800,00");
  });

  it("formats a value at or above 1000 with a thousands separator", () => {
    expect(formatPrice(1500)).toBe("R$ 1.500,00");
  });

  it("formats a value with cents", () => {
    expect(formatPrice(99.9)).toBe("R$ 99,90");
  });
});

function makeItem(id: string, status: Item["status"]): Item {
  return {
    id,
    title: `Item ${id}`,
    description: "",
    price: 100,
    photos: [],
    status,
  };
}

describe("sortItemsByStatus", () => {
  it("puts disponivel items before reservado/vendido, preserving relative order within each group", () => {
    const items = [
      makeItem("a", "vendido"),
      makeItem("b", "disponivel"),
      makeItem("c", "reservado"),
      makeItem("d", "disponivel"),
    ];

    const sorted = sortItemsByStatus(items);

    expect(sorted.map((i) => i.id)).toEqual(["b", "d", "a", "c"]);
  });
});

describe("buildWhatsappLink", () => {
  it("builds a wa.me link with the item title and formatted price in the message", () => {
    const item = makeItem("sofa", "disponivel");
    item.title = "Sofá cinza";
    item.price = 800;

    const link = buildWhatsappLink("5511999999999", item);
    const url = new URL(link);

    expect(url.origin + url.pathname).toBe("https://wa.me/5511999999999");
    expect(url.searchParams.get("text")).toBe(
      "Olá! Tenho interesse em: Sofá cinza — R$ 800,00"
    );
  });
});

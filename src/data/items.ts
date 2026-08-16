import type { Item } from "../lib/items";

export const items: Item[] = [
  {
    id: "sofa-cinza",
    title: "Sofá 3 lugares cinza",
    description:
      "Tecido impermeável, poucos meses de uso. Muito confortável, só não cabe na mala.",
    price: 800,
    photos: ["1.jpg", "2.jpg", "3.jpg"],
    status: "disponivel",
  },
  {
    id: "mesa-jantar",
    title: "Mesa de jantar de madeira",
    description: "Mesa maciça para 4 pessoas, madeira de demolição. Marcas de uso, mas firme.",
    price: 650,
    photos: ["1.jpg", "2.jpg"],
    status: "disponivel",
  },
  {
    id: "estante-livros",
    title: "Estante de livros",
    description: "Estante branca com 5 prateleiras, ótima para quem tem muitos livros (como nós).",
    price: 250,
    photos: ["1.jpg", "2.jpg", "3.jpg"],
    status: "disponivel",
  },
  {
    id: "bicicleta-aro29",
    title: "Bicicleta aro 29",
    description: "Bicicleta mountain bike, 21 marchas, revisada há 2 meses.",
    price: 900,
    photos: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"],
    status: "reservado",
  },
  {
    id: "smart-tv-43",
    title: "Smart TV 43 polegadas",
    description: "TV 4K, pouco tempo de uso, com controle remoto original e caixa.",
    price: 1200,
    photos: ["1.jpg", "2.jpg"],
    status: "disponivel",
  },
  {
    id: "liquidificador",
    title: "Liquidificador",
    description: "Liquidificador de 3 velocidades, funcionando perfeitamente.",
    price: 120,
    photos: ["1.jpg", "2.jpg"],
    status: "vendido",
  },
  {
    id: "cadeira-escritorio",
    title: "Cadeira de escritório",
    description: "Cadeira ergonômica com apoio de braço ajustável e rodinhas.",
    price: 350,
    photos: ["1.jpg", "2.jpg", "3.jpg"],
    status: "disponivel",
  },
  {
    id: "luminaria-piso",
    title: "Luminária de piso",
    description: "Luminária de chão estilo industrial, altura ajustável.",
    price: 180,
    photos: ["1.jpg", "2.jpg"],
    status: "disponivel",
  },
];

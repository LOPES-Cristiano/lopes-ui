import type { Metadata } from "next";
import ComponentsFeed from "./ComponentsFeed";
import { SORTED_REGISTRY } from "./registry";

export const metadata: Metadata = {
  title: "Componentes · Lopes UI",
  description: "Todos os componentes da Lopes UI em uma página corrida, em ordem alfabética, com demonstração e props.",
};

export default function ComponentsPage() {
  return <ComponentsFeed entries={SORTED_REGISTRY} />;
}

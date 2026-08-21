import type { Metadata } from "next";
import InscritosClient from "@/components/InscritosClient";

export const metadata: Metadata = {
  title: "Inscritos | área reservada",
  robots: { index: false, follow: false },
};

export default function InscritosPage() {
  return <InscritosClient />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cat Import Requirements by Country — FlyMy.Pet",
  description:
    "Detailed regulations for relocating cats from UAE to 57+ destinations. Microchip, rabies, titre test, quarantine, and certificate requirements.",
};

export default function RequirementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

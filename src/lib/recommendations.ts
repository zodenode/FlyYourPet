/**
 * Package recommendations for admin/CS — suggests tier and price range
 * based on pet type, weight, and route context.
 */

export type PetSize = "small" | "medium" | "large";

export interface Recommendation {
  tier: "Basic Coordination" | "Full Relocation" | "Rescue Sponsorship";
  displayRange: string;
  internalRange: string;
  margin: string;
  notes: string;
}

function parseWeight(weight: string | null | undefined): number | null {
  if (!weight) return null;
  const w = weight.trim();
  if (w.startsWith("<")) {
    const m = w.match(/(\d+)/);
    return m ? Math.max(0, parseFloat(m[1]) - 1) : null;
  }
  if (w.endsWith("+")) {
    const m = w.match(/(\d+)/);
    return m ? parseFloat(m[1]) + 5 : null;
  }
  const range = w.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  const m = w.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

export function getPetSize(
  type: string | null,
  weight: string | null | undefined
): PetSize {
  const w = parseWeight(weight);
  if (type?.toLowerCase() === "cat") return "small";
  if (!w) return "small";
  if (w < 10) return "small";
  if (w < 25) return "medium";
  return "large";
}

/**
 * Returns recommended package(s) for a relocation based on pet and context.
 */
export function getRecommendations(opts: {
  petType: string | null;
  petWeight: string | null | undefined;
  destination?: string | null;
  isRescue?: boolean;
}): Recommendation[] {
  const { petType, petWeight, destination, isRescue } = opts;
  const size = getPetSize(petType, petWeight);
  const recs: Recommendation[] = [];

  if (isRescue) {
    recs.push({
      tier: "Rescue Sponsorship",
      displayRange: "€800 – €1,500 (buddy) / €1,400 – €2,000 (cargo)",
      internalRange: "€850 – €2,000",
      margin: "€600 – €1,200",
      notes: "Flight buddy or at-cost cargo. Subsidized.",
    });
    return recs;
  }

  // Basic Coordination — owner flies with pet
  recs.push({
    tier: "Basic Coordination",
    displayRange: "€1,100 – €1,500",
    internalRange: "€1,100 – €1,700",
    margin: "€960 – €1,360",
    notes: "Owner flies with pet as excess baggage. Docs, vet, permit only.",
  });

  // Full Relocation — size-dependent
  const fullBySize: Record<PetSize, Omit<Recommendation, "tier">> = {
    small: {
      displayRange: "€2,200 – €2,600",
      internalRange: "€2,200 – €2,600",
      margin: "€1,100 – €1,500",
      notes: "Cat / small dog (<10kg).",
    },
    medium: {
      displayRange: "€2,800 – €3,400",
      internalRange: "€2,800 – €3,400",
      margin: "€1,300 – €1,900",
      notes: "Dog 10–25kg.",
    },
    large: {
      displayRange: "€3,200 – €4,000",
      internalRange: "€3,200 – €4,000",
      margin: "€1,200 – €2,000",
      notes: "Dog 25kg+.",
    },
  };

  recs.push({
    tier: "Full Relocation",
    ...fullBySize[size],
  });

  return recs;
}

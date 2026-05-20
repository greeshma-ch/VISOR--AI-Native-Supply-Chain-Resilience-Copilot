import { Supplier, Disruption, RiskStatus } from '../types';

// Broadly mapped location normalization and alias mapping (all keys/values case-insensitive in use)
export const LOCATION_ALIASES: Record<string, string[]> = {
  'hsinchu': ['taiwan', 'east asia', 'hsinchushi'],
  'taiwan': ['hsinchu', 'east asia'],
  'rotterdam': ['netherlands', 'holland', 'port of rotterdam'],
  'netherlands': ['rotterdam', 'holland'],
  'vietnam': ['ho chi minh', 'saigon', 'hcmc', 'south china sea'],
  'ho chi minh': ['vietnam', 'saigon', 'hcmc', 'south china sea'],
  'saigon': ['vietnam', 'ho chi minh', 'hcmc', 'south china sea'],
  'hcmc': ['vietnam', 'ho chi minh', 'saigon', 'south china sea'],
  'chicago': ['usa', 'united states', 'illinois', 'midwest'],
  'usa': ['chicago', 'united states'],
  'germany': ['munich', 'münchen', 'munchen', 'bavarian'],
  'munich': ['germany', 'münchen', 'munchen', 'bavarian'],
  'münchen': ['germany', 'munich', 'munchen', 'bavarian'],
  'munchen': ['germany', 'munich', 'münchen', 'bavarian'],
  'tokyo': ['japan', 'east asia'],
  'japan': ['tokyo', 'east asia'],
  'zurich': ['switzerland', 'zürich'],
  'zürich': ['switzerland', 'zurich'],
  'south china sea': ['vietnam', 'taiwan', 'east asia', 'ho chi minh', 'saigon', 'shipping lanes', 'maritime'],
  'east asia': ['taiwan', 'japan', 'hsinchu', 'tokyo', 'china', 'korea'],
  'maritime': ['rotterdam', 'south china sea', 'sea', 'shipping', 'port'],
  'global': ['taiwan', 'hsinchu', 'rotterdam', 'netherlands', 'vietnam', 'ho chi minh', 'munich', 'germany', 'tokyo', 'japan', 'chicago', 'usa', 'zurich', 'switzerland', 'south china sea', 'east asia', 'maritime']
};

/**
 * Robust geographic matching utility supporting:
 * - Case-insensitive comparison
 * - Diacritic / Accent normalization (e.g. München -> Munchen, Zürich -> Zurich)
 * - Normalized city / region aliases
 * - Partial matching
 * - Regional fallback
 */
export const isGeoMatch = (locA: string, locB: string): boolean => {
  if (!locA || !locB) return false;

  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents (e.g., münchen -> munchen, zürich -> zurich)
      .replace(/[^\w\s,]/g, "")       // remove special chars except spaces and commas
      .trim();
  };

  const nA = normalize(locA);
  const nB = normalize(locB);

  // Exact comparison after normalization
  if (nA === nB) return true;

  // Split both locations into individual tokens and comma-separated phrases
  const getTermsWithAliases = (normalizedLoc: string): Set<string> => {
    const terms = new Set<string>();
    
    // Add the whole normalized string
    terms.add(normalizedLoc);

    // Split by commas
    const commaParts = normalizedLoc.split(',').map(p => p.trim()).filter(Boolean);
    commaParts.forEach(p => {
      terms.add(p);
      // Split each comma part into words to support word-by-word matches
      p.split(/\s+/).forEach(w => terms.add(w));
    });

    // Expand with aliases
    const expanded = new Set<string>(terms);
    terms.forEach(term => {
      if (LOCATION_ALIASES[term]) {
        LOCATION_ALIASES[term].forEach(alias => {
          const normAlias = normalize(alias);
          expanded.add(normAlias);
          // Split alias as well
          normAlias.split(/[\s,]+/).forEach(w => expanded.add(w));
        });
      }
    });

    return expanded;
  };

  const termsA = getTermsWithAliases(nA);
  const termsB = getTermsWithAliases(nB);

  // 1. Direct overlap of terms/aliases (exact key matching or alias mapping)
  for (const termA of termsA) {
    if (termsB.has(termA)) {
      return true;
    }
  }

  // 2. Partial string matching (substring checks) between the core parts of both locations
  const partsA = nA.split(',').map(p => p.trim()).filter(Boolean);
  const partsB = nB.split(',').map(p => p.trim()).filter(Boolean);

  for (const pa of partsA) {
    for (const pb of partsB) {
      if (pa.includes(pb) || pb.includes(pa)) {
        return true;
      }
      // Word level partial matching for resilience
      const wordsA = pa.split(/\s+/);
      const wordsB = pb.split(/\s+/);
      for (const wa of wordsA) {
        if (wa.length > 3) { // only match longer words partially to avoid noise (e.g. "in", "and")
          for (const wb of wordsB) {
            if (wb.length > 3 && (wa.includes(wb) || wb.includes(wa))) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
};

export const resolveSupplierStatus = (
  supplier: Supplier,
  disruptions: Disruption[],
  simulatedRiskyNodes: string[]
): { status: RiskStatus; matchingDisruptions: Disruption[] } => {
  // Priority 1: Simulation
  if (simulatedRiskyNodes.includes(supplier.id)) {
    return { status: RiskStatus.RISKY, matchingDisruptions: [] };
  }

  // Find all matching disruptions (Direct ID match or Region match)
  const matching = disruptions.filter(d => {
    const isDirectlyImpacted = (d.impactedSuppliers || []).includes(supplier.id) || (d.impactedSuppliers || []).includes(supplier.name);
    if (isDirectlyImpacted) return true;

    if (!d.location) return false;
    
    // Utilize the unified premium geographic matching engine
    return isGeoMatch(supplier.location, d.location);
  });

  if (matching.length === 0) {
    return { status: RiskStatus.STABLE, matchingDisruptions: [] };
  }

  // Resolve highest severity
  const severityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const highest = matching.reduce((prev, curr) => {
    const pVal = severityMap[prev.severity as keyof typeof severityMap] || 0;
    const cVal = severityMap[curr.severity as keyof typeof severityMap] || 0;
    return cVal > pVal ? curr : prev;
  });

  const status = highest.severity === 'High' ? RiskStatus.RISKY : 
                 highest.severity === 'Medium' ? RiskStatus.CAUTION : 
                 RiskStatus.STABLE;

  return { status, matchingDisruptions: matching };
};

// Real-world coordinates using accurate lat/lng positions
export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  x?: number; // percentage position on map (0-100) - kept for backward compatibility if needed
  y?: number; // percentage position on map (0-100) - kept for backward compatibility if needed
}

export interface Proposal {
  id: string;
  date: string;
  commodity: string;
  weight: string;
  value: string;
  status: string;
  vessel?: string;
}

export interface FreightRoute {
  id: string;
  origin: City;
  destination: City;
  proposals: Proposal[];
}

// Convert lat/lng to x/y percentage (equirectangular projection)
// Kept for 2D map compatibility if we ever need it back
const toMapCoords = (lat: number, lng: number): { x: number; y: number } => {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
};

// Helper to create city with both sets of coordinates
const createCity = (name: string, country: string, lat: number, lng: number): City => {
  return {
    name,
    country,
    lat,
    lng,
    ...toMapCoords(lat, lng)
  };
};

// Major global ports with accurate coordinates
export const cities: Record<string, City> = {
  // Asia
  shanghai: createCity("Shanghai", "China", 31.2304, 121.4737),
  ningbo: createCity("Ningbo", "China", 29.8683, 121.5440),
  shenzhen: createCity("Shenzhen", "China", 22.5431, 114.0579),
  qingdao: createCity("Qingdao", "China", 36.0671, 120.3826),
  hongKong: createCity("Hong Kong", "China", 22.3193, 114.1694),
  busan: createCity("Busan", "South Korea", 35.1796, 129.0756),
  singapore: createCity("Singapore", "Singapore", 1.3521, 103.8198),
  hoChiMinh: createCity("Ho Chi Minh City", "Vietnam", 10.8231, 106.6297),
  tokyo: createCity("Tokyo", "Japan", 35.6762, 139.6503),
  yokohama: createCity("Yokohama", "Japan", 35.4437, 139.6380),

  // Europe
  rotterdam: createCity("Rotterdam", "Netherlands", 51.9244, 4.4777),
  hamburg: createCity("Hamburg", "Germany", 53.5511, 9.9937),
  antwerp: createCity("Antwerp", "Belgium", 51.2194, 4.4025),
  felixstowe: createCity("Felixstowe", "UK", 51.9615, 1.3509),
  gdansk: createCity("Gdansk", "Poland", 54.3520, 18.6466),
  piraeus: createCity("Piraeus", "Greece", 37.9475, 23.6413),
  barcelona: createCity("Barcelona", "Spain", 41.3851, 2.1734),

  // Americas
  losAngeles: createCity("Los Angeles", "USA", 33.7490, -118.2417),
  longBeach: createCity("Long Beach", "USA", 33.7701, -118.1937),
  newYork: createCity("New York", "USA", 40.7128, -74.0060),
  savannah: { name: "Savannah", country: "USA", ...toMapCoords(32.0809, -81.0912), lat: 32.0809, lng: -81.0912 }, // Manual fallback if createCity acts weird in some envs (just being safe, actually I'll use createCity for all for consistency)
  manzanillo: createCity("Manzanillo", "Mexico", 19.0544, -104.3152),
  santos: createCity("Santos", "Brazil", -23.9608, -46.3336),
  vancouver: createCity("Vancouver", "Canada", 49.2827, -123.1207),

  // Oceania & Middle East
  melbourne: createCity("Melbourne", "Australia", -37.8136, 144.9631),
  sydney: createCity("Sydney", "Australia", -33.8688, 151.2093),
  dubai: createCity("Dubai", "UAE", 25.2048, 55.2708),
};

// Generate realistic proposal data
const generateProposals = (count: number): Proposal[] => {
  const commodities = ["Electronics", "Machinery", "Auto Parts", "Textiles", "Chemicals", "Furniture", "Consumer Goods", "Medical Equipment"];
  const statuses = ["Delivered", "In Transit", "Cleared", "Pending"];
  const vessels = ["MSC Oscar", "Ever Given", "CSCL Globe", "Madrid Maersk", "HMM Algeciras", "Cosco Shipping Universe"];

  return Array.from({ length: count }, (_, i) => ({
    id: `PRP-${1000 + i}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    commodity: commodities[Math.floor(Math.random() * commodities.length)],
    weight: `${(Math.random() * 500 + 50).toFixed(1)} TEU`,
    value: `$${(Math.random() * 2000000 + 100000).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    vessel: vessels[Math.floor(Math.random() * vessels.length)],
  }));
};

// Define realistic freight routes
export const freightRoutes: FreightRoute[] = [
  // Asia to Europe
  { id: "r1", origin: cities.shanghai, destination: cities.rotterdam, proposals: generateProposals(8) },
  { id: "r2", origin: cities.ningbo, destination: cities.hamburg, proposals: generateProposals(6) },
  { id: "r3", origin: cities.shenzhen, destination: cities.felixstowe, proposals: generateProposals(5) },
  { id: "r4", origin: cities.busan, destination: cities.antwerp, proposals: generateProposals(4) },
  { id: "r5", origin: cities.qingdao, destination: cities.gdansk, proposals: generateProposals(3) },
  { id: "r6", origin: cities.hongKong, destination: cities.piraeus, proposals: generateProposals(4) },
  { id: "r7", origin: cities.singapore, destination: cities.barcelona, proposals: generateProposals(3) },

  // Asia to Americas
  { id: "r8", origin: cities.shanghai, destination: cities.losAngeles, proposals: generateProposals(7) },
  { id: "r9", origin: cities.shenzhen, destination: cities.longBeach, proposals: generateProposals(6) },
  { id: "r10", origin: cities.busan, destination: cities.vancouver, proposals: generateProposals(4) },
  { id: "r11", origin: cities.ningbo, destination: cities.newYork, proposals: generateProposals(5) },
  { id: "r12", origin: cities.hoChiMinh, destination: cities.manzanillo, proposals: generateProposals(3) },
  { id: "r13", origin: cities.tokyo, destination: cities.savannah, proposals: generateProposals(4) },

  // Asia to Oceania
  { id: "r14", origin: cities.shanghai, destination: cities.melbourne, proposals: generateProposals(3) },
  { id: "r15", origin: cities.singapore, destination: cities.sydney, proposals: generateProposals(4) },

  // Middle East connections
  { id: "r16", origin: cities.dubai, destination: cities.rotterdam, proposals: generateProposals(5) },
  { id: "r17", origin: cities.singapore, destination: cities.dubai, proposals: generateProposals(4) },
  { id: "r18", origin: cities.dubai, destination: cities.newYork, proposals: generateProposals(3) },

  // Intra-Asia
  { id: "r19", origin: cities.shanghai, destination: cities.singapore, proposals: generateProposals(5) },
  { id: "r20", origin: cities.busan, destination: cities.yokohama, proposals: generateProposals(4) },

  // South America
  { id: "r21", origin: cities.shanghai, destination: cities.santos, proposals: generateProposals(3) },
  { id: "r22", origin: cities.rotterdam, destination: cities.santos, proposals: generateProposals(2) },
];

// Get all unique cities from routes
export const getAllCities = (): City[] => {
  const cityMap = new Map<string, City>();
  freightRoutes.forEach(route => {
    cityMap.set(route.origin.name, route.origin);
    cityMap.set(route.destination.name, route.destination);
  });
  return Array.from(cityMap.values());
};

// Route statistics
export const routeStats = {
  totalRoutes: freightRoutes.length,
  totalProposals: freightRoutes.reduce((acc, r) => acc + r.proposals.length, 0),
  totalCities: getAllCities().length,
};

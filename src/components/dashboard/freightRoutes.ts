// Real-world coordinates using accurate lat/lng positions
export interface City {
  name: string;
  country: string;
  x: number; // percentage position on map (0-100)
  y: number; // percentage position on map (0-100)
}

export interface Transaction {
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
  transactions: Transaction[];
}

// Convert lat/lng to x/y percentage (equirectangular projection)
const toMapCoords = (lat: number, lng: number): { x: number; y: number } => {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
};

// Major global ports with accurate coordinates
const cities: Record<string, City> = {
  // Asia
  shanghai: { name: "Shanghai", country: "China", ...toMapCoords(31.2304, 121.4737) },
  ningbo: { name: "Ningbo", country: "China", ...toMapCoords(29.8683, 121.5440) },
  shenzhen: { name: "Shenzhen", country: "China", ...toMapCoords(22.5431, 114.0579) },
  qingdao: { name: "Qingdao", country: "China", ...toMapCoords(36.0671, 120.3826) },
  hongKong: { name: "Hong Kong", country: "China", ...toMapCoords(22.3193, 114.1694) },
  busan: { name: "Busan", country: "South Korea", ...toMapCoords(35.1796, 129.0756) },
  singapore: { name: "Singapore", country: "Singapore", ...toMapCoords(1.3521, 103.8198) },
  hoChiMinh: { name: "Ho Chi Minh City", country: "Vietnam", ...toMapCoords(10.8231, 106.6297) },
  tokyo: { name: "Tokyo", country: "Japan", ...toMapCoords(35.6762, 139.6503) },
  yokohama: { name: "Yokohama", country: "Japan", ...toMapCoords(35.4437, 139.6380) },
  
  // Europe
  rotterdam: { name: "Rotterdam", country: "Netherlands", ...toMapCoords(51.9244, 4.4777) },
  hamburg: { name: "Hamburg", country: "Germany", ...toMapCoords(53.5511, 9.9937) },
  antwerp: { name: "Antwerp", country: "Belgium", ...toMapCoords(51.2194, 4.4025) },
  felixstowe: { name: "Felixstowe", country: "UK", ...toMapCoords(51.9615, 1.3509) },
  gdansk: { name: "Gdansk", country: "Poland", ...toMapCoords(54.3520, 18.6466) },
  piraeus: { name: "Piraeus", country: "Greece", ...toMapCoords(37.9475, 23.6413) },
  barcelona: { name: "Barcelona", country: "Spain", ...toMapCoords(41.3851, 2.1734) },
  
  // Americas
  losAngeles: { name: "Los Angeles", country: "USA", ...toMapCoords(33.7490, -118.2417) },
  longBeach: { name: "Long Beach", country: "USA", ...toMapCoords(33.7701, -118.1937) },
  newYork: { name: "New York", country: "USA", ...toMapCoords(40.7128, -74.0060) },
  savannah: { name: "Savannah", country: "USA", ...toMapCoords(32.0809, -81.0912) },
  manzanillo: { name: "Manzanillo", country: "Mexico", ...toMapCoords(19.0544, -104.3152) },
  santos: { name: "Santos", country: "Brazil", ...toMapCoords(-23.9608, -46.3336) },
  vancouver: { name: "Vancouver", country: "Canada", ...toMapCoords(49.2827, -123.1207) },
  
  // Oceania & Middle East
  melbourne: { name: "Melbourne", country: "Australia", ...toMapCoords(-37.8136, 144.9631) },
  sydney: { name: "Sydney", country: "Australia", ...toMapCoords(-33.8688, 151.2093) },
  dubai: { name: "Dubai", country: "UAE", ...toMapCoords(25.2048, 55.2708) },
};

// Generate realistic transaction data
const generateTransactions = (count: number): Transaction[] => {
  const commodities = ["Electronics", "Machinery", "Auto Parts", "Textiles", "Chemicals", "Furniture", "Consumer Goods", "Medical Equipment"];
  const statuses = ["Delivered", "In Transit", "Cleared", "Pending"];
  const vessels = ["MSC Oscar", "Ever Given", "CSCL Globe", "Madrid Maersk", "HMM Algeciras", "Cosco Shipping Universe"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `TXN-${1000 + i}`,
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
  { id: "r1", origin: cities.shanghai, destination: cities.rotterdam, transactions: generateTransactions(8) },
  { id: "r2", origin: cities.ningbo, destination: cities.hamburg, transactions: generateTransactions(6) },
  { id: "r3", origin: cities.shenzhen, destination: cities.felixstowe, transactions: generateTransactions(5) },
  { id: "r4", origin: cities.busan, destination: cities.antwerp, transactions: generateTransactions(4) },
  { id: "r5", origin: cities.qingdao, destination: cities.gdansk, transactions: generateTransactions(3) },
  { id: "r6", origin: cities.hongKong, destination: cities.piraeus, transactions: generateTransactions(4) },
  { id: "r7", origin: cities.singapore, destination: cities.barcelona, transactions: generateTransactions(3) },
  
  // Asia to Americas
  { id: "r8", origin: cities.shanghai, destination: cities.losAngeles, transactions: generateTransactions(7) },
  { id: "r9", origin: cities.shenzhen, destination: cities.longBeach, transactions: generateTransactions(6) },
  { id: "r10", origin: cities.busan, destination: cities.vancouver, transactions: generateTransactions(4) },
  { id: "r11", origin: cities.ningbo, destination: cities.newYork, transactions: generateTransactions(5) },
  { id: "r12", origin: cities.hoChiMinh, destination: cities.manzanillo, transactions: generateTransactions(3) },
  { id: "r13", origin: cities.tokyo, destination: cities.savannah, transactions: generateTransactions(4) },
  
  // Asia to Oceania
  { id: "r14", origin: cities.shanghai, destination: cities.melbourne, transactions: generateTransactions(3) },
  { id: "r15", origin: cities.singapore, destination: cities.sydney, transactions: generateTransactions(4) },
  
  // Middle East connections
  { id: "r16", origin: cities.dubai, destination: cities.rotterdam, transactions: generateTransactions(5) },
  { id: "r17", origin: cities.singapore, destination: cities.dubai, transactions: generateTransactions(4) },
  { id: "r18", origin: cities.dubai, destination: cities.newYork, transactions: generateTransactions(3) },
  
  // Intra-Asia
  { id: "r19", origin: cities.shanghai, destination: cities.singapore, transactions: generateTransactions(5) },
  { id: "r20", origin: cities.busan, destination: cities.yokohama, transactions: generateTransactions(4) },
  
  // South America
  { id: "r21", origin: cities.shanghai, destination: cities.santos, transactions: generateTransactions(3) },
  { id: "r22", origin: cities.rotterdam, destination: cities.santos, transactions: generateTransactions(2) },
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
  totalTransactions: freightRoutes.reduce((acc, r) => acc + r.transactions.length, 0),
  totalCities: getAllCities().length,
};

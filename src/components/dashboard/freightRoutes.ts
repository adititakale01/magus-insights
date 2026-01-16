// Realistic global freight route dataset
// Coordinates are approximate percentages on a world map projection

export interface Port {
  name: string;
  x: number; // percentage position on map
  y: number;
  region: "asia" | "europe" | "americas" | "oceania";
}

export interface FreightRoute {
  id: string;
  origin: Port;
  destination: Port;
  volume: number; // 1-10 scale for visual weight
  status: "active" | "pending" | "completed";
  shipments: number;
}

export const ports: Record<string, Port> = {
  // Asia Pacific
  shanghai: { name: "Shanghai", x: 78, y: 42, region: "asia" },
  ningbo: { name: "Ningbo", x: 79, y: 44, region: "asia" },
  shenzhen: { name: "Shenzhen", x: 75, y: 48, region: "asia" },
  hongKong: { name: "Hong Kong", x: 74, y: 48, region: "asia" },
  hoChiMinh: { name: "Ho Chi Minh City", x: 71, y: 54, region: "asia" },
  singapore: { name: "Singapore", x: 69, y: 60, region: "asia" },
  busan: { name: "Busan", x: 81, y: 38, region: "asia" },
  qingdao: { name: "Qingdao", x: 79, y: 38, region: "asia" },
  tokyo: { name: "Tokyo", x: 85, y: 38, region: "asia" },
  yokohama: { name: "Yokohama", x: 85, y: 39, region: "asia" },
  kaohsiung: { name: "Kaohsiung", x: 78, y: 48, region: "asia" },
  
  // Europe
  rotterdam: { name: "Rotterdam", x: 36, y: 30, region: "europe" },
  hamburg: { name: "Hamburg", x: 38, y: 28, region: "europe" },
  antwerp: { name: "Antwerp", x: 35, y: 30, region: "europe" },
  felixstowe: { name: "Felixstowe", x: 33, y: 28, region: "europe" },
  gdansk: { name: "Gdansk", x: 41, y: 27, region: "europe" },
  piraeus: { name: "Piraeus", x: 44, y: 40, region: "europe" },
  barcelona: { name: "Barcelona", x: 33, y: 38, region: "europe" },
  valencia: { name: "Valencia", x: 32, y: 40, region: "europe" },
  leHavre: { name: "Le Havre", x: 32, y: 32, region: "europe" },
  
  // Americas
  losAngeles: { name: "Los Angeles", x: 14, y: 42, region: "americas" },
  longBeach: { name: "Long Beach", x: 14, y: 43, region: "americas" },
  newYork: { name: "New York", x: 24, y: 38, region: "americas" },
  savannah: { name: "Savannah", x: 22, y: 44, region: "americas" },
  houston: { name: "Houston", x: 18, y: 46, region: "americas" },
  manzanillo: { name: "Manzanillo", x: 15, y: 52, region: "americas" },
  santos: { name: "Santos", x: 28, y: 72, region: "americas" },
  colon: { name: "Colon", x: 21, y: 56, region: "americas" },
  vancouver: { name: "Vancouver", x: 13, y: 32, region: "americas" },
  
  // Oceania
  melbourne: { name: "Melbourne", x: 88, y: 78, region: "oceania" },
  sydney: { name: "Sydney", x: 90, y: 76, region: "oceania" },
  auckland: { name: "Auckland", x: 96, y: 78, region: "oceania" },
};

// Generate realistic freight routes with varying volumes
export const freightRoutes: FreightRoute[] = [
  // Major Asia to Europe routes (high volume)
  { id: "rt001", origin: ports.shanghai, destination: ports.rotterdam, volume: 10, status: "active", shipments: 847 },
  { id: "rt002", origin: ports.ningbo, destination: ports.hamburg, volume: 9, status: "active", shipments: 623 },
  { id: "rt003", origin: ports.shenzhen, destination: ports.felixstowe, volume: 8, status: "active", shipments: 512 },
  { id: "rt004", origin: ports.busan, destination: ports.rotterdam, volume: 8, status: "active", shipments: 489 },
  { id: "rt005", origin: ports.qingdao, destination: ports.antwerp, volume: 7, status: "active", shipments: 378 },
  { id: "rt006", origin: ports.hongKong, destination: ports.hamburg, volume: 7, status: "pending", shipments: 356 },
  { id: "rt007", origin: ports.singapore, destination: ports.rotterdam, volume: 9, status: "active", shipments: 567 },
  { id: "rt008", origin: ports.kaohsiung, destination: ports.gdansk, volume: 6, status: "active", shipments: 234 },
  
  // Asia to Americas routes
  { id: "rt009", origin: ports.shanghai, destination: ports.losAngeles, volume: 10, status: "active", shipments: 892 },
  { id: "rt010", origin: ports.ningbo, destination: ports.longBeach, volume: 9, status: "active", shipments: 678 },
  { id: "rt011", origin: ports.shenzhen, destination: ports.newYork, volume: 8, status: "active", shipments: 445 },
  { id: "rt012", origin: ports.busan, destination: ports.losAngeles, volume: 7, status: "pending", shipments: 334 },
  { id: "rt013", origin: ports.hoChiMinh, destination: ports.longBeach, volume: 6, status: "active", shipments: 267 },
  { id: "rt014", origin: ports.qingdao, destination: ports.savannah, volume: 5, status: "active", shipments: 189 },
  { id: "rt015", origin: ports.tokyo, destination: ports.vancouver, volume: 6, status: "active", shipments: 223 },
  
  // Europe to Americas
  { id: "rt016", origin: ports.rotterdam, destination: ports.newYork, volume: 7, status: "active", shipments: 345 },
  { id: "rt017", origin: ports.hamburg, destination: ports.savannah, volume: 5, status: "active", shipments: 178 },
  { id: "rt018", origin: ports.antwerp, destination: ports.houston, volume: 6, status: "pending", shipments: 212 },
  { id: "rt019", origin: ports.felixstowe, destination: ports.newYork, volume: 5, status: "active", shipments: 167 },
  
  // Intra-Asia routes
  { id: "rt020", origin: ports.shanghai, destination: ports.singapore, volume: 8, status: "active", shipments: 445 },
  { id: "rt021", origin: ports.busan, destination: ports.hongKong, volume: 6, status: "active", shipments: 278 },
  { id: "rt022", origin: ports.shenzhen, destination: ports.tokyo, volume: 5, status: "active", shipments: 189 },
  { id: "rt023", origin: ports.singapore, destination: ports.yokohama, volume: 5, status: "pending", shipments: 156 },
  
  // Asia/Europe to Oceania
  { id: "rt024", origin: ports.shanghai, destination: ports.melbourne, volume: 6, status: "active", shipments: 234 },
  { id: "rt025", origin: ports.singapore, destination: ports.sydney, volume: 5, status: "active", shipments: 178 },
  { id: "rt026", origin: ports.rotterdam, destination: ports.melbourne, volume: 4, status: "active", shipments: 123 },
  { id: "rt027", origin: ports.busan, destination: ports.auckland, volume: 4, status: "pending", shipments: 98 },
  
  // Americas to South America
  { id: "rt028", origin: ports.houston, destination: ports.santos, volume: 5, status: "active", shipments: 167 },
  { id: "rt029", origin: ports.newYork, destination: ports.colon, volume: 4, status: "active", shipments: 134 },
  { id: "rt030", origin: ports.losAngeles, destination: ports.manzanillo, volume: 6, status: "active", shipments: 245 },
  
  // Mediterranean routes
  { id: "rt031", origin: ports.piraeus, destination: ports.barcelona, volume: 4, status: "active", shipments: 112 },
  { id: "rt032", origin: ports.valencia, destination: ports.piraeus, volume: 3, status: "pending", shipments: 89 },
  { id: "rt033", origin: ports.leHavre, destination: ports.piraeus, volume: 4, status: "active", shipments: 98 },
  
  // Additional high-volume routes
  { id: "rt034", origin: ports.hongKong, destination: ports.losAngeles, volume: 9, status: "active", shipments: 678 },
  { id: "rt035", origin: ports.singapore, destination: ports.newYork, volume: 7, status: "active", shipments: 389 },
  { id: "rt036", origin: ports.yokohama, destination: ports.longBeach, volume: 6, status: "active", shipments: 256 },
];

// Statistics for the visualization
export const routeStats = {
  totalActiveRoutes: freightRoutes.filter(r => r.status === "active").length,
  totalShipments: freightRoutes.reduce((acc, r) => acc + r.shipments, 0),
  topOrigins: ["Shanghai", "Ningbo", "Shenzhen", "Singapore", "Busan"],
  topDestinations: ["Rotterdam", "Los Angeles", "Hamburg", "New York", "Long Beach"],
};

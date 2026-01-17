export interface RouteQuote {
  timestamp: string;
  mode: string;
  origin: string;
  destination: string;
  origin_display: string;
  destination_display: string;
  transit_days: number | null;
  currency: string;
  final_amount: number;
  chargeable_weight_kg: number | null;
  actual_weight_kg: number | null;
  volume_cbm: number | null;
  commodity: string | null;
  quantity: number | null;
  container_size_ft: number | null;
  per_container_amount: number | null;
  recommendation: string | null;
  alternative: string | null;
  notes: string | null;
}

export interface EmailPayload {
  email_id: string | null;
  from: string;
  to: string;
  subject: string;
  body: string;
}

export interface Email extends EmailPayload {
  // UI specific fields
  id: string; // mapped to email_id
  sender_name: string;
  preview: string;
  status: 'processed' | 'needs_review' | 'escalated';
  timestamp: string;
  response_time: number;
  confidence_score: number;
  draft_response: string;
  data_sources: { name: string; type: string }[];
}

export interface Metrics {
  date: string;
  hour: number;
  mails_processed: number;
  avg_response_time: number;
  escalated_count: number;
}

export interface ProcessingTrend {
  timestamp: string;
  volume: number;
  speed: number;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

async function loadCSV(path: string): Promise<Record<string, string>[]> {
  const response = await fetch(path);
  const text = await response.text();
  return parseCSV(text);
}

export async function loadRoutes(): Promise<RouteQuote[]> {
  const rows = await loadCSV('/src/data/routes.csv');
  return rows.map(row => ({
    mode: row.mode,
    origin: row.origin,
    destination: row.destination,
    origin_display: row.origin_display,
    destination_display: row.destination_display,
    transit_days: row.transit_days ? parseInt(row.transit_days) : null,
    currency: row.currency,
    final_amount: parseFloat(row.final_amount),
    chargeable_weight_kg: row.chargeable_weight_kg ? parseFloat(row.chargeable_weight_kg) : null,
    actual_weight_kg: row.actual_weight_kg ? parseFloat(row.actual_weight_kg) : null,
    volume_cbm: row.volume_cbm ? parseFloat(row.volume_cbm) : null,
    commodity: row.commodity || null,
    quantity: row.quantity ? parseInt(row.quantity) : null,
    container_size_ft: row.container_size_ft ? parseInt(row.container_size_ft) : null,
    per_container_amount: row.per_container_amount ? parseFloat(row.per_container_amount) : null,
    recommendation: row.recommendation || null,
    alternative: row.alternative || null,
    notes: row.notes || null,
  }));
}

export async function loadEmails(): Promise<Email[]> {
  const rows = await loadCSV('/src/data/emails.csv');
  return rows.map(row => ({
    // Backend Payload fields
    email_id: row.id,
    from: row.sender,
    to: "quotes@freightco.com", // Mocked as it's not in CSV
    subject: row.subject,
    body: row.content,

    // UI fields
    id: row.id,
    sender_name: row.sender_name,
    preview: row.preview,
    status: row.status as 'processed' | 'needs_review' | 'escalated',
    timestamp: row.timestamp,
    response_time: parseInt(row.response_time),
    confidence_score: parseFloat(row.confidence_score),
    draft_response: row.draft_response,
    data_sources: row.data_sources ? JSON.parse(row.data_sources) : [],
  }));
}

export async function loadMetrics(): Promise<Metrics[]> {
  const rows = await loadCSV('/src/data/metrics.csv');
  return rows.map(row => ({
    date: row.date,
    hour: parseInt(row.hour),
    mails_processed: parseInt(row.mails_processed),
    avg_response_time: parseInt(row.avg_response_time),
    escalated_count: parseInt(row.escalated_count),
  }));
}

export async function loadProcessingTrends(): Promise<ProcessingTrend[]> {
  const rows = await loadCSV('/src/data/processing_trends.csv');
  return rows.map(row => ({
    timestamp: row.timestamp,
    volume: parseInt(row.volume),
    speed: parseInt(row.speed),
  }));
}

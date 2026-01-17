
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://reprocessed-prefamiliarly-gracia.ngrok-free.dev/api/v1";

export interface EmailRecord {
    id: string;
    time: string;
    updated_at?: string;
    email_id?: string;
    from: string;
    to: string;
    subject?: string;
    body?: string;
    reply?: string;
    trace?: any; // object or string
    type: string;
    status: string;
    config?: any;
    origin_city?: string;
    destination_city?: string;
    price?: number;
    currency?: string;
    transport_type?: string;
    has_route?: boolean;
}

export interface Email {
    id: string;
    sender_name: string;
    preview: string;
    status: 'processed' | 'needs_review' | 'escalated';
    backend_status: string;
    timestamp: string;
    response_time: number;
    confidence_score: number;
    draft_response: string;
    data_sources: { name: string; type: string }[];
    from: string;
    subject: string;
    body: string;
    steps: any[];
}

export interface PagedResponse<T> {
    items: T[];
    limit: number;
    offset: number;
    count: number;
}

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${API_BASE}${path}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    console.log(`[API] Fetching: ${url.toString()}`);
    const res = await fetch(url.toString(), {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'application/json'
        }
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
    }

    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    // Fallback or error if not JSON
    const text = await res.text();
    // Try to parse just in case content-type is missing but it is JSON
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Received invalid JSON:", text.substring(0, 100));
        throw new Error(`Invalid JSON response from API: ${text.substring(0, 100)}...`);
    }
}

export async function listEmailRecords(params: { limit: number; offset: number }): Promise<PagedResponse<EmailRecord>> {
    return apiGet<PagedResponse<EmailRecord>>('/email-records', params);
}

export async function getStatusCounts(): Promise<Record<string, number>> {
    // Response is { counts: { ... } } or just map? User said "Response: object mapping backend status -> count"
    // But sample in prompt says: { counts: { unprocessed: 0, ... } }
    // Wait, let me check the prompt again.
    // Prompt says: "Response: object mapping backend status -> count (treat as record<string, number>)"
    // BUT the "Additional Metadata" -> API.md says: 
    // GET /api/v1/email-records/status-counts
    // Response: { "counts": { ... } }
    // So I should treat it as { counts: Record<string, number> }
    // However, I will type it loosely or check specifically if 'counts' key exists.
    // Let's assume the API.md is correct: { counts: ... }

    const res = await apiGet<{ counts: Record<string, number> } | Record<string, number>>('/email-records/status-counts');
    if ('counts' in res) {
        return res.counts as Record<string, number>;
    }
    return res as Record<string, number>;
}

export async function listNeedsHumanDecision(params: { limit: number; offset: number }): Promise<PagedResponse<EmailRecord>> {
    return apiGet<PagedResponse<EmailRecord>>('/email-records/needs-human-decision', params);
}

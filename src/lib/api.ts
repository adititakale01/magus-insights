
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
    confidence?: string;
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
    status: 'processed' | 'needs_review' | 'auto_replied' | 'ignored';
    backend_status: string;
    timestamp: string;
    updated_at?: string;
    response_time: number;
    confidence_score: number;
    confidence?: string;
    draft_response: string;
    data_sources: { name: string; type: string }[];
    from: string;
    subject: string;
    body: string;
    steps: any[];
    sent?: boolean;
}

export interface PagedResponse<T> {
    items: T[];
    limit: number;
    offset: number;
    count: number;
}

export interface EmailRecordDecisionRequest {
    id: string;
    decision: 'accept' | 'reject';
    refined_quote?: string | null;
    comment?: string | null;
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

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const url = `${API_BASE}${path}`;
    
    console.log(`[API] POST: ${url}`, body);
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
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

export async function fetchAllEmails(): Promise<EmailRecord[]> {
    const limit = 100;
    let offset = 0;
    let allEmails: EmailRecord[] = [];
    let hasMore = true;

    while (hasMore) {
        const res = await listEmailRecords({ limit, offset });
        allEmails = [...allEmails, ...res.items];

        if (allEmails.length >= res.count || res.items.length < limit) {
            hasMore = false;
        } else {
            offset += limit;
        }
    }
    return allEmails;
}

export interface EmailDecisionResponse {
    ok: boolean;
    id: string;
    decision: 'accept' | 'reject';
    sent: boolean;
    quote_text?: string;
    webhook?: {
        status_code: number;
    };
}

export async function submitEmailDecision(request: EmailRecordDecisionRequest): Promise<EmailDecisionResponse> {
    return apiPost<EmailDecisionResponse>('/email-records/decision', request);
}

export interface SenderStatsItem {
    sender: string;
    count: number;
}

export interface SenderStatsResponse {
    items: SenderStatsItem[];
    unique_senders: number;
    scanned: number;
    max_rows: number;
    reached_max_rows: boolean;
}

export async function getSenderStats(): Promise<SenderStatsResponse> {
    return apiGet<SenderStatsResponse>('/stats/senders');
}

export interface RouteStatsItem {
    route: string;
    count: number;
}

export interface RouteStatsResponse {
    items: RouteStatsItem[];
    unique_routes: number;
    scanned: number;
    max_rows: number;
    reached_max_rows: boolean;
}

export async function getRouteStats(): Promise<RouteStatsResponse> {
    return apiGet<RouteStatsResponse>('/stats/routes', {
        top: 100,
        max_rows: 20000,
        batch_size: 1000,
    });
}

import { useEffect, useState } from 'react';
import { Filter, CheckCircle2, AlertCircle, Clock, Mail, ChevronDown, RefreshCcw, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { EmailDetail } from './EmailDetail';
import { Email, EmailRecord, listEmailRecords, getStatusCounts, listNeedsHumanDecision } from '@/lib/api';

type FilterType = 'all' | 'processed' | 'needs_review' | 'auto_replied' | 'ignored';

export function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Counts
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setOffset(0);
    fetchEmails(true);
  }, [filter]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [countsData] = await Promise.all([
        getStatusCounts(),
        fetchEmails(true) // Fetch first page
      ]);
      setCounts(countsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load inbox data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmails(reset: boolean = false) {
    // If resetting (e.g. filter change), we use offset 0.
    // Otherwise we use current offset (which calls from "Load More" would have updated).
    // Actually, "Load More" logic needs to call this with new offset.
    // Let's make this function accept custom offset/limit or read from state.
    // For simplicity, let's just make it fetch based on params passed or state.

    // BUT, since we have filter dependencies in useEffect, calling it there is tricky if we also want "Load More".
    // Strategy: 
    // - fetchEmails(replace: boolean)
    // - if replace, offset=0, setEmails(new).
    // - else, use current offset, setEmails([...old, ...new]).

    // However, the `offset` state is updated by "Load More".
    // So let's handle the actual fetch logic here.

    const currentOffset = reset ? 0 : offset;

    setLoading(true);
    setError(null);
    try {
      let res;
      if (filter === 'needs_review') {
        res = await listNeedsHumanDecision({ limit, offset: currentOffset });
      } else {
        // For 'all', 'processed', 'escalated', we fetch all records and filter client side?
        // User request: "For other filters, use /email-records and filter client-side OR (preferred) request all and filter client-side initially."
        // "Maintain pagination state (limit/offset/count)"
        // If we filter client-side, pagination from backend becomes weird because the page might contain mixed statuses.
        // If the backend doesn't support status filtering for 'processed'/'auto_replied', checking page by page is hard.
        // User said: "request all and filter client-side initially. Keep it lean—no complex server filtering unless backend supports it."
        // If the total count is small enough, we can fetch all. But endpoints are paged.
        // If we only fetch page 1, we might not see "processed" emails if page 1 is full of "unprocessed".

        // However, given the instructions "Fetch status counts + first page of emails (limit=50, offset=0)", maybe we just show what we get in the list?
        // But then the client-side filter `email.status === filter` would hide everything if the page doesn't have matches.

        // Let's assume for 'all', we just show everything.
        // For 'processed' and 'auto_replied', if we don't have a backend endpoint, the user suggestion "request all" implies fetching everything. 
        // But calling `limit=1000` might be too much?
        // Let's stick to:
        // 'all': /email-records
        // 'needs_review': /needs-human-decision
        // 'processed' / 'auto_replied': We'll reuse /email-records but we accept that we might show fewer items effectively if we filter client side, 
        // OR we just fetch /email-records (all) and filter in UI. If we fetch only 50 and filter, we might show 0.
        // Let's interpret "request all" as just using the main list and filtering in UI interactively on the loaded items?
        // OR does the user mean we should try to fetch *all* pages?
        // "request all and filter client-side initially" -> probably means fetch with a large limit or loop.

        // Given constraint "Keep it lean", and existing `filteredEmails` logic:
        // The existing logic filters `emails` array.
        // If I replace `emails` with just the current page, filtering might yield empty results.

        // Compromise:
        // For 'all': fetch paged /email-records.
        // For 'needs_review': fetch paged /needs-human-decision.
        // For 'processed'/'auto_replied': warn this might be incomplete or just fetch /email-records? 
        // Actually, if 'needs_review' is separate, maybe we can assume /email-records roughly corresponds to 'all'.
        // If the user selects 'processed', and we only have page 1 of 'all', we might not find them.

        // Let's just implement:
        // 1. 'needs_review' -> /needs-human-decision
        // 2. Others -> /email-records
        // And then apply client-side filtering on the *fetched* batch.
        // This is imperfect but follows "Keep it lean".

        // Wait, "For filter “needs_review”, use the dedicated endpoint... For other filters, use /email-records and filter client-side".
        // This confirms my plan.

        res = await listEmailRecords({ limit, offset: currentOffset });
      }

      const mapped = res.items.map(mapRecordToEmail);

      if (reset) {
        setEmails(mapped);
        if (mapped.length > 0) setSelectedEmail(mapped[0]);
        else setSelectedEmail(null);
      } else {
        setEmails(prev => [...prev, ...mapped]);
      }

      setTotalCount(res.count); // Note: this count might be total of the endpoint (e.g. all records or all needs_decision)

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    setOffset(prev => prev + limit);
    // Usage of effect dependency on offset or direct call?
    // If we use effect on offset, we need to distinguish reset vs load more.
    // Let's assume we call fetchEmails(false) manually after updating offset, 
    // BUT state update is async.
    // Better: Effect on offset change?
    // But reset sets offset to 0. 
    // Let's rely on a separate effect or just call fetch inside handleLoadMore with new offset.
    // Issue: local `offset` state vs used offset.
    // Let's use an effect:
    // useEffect(() => { if (offset > 0) fetchEmails(false); }, [offset]);
  }

  // Effect for handling load more (skip initial 0 which is handled by filter change/init)
  useEffect(() => {
    if (offset > 0) {
      fetchEmails(false);
    }
  }, [offset]);


  function mapRecordToEmail(record: EmailRecord): Email {
    let steps: any[] = [];
    try {
      if (typeof record.trace === 'string') {
        const parsed = JSON.parse(record.trace);
        steps = parsed.steps || [];
      } else if (record.trace && typeof record.trace === 'object') {
        steps = record.trace.steps || [];
      }
    } catch (e) {
      console.error('Failed to parse trace', e);
    }

    let status_ui: 'processed' | 'needs_review' | 'auto_replied' | 'ignored' = 'needs_review';
    if (['human_confirmed_replied'].includes(record.status)) status_ui = 'processed';
    else if (['auto_processed'].includes(record.status)) status_ui = 'auto_replied';
    else if (['human_rejected'].includes(record.status)) status_ui = 'ignored';
    else status_ui = 'needs_review';

    const timestamp = record.time || record.updated_at || new Date().toISOString();

    // Sender name derivation
    let sender = 'Unknown';
    if (record.from) {
      const parts = record.from.split('@')[0].split('.');
      sender = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    // Preview
    const rawBody = record.body || '';
    const preview = rawBody.replace(/<[^>]*>?/gm, '').substring(0, 140);

    return {
      id: record.id,
      sender_name: sender,
      preview: preview,
      status: status_ui,
      backend_status: record.status,
      timestamp: timestamp,
      updated_at: record.updated_at,
      response_time: 0,
      confidence_score: 0,
      confidence: record.confidence,
      draft_response: record.reply || '',
      data_sources: [],
      from: record.from,
      subject: record.subject || '(no subject)',
      body: record.body || '',
      steps: steps
    };
  }

  // Calculate UI counts from backend counts
  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') {
      // sum all counts? or use total? Assuming 'total' might be in counts, or sum up known keys.
      // keys: unprocessed, auto_processed, needs_human_decision, human_confirmed_replied, human_rejected
      if (counts.total) return counts.total;
      return Object.values(counts).reduce((a, b) => a + b, 0);
    }
    if (filterType === 'processed') {
      return (counts['human_confirmed_replied'] || 0);
    }
    if (filterType === 'needs_review') {
      return (counts['needs_human_decision'] || 0) + (counts['unprocessed'] || 0);
    }
    if (filterType === 'auto_replied') {
      return (counts['auto_processed'] || 0);
    }
    if (filterType === 'ignored') {
      return (counts['human_rejected'] || 0);
    }
    return 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Processed</span>
          </div>
        );
      case 'needs_review':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
            <Clock className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Needs Review</span>
          </div>
        );
      case 'auto_replied':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/50">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Auto Replied</span>
          </div>
        );
      case 'ignored':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/20 border border-gray-500/50">
            <AlertCircle className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Ignored</span>
          </div>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Client-side filtering of the list
  const displayEmails = emails.filter(email => {
    // If we fetched specific endpoint for needs_review, no need to filter again?
    // Actually, backend returns filtered list.
    // BUT for 'processed', 'auto_replied', and 'ignored', we rely on /email-records (all) so we MUST filter.
    if (filter === 'all') return true;
    if (filter === 'needs_review') return true; // Endpoint already filtered
    return email.status === filter;
  });

  return (
    <div className="h-[calc(100vh-6rem)] pt-6 px-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-3xl font-bold text-white mb-2">Inbox</h2>
          <p className="text-gray-400">AI-powered email automation</p>
        </div>

        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          <div className="col-span-3 flex flex-col">
            <div className="sticky top-6 self-start max-h-[calc(100vh-8rem)] flex flex-col">
              <GlassCard className="p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </div>
                <div className="space-y-2">
                  {(['all', 'processed', 'needs_review', 'auto_replied', 'ignored'] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${filter === f
                        ? 'bg-white/20 text-white border border-cyan-400/50'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span className="text-sm capitalize">
                        {f === 'all' ? 'All Emails' : f === 'auto_replied' ? 'Auto Replied' : f.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${f === 'processed' ? 'bg-emerald-500/20 text-emerald-400' :
                          f === 'needs_review' ? 'bg-yellow-500/20 text-yellow-400' :
                            f === 'auto_replied' ? 'bg-blue-500/20 text-blue-400' :
                              f === 'ignored' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-white/20'
                        }`}>
                        {getFilterCount(f)}
                      </span>
                    </button>
                  ))}
                </div>
              </GlassCard>

              <div className="mt-4 flex justify-end flex-shrink-0">
                <button onClick={() => fetchInitialData()} title="Refresh" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
              <div className="space-y-3 relative min-h-[200px]">
                {loading && emails.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                )}

                {error && (
                  <GlassCard className="p-4 border-red-500/50 bg-red-500/10">
                    <div className="text-red-400 text-sm mb-2">{error}</div>
                    <button onClick={() => fetchInitialData()} className="text-xs bg-red-500/20 px-2 py-1 rounded text-red-300 hover:text-red-200">Retry</button>
                  </GlassCard>
                )}

                {displayEmails.map((email) => (
                  <GlassCard
                    key={email.id}
                    className={`p-4 cursor-pointer transition-all ${selectedEmail?.id === email.id
                      ? 'border-cyan-400/50 bg-white/15'
                      : ''
                      }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 overflow-hidden">
                        <div className="font-semibold text-white mb-1 truncate">
                          {email.sender_name}
                        </div>
                        <div className="text-sm text-gray-400 mb-2 truncate">
                          {email.subject}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {getStatusBadge(email.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {email.preview}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(email.timestamp)}</span>
                      <span className="truncate max-w-[120px]">{email.from}</span>
                    </div>
                  </GlassCard>
                ))}

                {!loading && displayEmails.length === 0 && !error && (
                  <div className="text-center text-gray-500 py-8">
                    No emails found.
                  </div>
                )}

              {/* Load More Button */}
              {/* Show if strict count check passes. For 'all', totalCount is from backend. For 'needs_review', same. */}
              {/* Note: if we filter client side (processed/auto_replied), totalCount is for ALL emails, so this check is inaccurate. */}
              {/* But for 'all' and 'needs_review' it should be fine. */}
              {(filter === 'all' || filter === 'needs_review') && (offset + limit < totalCount) && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-all disabled:opacity-50 mb-3"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-5 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
              {selectedEmail ? (
                <EmailDetail email={selectedEmail} />
              ) : (
                <GlassCard className="p-8 flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select an email to view details</p>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

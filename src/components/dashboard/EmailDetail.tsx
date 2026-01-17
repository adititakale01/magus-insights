import { useState, useEffect } from 'react';
import { Mail, FileSpreadsheet, Globe, Clock, TrendingUp, Edit, Send, ArrowRight, CheckCircle2, Zap, Brain, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Email, submitEmailDecision } from '@/lib/api';

interface EmailDetailProps {
  email: Email;
}

export function EmailDetail({ email }: EmailDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(email.draft_response);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isSent, setIsSent] = useState(email.sent || false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  // Check if email was sent by looking at steps
  const checkIfSent = (email: Email): boolean => {
    if (email.sent) return true;
    // Check if there's a Human Decision step with decision="accept"
    if (email.steps && email.steps.length > 0) {
      const humanDecisionStep = email.steps.find((step: any) => {
        const title = (step.title || step.action || '').toLowerCase();
        return title.includes('human decision') || title.includes('human');
      });
      if (humanDecisionStep?.data?.decision === 'accept') {
        return true;
      }
    }
    return false;
  };

  // Update draft text when email changes
  useEffect(() => {
    setDraftText(email.draft_response);
    setSendError(null);
    setSendSuccess(false);
    setIsSent(checkIfSent(email));
  }, [email.id, email.draft_response, email.sent, email.steps]);

  const handleSendReply = async () => {
    if (!draftText.trim()) {
      setSendError('Please enter a reply message');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const response = await submitEmailDecision({
        id: email.id,
        decision: 'accept',
        refined_quote: draftText.trim(),
        comment: ''
      });
      
      if (response.sent) {
        setIsSent(true);
        setSendSuccess(true);
        setIsEditing(false);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSendSuccess(false);
        }, 3000);
      } else {
        setSendError('Reply was processed but not sent. Please check the status.');
      }
    } catch (err: any) {
      console.error('Failed to send reply:', err);
      setSendError(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Extract summary from trace steps (prefer HITL Decision or other decision steps)
  const getTraceSummary = (): string | null => {
    if (!email.steps || email.steps.length === 0) return null;
    
    // Look for HITL Decision step first
    const hitlStep = email.steps.find((step: any) => {
      const title = (step.title || step.action || '').toLowerCase();
      return title.includes('hitl decision') || title.includes('decision');
    });
    
    if (hitlStep?.summary) {
      return hitlStep.summary;
    }
    
    // Fallback to any step with a summary
    const stepWithSummary = email.steps.find((step: any) => step.summary);
    return stepWithSummary?.summary || null;
  };

  // Strip formatting and inline styles from HTML content
  const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    
    // Remove style attributes and other formatting attributes
    return html
      .replace(/style\s*=\s*["'][^"']*["']/gi, '')
      .replace(/color\s*=\s*["'][^"']*["']/gi, '')
      .replace(/bgcolor\s*=\s*["'][^"']*["']/gi, '')
      .replace(/background\s*=\s*["'][^"']*["']/gi, '')
      .replace(/font-family\s*=\s*["'][^"']*["']/gi, '')
      .replace(/font-size\s*=\s*["'][^"']*["']/gi, '')
      .replace(/font-weight\s*=\s*["'][^"']*["']/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  };

  const traceSummary = getTraceSummary();

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatResponseTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatStepData = (data: any): string => {
    if (!data) return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case 'excel':
      case 'rate_sheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'api':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'database':
        return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepIcon = (title: string = '') => {
    const t = title.toLowerCase();
    if (t.includes('mail') || t.includes('trigger')) return <Mail className="w-4 h-4 text-blue-400" />;
    if (t.includes('source') || t.includes('data')) return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
    if (t.includes('draft') || t.includes('write') || t.includes('reply')) return <Edit className="w-4 h-4 text-emerald-400" />;
    if (t.includes('ai') || t.includes('llm') || t.includes('think') || t.includes('decision')) return <Brain className="w-4 h-4 text-pink-400" />;
    if (t.includes('complete') || t.includes('sent') || t.includes('human')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <Zap className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-400">Received at {new Date(email.timestamp).toLocaleString()}</div>
            <div className="font-semibold text-white">Email from {email.sender_name}</div>
          </div>
          {email.status === 'needs_review' && (
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        <div className="text-sm text-white whitespace-pre-line font-medium mb-2">
          {email.subject}
        </div>
        <div 
          className="text-sm text-white bg-white/5 p-4 rounded-lg email-body-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }}
        />
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Magus Agent Analysis</div>
            {email.backend_status && <div className="text-xs text-gray-400">Status: {email.backend_status}</div>}
          </div>
        </div>

        <div className="space-y-3">
          {email.data_sources.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-2">Sources:</div>
              <div className="space-y-2">
                {email.data_sources.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    {getDataSourceIcon(source.type)}
                    <span className="text-sm text-white">{source.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Confidence</div>
              <div className="text-lg font-bold text-cyan-400">
                {email.confidence 
                  ? email.confidence.charAt(0).toUpperCase() + email.confidence.slice(1)
                  : (email.confidence_score > 0 ? email.confidence_score + '%' : '--')
                }
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Response Time</div>
              <div className="text-lg font-bold text-cyan-400">{formatResponseTime(email.response_time)}</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Draft Section - only show if there is a reply available */}
      {(email.draft_response || isEditing) && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-white">Generated Reply</span>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-all"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {traceSummary && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-blue-400 font-medium mb-1">Summary</div>
                  <div className="text-sm text-gray-300">{traceSummary}</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white font-medium">To: {email.sender_name}</span>
            </div>
            {isEditing ? (
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none resize-none"
                rows={8}
              />
            ) : (
              <div className="text-sm text-gray-300 whitespace-pre-line">
                {draftText}
              </div>
            )}
          </div>

          {sendError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
              <div className="text-sm text-red-400">{sendError}</div>
            </div>
          )}

          {sendSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/50">
              <div className="text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Reply sent successfully!
              </div>
            </div>
          )}

          {isSent ? (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Mail Sent</span>
            </div>
          ) : isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSendError(null);
                  setSendSuccess(false);
                }}
                disabled={isSending}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={isSending || !draftText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSendReply}
              disabled={isSending || !draftText.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reply
                </>
              )}
            </button>
          )}
        </GlassCard>
      )}

      {/* Conversation History */}
      {email.steps && email.steps.length > 0 && (
        <GlassCard className="p-5">
          <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="font-medium">Conversation History</span>
          </div>
          <div className="space-y-4">
            {/* Original Email from Client */}
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-purple-400">Client</span>
                  <span className="text-xs text-gray-500">{new Date(email.timestamp).toLocaleString()}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-white font-medium mb-1">{email.subject}</div>
                  <div className="text-sm text-gray-300 whitespace-pre-line line-clamp-3">{email.body.replace(/<[^>]*>/g, '').substring(0, 200)}</div>
                </div>
              </div>
            </div>

            {/* Decision Steps */}
            {email.steps
              .filter((step: any) => {
                const title = step.title || step.action || '';
                return title.toLowerCase().includes('decision') || 
                       title.toLowerCase().includes('human') ||
                       title.toLowerCase().includes('agent');
              })
              .map((step: any, index: number) => {
                const title = step.title || step.action || 'Decision';
                const isHuman = title.toLowerCase().includes('human');
                const decisionData = step.data || {};
                const refinedQuote = decisionData.refined_quote || decisionData.final_quote || '';
                const decision = decisionData.decision || '';
                
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        isHuman 
                          ? 'bg-emerald-500/20 border-emerald-500' 
                          : 'bg-blue-500/20 border-blue-500'
                      }`}>
                        {isHuman ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Brain className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold ${
                          isHuman ? 'text-emerald-400' : 'text-blue-400'
                        }`}>
                          {isHuman ? 'Human' : 'Agent'}
                        </span>
                        <span className="text-xs text-gray-500">{title}</span>
                        {decision && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            decision === 'accept' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {decision.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {refinedQuote && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-sm text-white whitespace-pre-line">{refinedQuote}</div>
                        </div>
                      )}
                      {step.summary && !refinedQuote && (
                        <div className="text-xs text-gray-400 bg-white/5 rounded-lg p-2">
                          {step.summary}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-5">
        <div className="text-sm text-gray-400 mb-3">Processing Trace</div>
        <div className="space-y-3">
          {email.steps && email.steps.length > 0 ? (
            email.steps.map((step: any, index: number) => {
              const isExpanded = expandedSteps.has(index);
              const hasData = step.data && Object.keys(step.data).length > 0;
              const stepTitle = step.action || step.title || step.step || "Step";
              
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                      {getStepIcon(stepTitle)}
                    </div>
                    {index < email.steps.length - 1 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-cyan-500 opacity-30" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div 
                      className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${hasData ? '' : 'cursor-default'}`}
                      onClick={() => hasData && toggleStep(index)}
                    >
                      <div className="text-sm text-white font-medium flex-1">{stepTitle}</div>
                      {hasData && (
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {step.summary && (
                      <div className="text-xs text-gray-400 mt-1 mb-2">{step.summary}</div>
                    )}
                    
                    {step.llm_usage && (
                      <div className="text-xs text-gray-500 mt-1 mb-2 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1 inline-block">
                        LLM: {step.llm_usage.calls || 0} calls, {step.llm_usage.total_tokens || 0} tokens
                        {step.llm_usage.model && ` (${step.llm_usage.model})`}
                      </div>
                    )}
                    
                    {isExpanded && hasData && (
                      <div className="mt-2 bg-white/5 rounded-lg p-3 border border-white/10 overflow-x-auto">
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
                          {formatStepData(step.data)}
                        </pre>
                      </div>
                    )}
                    
                    {(step.output || step.reason) && !isExpanded && (
                      <div className="text-xs text-gray-500 line-clamp-3 mt-1 bg-white/5 p-2 rounded">
                        {typeof (step.output || step.reason) === 'string' ? (step.output || step.reason) : JSON.stringify(step.output || step.reason)}
                      </div>
                    )}
                    
                    {step.timestamp && (
                      <div className="text-xs text-gray-600 mt-1">{new Date(step.timestamp).toLocaleTimeString()}</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 italic">No trace steps available.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

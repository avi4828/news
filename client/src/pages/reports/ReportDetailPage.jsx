import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Download, ExternalLink, Loader2, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TrustMeter from '../../components/TrustMeter';
import AlertBanner from '../../components/AlertBanner';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data.data);
        
        // Fetch full article for all the details
        if (res.data.data.articleId?._id) {
          // Since we don't have a specific article endpoint yet, we'll just use the snapshot
          // In a full implementation, you'd fetch the full article document here to get all claims/agent reports
          setArticle(res.data.data.articleId);
        }
      } catch (err) {
        toast.error('Failed to load report details');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `truthlens-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF Downloaded');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-tl-accent" size={32} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-tl-text mb-2">Report Not Found</h2>
        <Link to="/reports" className="text-tl-accent hover:underline">Return to reports</Link>
      </div>
    );
  }

  const snap = report.analysisSnapshot;
  const isImage = article?.inputType === 'image';
  const isUrl = article?.inputType === 'url';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/reports" className="p-2 rounded-lg bg-tl-surface border border-tl-border hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-tl-text">Analysis Report</h1>
            <p className="text-tl-muted text-xs mt-1">ID: {report._id} • {new Date(report.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="btn-secondary flex items-center gap-2"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download PDF
        </button>
      </div>

      <AlertBanner verdict={snap?.finalVerdict} explanation={snap?.explanation} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Col: Source Info & Trust Meter */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 flex justify-center items-center py-8">
            <TrustMeter score={snap?.trustScore || 0} size={180} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-tl-muted mb-4 flex items-center gap-2">
              <Info size={16} /> Source Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-tl-muted mb-1">Input Type</p>
                <span className="badge badge-info uppercase">{article?.inputType || 'Unknown'}</span>
              </div>
              
              {isUrl && article?.sourceURL && (
                <div>
                  <p className="text-xs text-tl-muted mb-1">Source URL</p>
                  <a href={article.sourceURL} target="_blank" rel="noopener noreferrer" className="text-sm text-tl-accent hover:underline flex items-start gap-1 break-all">
                    {article.sourceURL} <ExternalLink size={12} className="mt-1 flex-shrink-0" />
                  </a>
                </div>
              )}
              
              {isImage && (
                <div>
                  <p className="text-xs text-tl-muted mb-1">Status</p>
                  <p className="text-sm flex items-center gap-1 text-tl-text">
                    <CheckCircle2 size={14} className="text-tl-success" /> OCR Extraction Complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Detailed Scores */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-0 overflow-hidden">
            <div className="p-5 border-b border-tl-border bg-tl-surface/50">
              <h3 className="text-lg font-bold">Intelligence Breakdown</h3>
            </div>
            
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScoreCard 
                title="Fake News Probability" 
                value={`${snap?.fakeProbability || 0}%`} 
                desc="Likelihood of being completely fabricated"
                isHighBad={true}
                score={snap?.fakeProbability || 0}
              />
              <ScoreCard 
                title="Fact Match Confidence" 
                value={`${snap?.factMatch || 0}%`} 
                desc="Percentage of claims verified via trusted sources"
                isHighBad={false}
                score={snap?.factMatch || 0}
              />
              <ScoreCard 
                title="AI-Generated Content" 
                value={`${snap?.aiGeneratedProbability || 0}%`} 
                desc="Probability text was written by an LLM"
                isHighBad={true}
                score={snap?.aiGeneratedProbability || 0}
              />
              <div className="p-4 rounded-xl border border-tl-border bg-tl-surface">
                <h4 className="text-xs font-semibold text-tl-muted uppercase mb-1">Bias Level</h4>
                <div className="text-xl font-bold mb-1 text-violet-400">{snap?.biasLevel || 'Unknown'}</div>
                <p className="text-xs text-tl-muted">Detected emotional manipulation or propaganda</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-tl-warning bg-amber-950/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Disclaimer
            </h3>
            <p className="text-sm text-tl-muted leading-relaxed">
              This analysis was generated autonomously by a multi-agent AI system. While designed to detect misinformation patterns, fact mismatches, and AI generation, it may occasionally produce false positives. Always verify critical information independently using recognized trusted sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, value, desc, isHighBad, score }) {
  let color = 'text-tl-success';
  if (isHighBad) {
    if (score >= 60) color = 'text-tl-danger';
    else if (score >= 35) color = 'text-tl-warning';
  } else {
    if (score < 40) color = 'text-tl-danger';
    else if (score < 70) color = 'text-tl-warning';
  }

  return (
    <div className="p-4 rounded-xl border border-tl-border bg-tl-surface transition-all hover:border-tl-border/80">
      <h4 className="text-xs font-semibold text-tl-muted uppercase mb-1">{title}</h4>
      <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
      <p className="text-xs text-tl-muted">{desc}</p>
    </div>
  );
}

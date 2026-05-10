import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, FileText, Image as ImageIcon, ArrowRight, ShieldCheck, FileWarning, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, fakeNews: 0, avgTrust: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports?limit=5');
        const reports = res.data.data;
        
        setRecent(reports);
        
        // Calculate basic stats from recent
        if (reports.length > 0) {
          const fakeCount = reports.filter(r => r.analysisSnapshot?.fakeProbability >= 65).length;
          const avgT = reports.reduce((acc, r) => acc + (r.analysisSnapshot?.trustScore || 0), 0) / reports.length;
          setStats({
            total: res.data.pagination.total,
            fakeNews: fakeCount, // Just from recent for now, ideally backend provides this
            avgTrust: Math.round(avgT)
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-tl-text">Welcome back</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/analyze/url" className="card p-6 hover:border-tl-accent/50 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Search size={20} />
          </div>
          <h3 className="text-lg font-medium mb-1">Analyze URL</h3>
          <p className="text-sm text-tl-muted">Check news articles and websites</p>
        </Link>
        <Link to="/analyze/text" className="card p-6 hover:border-violet-500/50 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
          <h3 className="text-lg font-medium mb-1">Analyze Text</h3>
          <p className="text-sm text-tl-muted">Check raw text and claims</p>
        </Link>
        <Link to="/analyze/image" className="card p-6 hover:border-emerald-500/50 transition-colors group">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ImageIcon size={20} />
          </div>
          <h3 className="text-lg font-medium mb-1">Analyze Image</h3>
          <p className="text-sm text-tl-muted">Check screenshots and memes</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 border-l-4 border-l-tl-accent">
            <div className="flex items-center gap-3 mb-2 text-tl-muted">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">Total Analyses</span>
            </div>
            <div className="text-3xl font-bold">{loading ? '-' : stats.total}</div>
          </div>
          <div className="card p-5 border-l-4 border-l-tl-danger">
            <div className="flex items-center gap-3 mb-2 text-tl-muted">
              <FileWarning size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">High Risk Content</span>
            </div>
            <div className="text-3xl font-bold text-tl-danger">{loading ? '-' : stats.fakeNews}</div>
          </div>
          <div className="card p-5 border-l-4 border-l-tl-success">
            <div className="flex items-center gap-3 mb-2 text-tl-muted">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium uppercase tracking-wider">Avg Trust Score</span>
            </div>
            <div className="text-3xl font-bold text-tl-success">{loading ? '-' : stats.avgTrust}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-tl-border flex justify-between items-center bg-tl-surface/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock size={18} className="text-tl-accent" /> Recent Activity
            </h2>
            <Link to="/reports" className="text-sm text-tl-accent hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-8 flex justify-center text-tl-muted">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-tl-muted">
                No analyses yet. Start by checking a URL.
              </div>
            ) : (
              <ul className="divide-y divide-tl-border">
                {recent.map((report) => (
                  <li key={report._id}>
                    <Link to={`/reports/${report._id}`} className="flex items-center p-4 hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-tl-surface border border-tl-border flex items-center justify-center flex-shrink-0 mr-4">
                        {report.articleId?.inputType === 'url' ? <Search size={16} className="text-cyan-400" /> :
                         report.articleId?.inputType === 'image' ? <ImageIcon size={16} className="text-emerald-400" /> :
                         <FileText size={16} className="text-violet-400" />}
                      </div>
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-tl-text truncate">
                          {report.title || 'Analysis Report'}
                        </p>
                        <p className="text-xs text-tl-muted truncate">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-sm font-bold ${
                          (report.analysisSnapshot?.fakeProbability || 0) >= 65 ? 'text-tl-danger' : 
                          (report.analysisSnapshot?.fakeProbability || 0) >= 35 ? 'text-tl-warning' : 'text-tl-success'
                        }`}>
                          {report.analysisSnapshot?.finalVerdict || 'Unknown'}
                        </div>
                        <div className="text-xs text-tl-muted">
                          Trust: {report.analysisSnapshot?.trustScore || 0}/100
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

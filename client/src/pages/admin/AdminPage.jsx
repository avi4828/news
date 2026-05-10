import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, FileText, AlertTriangle, Activity, Database, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-tl-accent" size={32} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-tl-text">System Analytics</h1>
        <p className="text-tl-muted text-sm mt-1">Platform-wide overview of user activity and misinformation trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-tl-accent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-tl-muted uppercase mb-1">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.overview?.totalUsers || 0}</h3>
            </div>
            <div className="p-2 bg-tl-surface rounded-lg text-tl-accent"><Users size={20} /></div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-violet-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-tl-muted uppercase mb-1">Total Analyses</p>
              <h3 className="text-2xl font-bold">{stats.overview?.totalAnalyses || 0}</h3>
            </div>
            <div className="p-2 bg-tl-surface rounded-lg text-violet-400"><Activity size={20} /></div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-tl-success">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-tl-muted uppercase mb-1">Reports Gen</p>
              <h3 className="text-2xl font-bold">{stats.overview?.totalReports || 0}</h3>
            </div>
            <div className="p-2 bg-tl-surface rounded-lg text-tl-success"><FileText size={20} /></div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-tl-danger">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-tl-muted uppercase mb-1">Avg Fake %</p>
              <h3 className="text-2xl font-bold text-tl-danger">
                {Math.round(stats.avgScores?.avgFakeProbability || 0)}%
              </h3>
            </div>
            <div className="p-2 bg-tl-surface rounded-lg text-tl-danger"><AlertTriangle size={20} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Distribution */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-tl-border bg-tl-surface/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-tl-muted flex items-center gap-2">
              <Database size={16} /> Verdict Distribution
            </h3>
          </div>
          <div className="p-5 flex-1 overflow-auto max-h-80">
            {stats.verdictBreakdown?.length === 0 ? (
              <p className="text-tl-muted text-sm">No data available.</p>
            ) : (
              <div className="space-y-4">
                {stats.verdictBreakdown?.map((item) => {
                  const percent = Math.round((item.count / (stats.overview.totalAnalyses || 1)) * 100);
                  const isFake = item._id?.includes('Fake') || item._id?.includes('Dangerous');
                  return (
                    <div key={item._id || 'unknown'}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-tl-text">{item._id || 'Unknown'}</span>
                        <span className="text-tl-muted">{item.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-tl-surface rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isFake ? 'bg-tl-danger' : 'bg-tl-success'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-tl-border bg-tl-surface/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-tl-muted flex items-center gap-2">
              <Activity size={16} /> Recent Platform Activity
            </h3>
          </div>
          <div className="flex-1 overflow-auto max-h-80">
            {stats.recentActivity?.length === 0 ? (
              <div className="p-5 text-tl-muted text-sm">No recent activity.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-tl-surface/30 uppercase text-tl-muted">
                  <tr>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Verdict</th>
                    <th className="px-4 py-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tl-border">
                  {stats.recentActivity?.map((act) => (
                    <tr key={act._id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium truncate max-w-[100px]">{act.userId?.username || 'Unknown'}</td>
                      <td className="px-4 py-3 uppercase">{act.inputType}</td>
                      <td className={`px-4 py-3 font-semibold ${act.analysisResult?.fakeProbability >= 65 ? 'text-tl-danger' : 'text-tl-success'}`}>
                        {act.analysisResult?.finalVerdict || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-right text-tl-muted whitespace-nowrap">
                        {new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

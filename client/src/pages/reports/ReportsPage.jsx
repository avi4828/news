import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen, Search, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports?page=${pageNum}&limit=10`);
      setReports(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted');
      fetchReports(page);
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `truthlens-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
  };

  const getVerdictColor = (verdict) => {
    if (!verdict) return 'text-tl-muted';
    if (verdict.includes('Accurate')) return 'text-tl-success';
    if (verdict.includes('Mixed')) return 'text-tl-warning';
    return 'text-tl-danger';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tl-text">Analysis Reports</h1>
          <p className="text-tl-muted text-sm mt-1">View and download your historical AI intelligence reports.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-tl-muted">
            <thead className="bg-tl-surface/50 text-xs uppercase border-b border-tl-border">
              <tr>
                <th className="px-6 py-4 font-medium text-tl-text">Source / Input</th>
                <th className="px-6 py-4 font-medium text-tl-text">Verdict</th>
                <th className="px-6 py-4 font-medium text-tl-text">Trust Score</th>
                <th className="px-6 py-4 font-medium text-tl-text">Date</th>
                <th className="px-6 py-4 font-medium text-tl-text text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tl-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-tl-surface rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-tl-surface rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-tl-surface rounded w-1/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-tl-surface rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-tl-surface rounded w-full"></div></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-tl-muted">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <p>No reports found. Start by running an analysis.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-tl-text">
                      <Link to={`/reports/${report._id}`} className="flex items-center gap-3 hover:text-tl-accent transition-colors">
                        <div className="w-8 h-8 rounded bg-tl-surface border border-tl-border flex items-center justify-center flex-shrink-0">
                          {report.articleId?.inputType === 'url' ? <Search size={14} className="text-cyan-400" /> :
                           report.articleId?.inputType === 'image' ? <ImageIcon size={14} className="text-emerald-400" /> :
                           <FileText size={14} className="text-violet-400" />}
                        </div>
                        <span className="truncate max-w-[200px] md:max-w-[300px]">
                          {report.articleId?.sourceURL || report.title || 'Extracted Text / Image'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <span className={getVerdictColor(report.analysisSnapshot?.finalVerdict)}>
                        {report.analysisSnapshot?.finalVerdict || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.analysisSnapshot?.trustScore || 0}/100
                    </td>
                    <td className="px-6 py-4">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/reports/${report._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-tl-surface border border-tl-border text-xs hover:border-tl-accent hover:text-tl-accent transition-colors"
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => handleDownloadPDF(report._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-tl-surface border border-tl-border text-xs hover:border-tl-accent hover:text-tl-accent transition-colors"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(report._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-tl-surface border border-tl-border text-xs hover:border-tl-danger hover:text-tl-danger transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-tl-border flex justify-between items-center bg-tl-surface/30">
            <button 
              onClick={() => fetchReports(page - 1)} 
              disabled={page === 1}
              className="px-3 py-1 rounded bg-tl-surface border border-tl-border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-tl-muted">Page {page} of {totalPages}</span>
            <button 
              onClick={() => fetchReports(page + 1)} 
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-tl-surface border border-tl-border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

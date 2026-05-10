import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AgentProgress from '../../components/AgentProgress';

export default function AnalyzeURLPage() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setAnalyzing(true);
    setStep(1); // Content extraction

    try {
      // Simulate pipeline progress for UI UX since actual backend is a single endpoint currently
      const progressTimer1 = setTimeout(() => setStep(2), 2000); // Parallel agents
      const progressTimer2 = setTimeout(() => setStep(3), 6000); // Final judge

      const res = await api.post('/analyze/url', { url });
      
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      
      setStep(4); // Done
      toast.success('Analysis complete');
      
      setTimeout(() => {
        navigate(`/reports/${res.data.reportId}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Analysis failed');
      setAnalyzing(false);
      setStep(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tl-text">Analyze URL</h1>
        <p className="text-tl-muted text-sm mt-1">Submit a news article or blog post URL for multi-agent fact verification.</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tl-text mb-2">Article URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-tl-muted" />
              </div>
              <input
                type="url"
                className="input-field pl-10 h-12 text-lg"
                placeholder="https://example.com/news-article..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={analyzing}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={analyzing || !url}
            className="btn-primary w-full h-12 text-lg flex justify-center items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing via AI Agents...
              </>
            ) : (
              'Run Multi-Agent Analysis'
            )}
          </button>
        </form>
      </div>

      {analyzing && (
        <div className="animate-slide-up">
          <AgentProgress currentStep={step} completed={step === 4} />
        </div>
      )}
    </div>
  );
}

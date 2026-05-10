import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AgentProgress from '../../components/AgentProgress';

export default function AnalyzeTextPage() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text || text.length < 50) {
      toast.error('Please enter at least 50 characters for accurate analysis.');
      return;
    }

    setAnalyzing(true);
    setStep(1);

    try {
      const progressTimer1 = setTimeout(() => setStep(2), 1500); 
      const progressTimer2 = setTimeout(() => setStep(3), 5000); 

      const res = await api.post('/analyze/text', { text });
      
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      
      setStep(4);
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tl-text">Analyze Raw Text</h1>
        <p className="text-tl-muted text-sm mt-1">Paste an article body, suspicious email, or claims for deep analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tl-text mb-2 flex justify-between">
                <span>Text Content</span>
                <span className={`text-xs ${text.length < 50 ? 'text-tl-danger' : 'text-tl-success'}`}>
                  {text.length} chars (min 50)
                </span>
              </label>
              <textarea
                className="input-field h-64 resize-none font-mono text-sm leading-relaxed"
                placeholder="Paste the text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={analyzing}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={analyzing || text.length < 50}
              className="btn-primary w-full h-12 text-lg flex justify-center items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Analyze Text
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {analyzing ? (
            <div className="animate-slide-up h-full">
              <AgentProgress currentStep={step} completed={step === 4} />
            </div>
          ) : (
            <div className="card p-6 h-full flex flex-col justify-center text-center text-tl-muted">
              <div className="w-16 h-16 rounded-full bg-tl-surface flex items-center justify-center mx-auto mb-4 border border-tl-border">
                <FileText size={24} className="text-violet-400 opacity-50" />
              </div>
              <p className="text-sm">
                Our AI agents will analyze the text for sentiment, political bias, emotional manipulation, and known misinformation patterns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

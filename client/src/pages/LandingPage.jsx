import { ShieldCheck, ArrowRight, Zap, Target, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-tl-bg text-tl-text flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-tl-accent/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tl-accent2/20 blur-[120px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-tl-accent animate-pulse" />
          <span className="text-sm text-tl-muted">Multi-Agent Intelligence Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
          Uncover Truth with <br />
          <span className="gradient-text">Advanced AI Analysis</span>
        </h1>

        <p className="text-lg md:text-xl text-tl-muted max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
          TruthLens utilizes a network of 6 specialized AI agents to analyze articles, detect bias, 
          verify claims, and identify AI-generated content in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
            Start Analyzing <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4 bg-transparent">
            Sign In
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="card-glass p-6 text-left hover:border-tl-accent/40 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-tl-accent/10 flex items-center justify-center mb-4 text-tl-accent">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
            <p className="text-sm text-tl-muted">Instantly verify URLs, raw text, or screenshots with our blazing-fast pipeline.</p>
          </div>
          <div className="card-glass p-6 text-left hover:border-tl-accent/40 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Agent Architecture</h3>
            <p className="text-sm text-tl-muted">6 independent AI agents cross-reference data to provide a highly accurate consensus.</p>
          </div>
          <div className="card-glass p-6 text-left hover:border-tl-accent/40 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Reporting</h3>
            <p className="text-sm text-tl-muted">Generate comprehensive PDF intelligence reports for deep investigative research.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

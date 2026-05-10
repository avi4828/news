import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const AGENTS = [
  { id: 'contentExtraction', name: 'Content Extraction', desc: 'Extracting & cleaning article content', color: 'text-cyan-400' },
  { id: 'factVerification', name: 'Fact Verification', desc: 'Cross-referencing claims with trusted sources', color: 'text-blue-400' },
  { id: 'sourceCredibility', name: 'Source Credibility', desc: 'Analyzing domain reputation & trust score', color: 'text-violet-400' },
  { id: 'biasDetection', name: 'Bias Detection', desc: 'Detecting propaganda & emotional manipulation', color: 'text-amber-400' },
  { id: 'aiContentDetection', name: 'AI Content Detection', desc: 'Analyzing linguistic patterns for AI generation', color: 'text-pink-400' },
  { id: 'finalJudge', name: 'Final Judge', desc: 'Aggregating all scores & generating verdict', color: 'text-emerald-400' },
];

export default function AgentProgress({ currentStep = 0, completed = false }) {
  // currentStep: 0=none, 1=agent1 running, 2=agent2-5 running, 3=agent6 running, 4=done
  const getStatus = (index) => {
    if (completed) return 'done';
    if (index === 0 && currentStep === 1) return 'active';
    if (index >= 1 && index <= 4 && currentStep === 2) return 'active';
    if (index === 5 && currentStep === 3) return 'active';
    if (currentStep === 4 || (completed && index < currentStep)) return 'done';
    if (completed) return 'done';
    // Determine done vs pending
    if (currentStep > 1 && index === 0) return 'done';
    if (currentStep > 2 && index >= 1 && index <= 4) return 'done';
    if (currentStep > 3 && index === 5) return 'done';
    return 'pending';
  };

  return (
    <div className="card p-5 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-tl-text">Multi-Agent Analysis Pipeline</h3>
        {completed ? (
          <span className="badge badge-success">Complete</span>
        ) : (
          <span className="badge badge-info">Running</span>
        )}
      </div>
      {AGENTS.map((agent, index) => {
        const status = getStatus(index);
        return (
          <div key={agent.id} className={`agent-step ${status}`}>
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {status === 'done' && <CheckCircle2 size={16} className="text-tl-success" />}
              {status === 'active' && <Loader2 size={16} className="text-tl-accent animate-spin" />}
              {status === 'pending' && <Circle size={16} className="text-tl-muted" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-semibold ${status === 'done' ? 'text-tl-success' : status === 'active' ? agent.color : 'text-tl-muted'}`}>
                  {agent.name}
                </p>
                {index >= 1 && index <= 4 && (
                  <span className="text-[9px] text-tl-muted bg-tl-border/30 px-1.5 py-0.5 rounded-full">Parallel</span>
                )}
              </div>
              <p className="text-[11px] text-tl-muted truncate">{agent.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

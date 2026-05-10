import { AlertTriangle, CheckCircle2, XCircle, AlertOctagon, HelpCircle, Shield } from 'lucide-react';

const VERDICTS = {
  'Verified Accurate': { icon: CheckCircle2, bg: 'bg-emerald-950', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-glow-green', badge: 'badge-success' },
  'Mostly Accurate': { icon: Shield, bg: 'bg-teal-950', border: 'border-teal-500/40', text: 'text-teal-400', glow: '', badge: 'badge-success' },
  'Mixed': { icon: HelpCircle, bg: 'bg-amber-950', border: 'border-amber-500/40', text: 'text-amber-400', glow: '', badge: 'badge-warning' },
  'Likely Misleading': { icon: AlertTriangle, bg: 'bg-orange-950', border: 'border-orange-500/40', text: 'text-orange-400', glow: '', badge: 'badge-warning' },
  'Likely Fake News': { icon: XCircle, bg: 'bg-red-950', border: 'border-red-500/40', text: 'text-red-400', glow: 'shadow-glow-red', badge: 'badge-danger' },
  'Dangerous Misinformation': { icon: AlertOctagon, bg: 'bg-red-950', border: 'border-red-600/60', text: 'text-red-400', glow: 'shadow-glow-red', badge: 'badge-danger' },
};

export default function AlertBanner({ verdict, explanation }) {
  const config = VERDICTS[verdict] || VERDICTS['Mixed'];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-5 ${config.bg} ${config.border} ${config.glow} animate-fade-in`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-black/30`}>
          <Icon size={24} className={config.text} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-lg ${config.text}`}>{verdict}</h3>
            <span className={config.badge}>AI Verdict</span>
          </div>
          {explanation && (
            <p className="text-sm text-tl-muted leading-relaxed">{explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

/**
 * Animated circular trust meter gauge
 */
export default function TrustMeter({ score = 0, size = 140, label = 'Trust Score' }) {
  const circleRef = useRef(null);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - (score / 100) * circumference;
    circleRef.current.style.strokeDashoffset = offset;
  }, [score, circumference]);

  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  const bgColor = score >= 70 ? '#10b98120' : score >= 45 ? '#f59e0b20' : '#ef444420';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          {/* Score arc */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-tl-muted">/100</span>
        </div>
      </div>
      <p className="text-xs font-medium text-tl-muted">{label}</p>
    </div>
  );
}

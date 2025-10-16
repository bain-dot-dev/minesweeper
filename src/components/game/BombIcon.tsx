/**
 * Mission Impossible styled bomb icon with digital countdown display
 */

'use client';

interface BombIconProps {
  className?: string;
  isExploding?: boolean;
}

export function BombIcon({ className = "w-6 h-6", isExploding = false }: BombIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="bombGradient" cx="40%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Main bomb body */}
      <circle
        cx="12"
        cy="14"
        r="7"
        fill="#1a1a1a"
        stroke="#DC2626"
        strokeWidth="1.5"
      />

      {/* 3D highlight effect */}
      <ellipse
        cx="10"
        cy="12"
        rx="3"
        ry="4"
        fill="url(#bombGradient)"
        opacity="0.3"
      />

      {/* Fuse */}
      <path
        d="M16,9 Q18,7 19,6"
        stroke="#4a4a4a"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Animated spark */}
      <circle
        cx="19"
        cy="6"
        r={isExploding ? "3" : "2"}
        fill={isExploding ? "#FCD34D" : "#EA580C"}
        filter="url(#glow)"
      >
        {!isExploding && (
          <>
            <animate
              attributeName="r"
              values="2;3;2"
              dur="0.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill"
              values="#EA580C;#FCD34D;#EA580C"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>

      {/* Digital countdown display on bomb */}
      <text
        x="12"
        y="15.5"
        fontFamily="'Share Tech Mono', monospace"
        fontSize="4"
        fill="#10F970"
        textAnchor="middle"
        style={{ textShadow: '0 0 2px #10F970' }}
      >
        {isExploding ? "!!" : "00"}
      </text>

      {/* Explosion particles when exploding */}
      {isExploding && (
        <g>
          <circle cx="12" cy="14" r="10" fill="#FFFF00" opacity="0.3">
            <animate attributeName="r" from="7" to="15" dur="0.3s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="0.3s" />
          </circle>
        </g>
      )}
    </svg>
  );
}

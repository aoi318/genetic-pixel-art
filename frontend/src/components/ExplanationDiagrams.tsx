import React from 'react';

export const CrossoverDiagram: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-32">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>

        {/* Parent A */}
        <g transform="translate(20, 20)">
            <rect x="0" y="0" width="60" height="60" rx="8" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="2" />
            <text x="30" y="35" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">Parent A</text>
        </g>

        {/* Parent B */}
        <g transform="translate(120, 20)">
            <rect x="0" y="0" width="60" height="60" rx="8" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="2" />
            <text x="30" y="35" textAnchor="middle" fill="#8b5cf6" fontSize="12" fontWeight="bold">Parent B</text>
        </g>

        {/* Arrow & Child */}
        <g transform="translate(70, 70)">
            {/* 混ぜ合わせる矢印アニメーション */}
            <path d="M 0 0 Q 30 40 60 0" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        </g>

        <text x="100" y="110" textAnchor="middle" fill="#64748b" fontSize="12">Mix DNA</text>
    </svg>
);

export const MutationDiagram: React.FC = () => (
    <svg viewBox="0 0 200 100" className="w-full h-24">
        {/* Grid */}
        <g transform="translate(70, 10)">
            <rect x="0" y="0" width="60" height="60" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
            {/* Pixels */}
            <rect x="10" y="10" width="15" height="15" fill="#cbd5e1" rx="2" />
            <rect x="35" y="10" width="15" height="15" fill="#cbd5e1" rx="2" />
            <rect x="10" y="35" width="15" height="15" fill="#cbd5e1" rx="2" />

            {/* Mutating Pixel (Red) */}
            <rect x="35" y="35" width="15" height="15" fill="#ef4444" rx="2">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </rect>
        </g>

        <text x="100" y="90" textAnchor="middle" fill="#64748b" fontSize="12">Mutation</text>
    </svg>
);
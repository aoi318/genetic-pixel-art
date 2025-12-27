import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    title: string;
    code: string;
    language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ title, code, language = 'rust' }) => {
    return (
        <div className="rounded-lg overflow-hidden border border-gray-200/20 shadow-lg my-4 font-mono text-sm">
            {/* Mac Terminal-like Header */}
            <div className="bg-[#1e1e1e] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-2 text-gray-400 text-xs">{title}</span>
            </div>

            {/* Code Area */}
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};
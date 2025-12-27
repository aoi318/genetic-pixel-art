// src/components/AlgorithmModal.tsx

import React, { useState } from 'react';
import { X, Cpu, Sprout, BookOpen, Layers } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { CrossoverDiagram, MutationDiagram } from './ExplanationDiagrams';

interface AlgorithmModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AlgorithmModal: React.FC<AlgorithmModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'basic' | 'tech'>('basic');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop (Glass effect) */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white/90 backdrop-blur-md w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/20">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        How it works
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tab Switcher (Apple Segmented Control style) */}
                <div className="px-6 py-4 pb-0">
                    <div className="flex p-1 bg-gray-100/80 rounded-lg">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${activeTab === 'basic' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Sprout className="w-4 h-4" />
                            Basic Concept
                        </button>
                        <button
                            onClick={() => setActiveTab('tech')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${activeTab === 'tech' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Cpu className="w-4 h-4" />
                            Tech Specs (Rust/Wasm)
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* --- Basic Tab --- */}
                    {activeTab === 'basic' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800">🌱 進化の仕組み</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    このアプリは、生物の進化を模倣して絵を描きます。
                                    最初はランダムなノイズですが、「よりターゲットに近い絵」が生き残り、子孫を残すことで徐々に絵が完成していきます。
                                </p>
                            </section>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                        <Layers className="w-4 h-4" />
                                        1. 交叉 (Crossover)
                                    </h4>
                                    <p className="text-sm text-blue-900/70 mb-4">
                                        2つの親の遺伝子（色データ）を混ぜ合わせて、新しい子供を作ります。
                                    </p>
                                    <CrossoverDiagram />
                                </div>

                                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                                        <Cpu className="w-4 h-4" />
                                        2. 突然変異 (Mutation)
                                    </h4>
                                    <p className="text-sm text-purple-900/70 mb-4">
                                        低い確率で色をランダムに変化させます。これが「偶然の発見」を生みます。
                                    </p>
                                    <MutationDiagram />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Tech Tab --- */}
                    {activeTab === 'tech' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">⚡ Performance Evolution</h3>
                                <p className="text-gray-600 mb-4">
                                    初期実装から最新版への最適化により、
                                    世代更新の速度が<strong className="text-green-600">約15倍</strong>（8.05s → 0.55s）に向上しました。
                                </p>

                                <div className="space-y-6">
                                    {/* 1. Zero-Allocation */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">1</span>
                                            Zero-Allocation Evolution
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3 ml-8">
                                            初期版では世代交代のたびに<code>Vec::new()</code>で新しいメモリを確保していましたが、
                                            最新版では事前確保したバッファを再利用することで、アロケーションを完全に排除しました。
                                        </p>
                                        <CodeBlock
                                            title="ga.rs (初期版) → ga.rs (最適化版)"
                                            code={`// Before: 毎回新しいVecを作成
let mut next_generation = Vec::with_capacity(size);
let mut child = parent1.crossover(parent2);
next_generation.push(child);

// After: バッファを再利用
// Population構造体にbuffer: Vec<Individual>を追加
p1.crossover_into(p2, &mut buffer[i]);
buffer[i].mutate(mutation_rate);
std::mem::swap(&mut individuals, &mut buffer);`}
                                        />
                                    </div>

                                    {/* 2. Island Model + Parallel */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                                            Island Model + Parallel Processing
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3 ml-8">
                                            初期版は単一集団でしたが、最新版では複数の島に分割し、Rayonで並列処理。
                                            各島が独立進化し、定期的に優秀な個体を交換することで、多様性と速度を両立しました。
                                        </p>
                                        <CodeBlock
                                            title="lib.rs (初期版) → lib.rs (最適化版)"
                                            code={`// Before: 単一集団
pub struct GeneticModel {
    population: Population,
    target: Vec<u8>,
}

// After: 島モデル + 並列処理
pub struct GeneticModel {
    islands: Vec<Population>,  // 4つの島
    target: Vec<u8>,
    migration_buffer: Vec<Individual>,  // 再利用バッファ
}

// 各島を並列進化
islands.par_iter_mut().for_each(|island| {
    island.evolve(target, rate, true);
});`}
                                        />
                                    </div>

                                    {/* 3. Smart Random */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                                            Smart Random Number Generation
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3 ml-8">
                                            初期版は全ピクセルで乱数判定していましたが、最新版では変異数を事前計算し、
                                            必要な回数だけ乱数生成することで、CPU負荷を大幅削減しました。
                                        </p>
                                        <CodeBlock
                                            title="ga.rs (初期版) → ga.rs (最適化版)"
                                            code={`// Before: 全要素で乱数判定 (4096回)
for val in self.dna.iter_mut() {
    if rng.random::<f64>() < mutation_rate {
        *val = (*val as i16 + noise).clamp(0, 255) as u8;
    }
}

// After: 変異数を計算して必要な回数だけ実行
let num_mutations = (len as f64 * mutation_rate).max(1.0) as usize;
for _ in 0..num_mutations {
    let idx = rng.random_range(0..len);
    self.dna[idx] = (self.dna[idx] as i16 + noise).clamp(0, 255) as u8;
}`}
                                        />
                                    </div>

                                    {/* 4. Adaptive Mutation */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">4</span>
                                            Adaptive Mutation Rate
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3 ml-8">
                                            初期版は固定の変異率（0.05）でしたが、最新版では適応度に応じて変異率を自動調整。
                                            収束が近づくと変異を抑え、細部を洗練できるようになりました。
                                        </p>
                                        <CodeBlock
                                            title="lib.rs (初期版) → lib.rs (最適化版)"
                                            code={`// Before: 固定値
pub fn step(&mut self) {
    self.population.evolve(&self.target, 0.05);
}

// After: 適応度に応じて自動調整
if current_fitness > 0.99 {
        base_rate * 0.3
    } else if current_fitness > 0.98 {
        base_rate * 0.5
    } else if current_fitness > 0.97 {
        base_rate * 0.7
    } else if current_fitness > 0.95 {
        base_rate * 0.8
    } else if current_fitness > 0.90 {
        base_rate * 0.9
    } else {
        base_rate
    }`}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
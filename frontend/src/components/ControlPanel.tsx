import React from 'react';
import { Play, Pause, RotateCcw, Settings, Activity, Cpu, Eye, EyeOff } from 'lucide-react';

type Props = {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onReset: () => void;
    updateInterval: number;
    setUpdateInterval: (interval: number) => void;
    generation: number;
    fitness: number;
    populationSize: number;
    setPopulationSize: (size: number) => void;
    mutationRate: number;
    setMutationRate: (rate: number) => void;
    isAutoMutation: boolean;
    setIsAutoMutation: (isAuto: boolean) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    isParallel: boolean;
    setIsParallel: (isParallel: boolean) => void;
    fps: number;
    isBenchmarkMode: boolean;
    setIsBenchmarkMode: (enabled: boolean) => void;
    benchmarkTarget: number;
    setBenchmarkTarget: (target: number) => void;
    benchmarkResults: { time: number; generation: number } | null;
    isVisualUpdateEnabled: boolean;
    setIsVisualUpdateEnabled: (enabled: boolean) => void;
};

export const ControlPanel: React.FC<Props> = ({
    isPlaying,
    onTogglePlay,
    onReset,
    updateInterval,
    setUpdateInterval,
    generation,
    fitness,
    populationSize,
    setPopulationSize,
    mutationRate,
    setMutationRate,
    isAutoMutation,
    setIsAutoMutation,
    gridSize,
    setGridSize,
    isParallel,
    setIsParallel,
    fps,
    isBenchmarkMode,
    setIsBenchmarkMode,
    benchmarkTarget,
    setBenchmarkTarget,
    benchmarkResults,
    isVisualUpdateEnabled,
    setIsVisualUpdateEnabled,
}) => {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-6 w-full max-w-md mx-auto flex flex-col gap-6">

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50/50 rounded-2xl">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Generation</span>
                    <span className="text-2xl font-bold text-gray-800 tabular-nums">{generation.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50/50 rounded-2xl">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Fitness</span>
                    <span className="text-2xl font-bold text-gray-800 tabular-nums">{(fitness * 100).toFixed(2)}<span className="text-sm text-gray-400 ml-1">%</span></span>
                </div>
            </div>

            {/* Speed Indicator */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Processing Speed</span>
                </div>
                <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    {fps} gen/s
                </span>
            </div>

            {/* Main Controls */}
            <div className="flex gap-3">
                <button
                    onClick={onTogglePlay}
                    className={`flex-1 py-3 px-6 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
            ${isPlaying
                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    {isPlaying ? 'Pause' : 'Start Evolution'}
                </button>
                <button
                    onClick={onReset}
                    className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95 flex items-center justify-center"
                    title="Reset"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Parallel Processing Toggle */}
                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isParallel ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Cpu className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Parallel Processing</span>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isParallel ? 'bg-purple-600' : 'bg-gray-200'}`}>
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={isParallel}
                            onChange={(e) => setIsParallel(e.target.checked)}
                        />
                        <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isParallel ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                </label>

                {/* Display Update Rate Toggle & Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isVisualUpdateEnabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                                {isVisualUpdateEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700">Display Updates</span>
                        </div>

                        {/* Toggle Switch */}
                        <label className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${isVisualUpdateEnabled ? 'bg-teal-600' : 'bg-gray-200'}`}>
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={isVisualUpdateEnabled}
                                onChange={(e) => setIsVisualUpdateEnabled(e.target.checked)}
                            />
                            <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isVisualUpdateEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </label>
                    </div>

                    {/* Slider with disable state */}
                    <div className={`transition-opacity duration-200 ${isVisualUpdateEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Refresh Rate</span>
                            <span>{updateInterval} gen/frame</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={updateInterval}
                            onChange={(e) => setUpdateInterval(Number(e.target.value))}
                            disabled={!isVisualUpdateEnabled}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Benchmark Mode */}
            <div className={`transition-all duration-300 ${isBenchmarkMode ? 'bg-blue-50/50 border border-blue-100 p-4 rounded-2xl overflow-hidden' : 'bg-transparent border-transparent p-0'}`}>
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={isBenchmarkMode}
                        onChange={(e) => setIsBenchmarkMode(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                        🏁 Benchmark Mode
                    </span>
                </label>

                {isBenchmarkMode && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Target Fitness</span>
                                <span className="font-bold text-blue-700">{benchmarkTarget}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="99"
                                value={benchmarkTarget}
                                onChange={(e) => setBenchmarkTarget(Number(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex gap-2 mt-2">
                                {[90, 95, 99].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setBenchmarkTarget(val)}
                                        className={`flex-1 py-1 text-xs rounded-md font-medium transition-colors
                        ${benchmarkTarget === val ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {benchmarkResults && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Result</div>
                                    <div className="text-green-900 font-bold">Reached {benchmarkTarget}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-700 leading-none">{benchmarkResults.time.toFixed(3)}<span className="text-sm">s</span></div>
                                    <div className="text-xs text-green-600">{benchmarkResults.generation} gens</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* Advanced Settings (Population, Mutation, Grid) */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <Settings className="w-4 h-4" />
                    <span>Parameters</span>
                </div>

                {/* Population */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Population</span>
                        <span className="font-medium">{populationSize}</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={populationSize}
                        onChange={(e) => setPopulationSize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                    />
                </div>

                {/* Mutation */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Mutation Rate</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAutoMutation}
                                onChange={(e) => setIsAutoMutation(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAutoMutation ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                Auto
                            </span>
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0.001"
                            max="0.1"
                            step="0.001"
                            value={mutationRate}
                            disabled={isAutoMutation}
                            onChange={(e) => setMutationRate(Number(e.target.value))}
                            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 ${isAutoMutation ? 'bg-gray-100' : 'bg-gray-200'}`}
                        />
                        <span className="text-xs font-mono w-12 text-right">{mutationRate.toFixed(3)}</span>
                    </div>
                </div>

                {/* Grid Size */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Grid Size</span>
                    </div>
                    <select
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        disabled={isPlaying}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                    >
                        <option value="32">32 x 32</option>
                        <option value="64">64 x 64</option>
                        <option value="128">128 x 128 (Heavy)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
import { useGeneticModel } from './hooks/useGeneticModel';
import { MosaicCanvas } from './components/MosaicCanvas';
import { ControlPanel } from './components/ControlPanel';
import { useState } from 'react';
import { HelpCircle, Dna, Activity } from 'lucide-react';
import { AlgorithmModal } from './components/AlgorithmModal';

function App() {
  const [gridSize, setGridSize] = useState<number>(32);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const {
    generation,
    fitness,
    bestImage,
    isPlaying,
    isLoaded,
    updateInterval,
    setUpdateInterval,
    populationSize,
    setPopulationSize,
    mutationRate,
    setMutationRate,
    isAutoMutation,
    setIsAutoMutation,
    togglePlay,
    reset,
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
  } = useGeneticModel(gridSize);

  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
            <Dna className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Genetic <span className="text-blue-600">Pixel Art</span>
          </h1>
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-3 bg-white hover:bg-gray-50 text-gray-500 hover:text-blue-600 rounded-full shadow-sm border border-gray-100 transition-all hover:scale-105 active:scale-95"
          title="How it works"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {!isLoaded ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium animate-pulse">Initializing WebAssembly Core...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Images */}
          <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Image Card */}
              <div className="bg-white p-5 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Target</div>
                <img
                  src={`${import.meta.env.BASE_URL}target.png`}
                  alt="Target"
                  className="w-full max-w-[320px] aspect-square rounded-xl shadow-inner bg-gray-50"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Evolution Image Card */}
              <div className="bg-white p-5 rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-50 flex flex-col items-center gap-4 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="text-sm font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Evolution
                </div>
                <MosaicCanvas
                  imageData={bestImage}
                  width={gridSize}
                  height={gridSize}
                  className="shadow-inner"
                />
              </div>
            </div>

            <div className="hidden md:block bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-sm text-blue-900/70 leading-relaxed">
              <p>
                <strong>Tip:</strong> 並列処理（Parallel Processing）をONにすると、モダンブラウザではパフォーマンスが大幅に向上します。
                描画更新（Visual Updates）をOFFにすると、さらに高速に世代を進めることができます。
              </p>
            </div>
          </div>

          {/* Right Column: Control Panel */}
          <div className="lg:col-span-5 w-full">
            <ControlPanel
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onReset={reset}
              updateInterval={updateInterval}
              setUpdateInterval={setUpdateInterval}
              generation={generation}
              fitness={fitness}
              populationSize={populationSize}
              setPopulationSize={setPopulationSize}
              mutationRate={mutationRate}
              setMutationRate={setMutationRate}
              isAutoMutation={isAutoMutation}
              setIsAutoMutation={setIsAutoMutation}
              gridSize={gridSize}
              setGridSize={handleSizeChange}
              isParallel={isParallel}
              setIsParallel={setIsParallel}
              fps={fps}
              isBenchmarkMode={isBenchmarkMode}
              setIsBenchmarkMode={setIsBenchmarkMode}
              benchmarkTarget={benchmarkTarget}
              setBenchmarkTarget={setBenchmarkTarget}
              benchmarkResults={benchmarkResults}
              isVisualUpdateEnabled={isVisualUpdateEnabled}
              setIsVisualUpdateEnabled={setIsVisualUpdateEnabled}
            />
          </div>
        </div>
      )}

      <AlgorithmModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
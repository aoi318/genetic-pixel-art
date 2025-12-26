// src/App.tsx
import { useGeneticModel } from './hooks/useGeneticModel';
import { MosaicCanvas } from './components/MosaicCanvas';
import { ControlPanel } from './components/ControlPanel';
import { useState } from 'react';


function App() {
  const [gridSize, setGridSize] = useState<number>(32);

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
  } = useGeneticModel(gridSize);

  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧬 Genetic Pixel Art</h1>

      {!isLoaded ? (
        <div style={styles.loading}>Loading WebAssembly...</div>
      ) : (
        <div style={styles.content}>
          <div style={styles.imagesContainer}>
            <div style={styles.imageWrapper}>
              <div style={styles.imageLabel}>Target</div>
              <img
                src={`${import.meta.env.BASE_URL}target.png`}
                alt="Target"
                style={styles.pixelImage}
              />
            </div>

            <div style={styles.imageWrapper}>
              <div style={styles.imageLabel}>Evolution</div>
              <MosaicCanvas
                imageData={bestImage}
                width={gridSize}
                height={gridSize}
              />
            </div>
          </div>

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
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px 20px',
    gap: '30px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    margin: 0,
  },
  loading: {
    fontSize: '1.2rem',
    color: '#666',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '30px',
    width: '100%',
  },
  imagesContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  imageWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  imageLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  pixelImage: {
    width: '100%',
    height: 'auto',
    imageRendering: 'pixelated' as const,
    display: 'block',
  },
};

export default App;
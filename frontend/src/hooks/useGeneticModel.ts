import { useEffect, useRef, useState, useCallback } from 'react';
import init, { GeneticModel, initThreadPool } from 'crate';
import { loadTargetImage } from '../utils/imageLoader';

let initPromise: Promise<void> | null = null;

export const useGeneticModel = (gridsize: number) => {
  const [generation, setGeneration] = useState(0);
  const [fitness, setFitness] = useState(0);
  const [bestImage, setBestImage] = useState<Uint8Array | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [populationSize, setPopulationSize] = useState(100);
  const [mutationRate, setMutationRate] = useState(0.05);
  const [isAutoMutation, setIsAutoMutation] = useState(true);
  const [isParallel, setIsParallel] = useState(false);
  const [fps, setFps] = useState(0);

  const [isBenchmarkMode, setIsBenchmarkMode] = useState(false);
  const [benchmarkTarget, setBenchmarkTarget] = useState(95);
  const [benchmarkResults, setBenchmarkResults] = useState<{ time: number; generation: number } | null>(null);
  const benchmarkStartTimeRef = useRef<number>(0);

  const [updateInterval, setUpdateInterval] = useState(10);

  const [isVisualUpdateEnabled, setIsVisualUpdateEnabled] = useState(true);
  const isVisualUpdateEnabledRef = useRef(isVisualUpdateEnabled);

  useEffect(() => {
    isVisualUpdateEnabledRef.current = isVisualUpdateEnabled;
  }, [isVisualUpdateEnabled]);

  const lastFpsUpdateTimeRef = useRef<number>(0);
  const generationCountRef = useRef<number>(0);

  const modelRef = useRef<GeneticModel | null>(null);
  const animationRef = useRef<number | null>(null);

  const updateState = useCallback(() => {
    if (!modelRef.current) return;

    setGeneration(modelRef.current.get_generation());
    setFitness(modelRef.current.get_best_fitness());

    if (isVisualUpdateEnabledRef.current) {
      setBestImage(modelRef.current.get_best_image());
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const loopRef = useRef<() => void>(() => { });

  useEffect(() => {
    loopRef.current = () => {
      if (!modelRef.current) return;

      const batchSize = isVisualUpdateEnabledRef.current ? updateInterval : 500;

      if (batchSize > 1) {
        modelRef.current.step_batch(batchSize, mutationRate, isAutoMutation, isParallel);
      } else {
        modelRef.current.step(mutationRate, isAutoMutation, isParallel);
      }

      const now = performance.now();

      generationCountRef.current += batchSize;

      updateState();

      if (isBenchmarkMode && !benchmarkResults) {
        const currentFitness = modelRef.current.get_best_fitness();
        const targetFitness = benchmarkTarget / 100;

        if (currentFitness >= targetFitness) {
          const elapsedTime = (now - benchmarkStartTimeRef.current) / 1000;
          const currentGeneration = modelRef.current.get_generation();

          setBenchmarkResults({
            time: elapsedTime,
            generation: currentGeneration,
          });

          setIsPlaying(false);

          if (!isVisualUpdateEnabledRef.current && modelRef.current) {
            setBestImage(modelRef.current.get_best_image());
          }
          return;
        }
      }

      if (generationCountRef.current % 500 === 0) {
        performance.clearMarks();
        performance.clearMeasures();
      }

      if (now - lastFpsUpdateTimeRef.current >= 1000) {
        const elapsed = now - lastFpsUpdateTimeRef.current;
        const currentFps = Math.round((generationCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        generationCountRef.current = 0;
        lastFpsUpdateTimeRef.current = now;
      }

      animationRef.current = requestAnimationFrame(() => loopRef.current());
    };
  }, [mutationRate, isAutoMutation, isParallel, updateInterval, updateState, isBenchmarkMode, benchmarkTarget, benchmarkResults]);

  const startLoop = useCallback(() => {
    lastFpsUpdateTimeRef.current = performance.now();
    generationCountRef.current = 0;

    if (isBenchmarkMode) {
      benchmarkStartTimeRef.current = performance.now();
    }

    loopRef.current();
  }, [isBenchmarkMode]);

  useEffect(() => {
    if (isPlaying) {
      startLoop();
    } else {
      stopLoop();
    }
  }, [isPlaying, startLoop, stopLoop]);

  useEffect(() => {
    const setup = async () => {
      try {
        if (!initPromise) {
          initPromise = (async () => {
            if (typeof SharedArrayBuffer === 'undefined') {
              throw new Error('SharedArrayBuffer がサポートされていません。CORS ヘッダーを確認してください。');
            }
            console.log('WASM を初期化中...');
            const wasm = await init(`${import.meta.env.BASE_URL}crate_bg.wasm`);
            console.log('Shared Memory?', wasm.memory.buffer instanceof SharedArrayBuffer);
            const numThreads = Math.min(navigator.hardwareConcurrency || 8, 8);
            console.log(`${numThreads} スレッドを初期化中...`);
            await initThreadPool(numThreads);
            console.log('スレッドプール初期化完了');
          })();
        }

        await initPromise;

        const targetUrl = `${import.meta.env.BASE_URL}target.png`;
        const targetData = await loadTargetImage(targetUrl, gridsize, gridsize);

        modelRef.current = GeneticModel.new(targetData, populationSize, gridsize);

        setIsLoaded(true);
        updateState();
      } catch (e) {
        console.error("Setup failed:", e);
      }
    };

    setup();

    return () => stopLoop();
  }, [populationSize, gridsize, stopLoop, updateState]);

  const togglePlay = () => {
    if (!isPlaying && isBenchmarkMode) {
      setBenchmarkResults(null);
    }
    setIsPlaying((prev) => !prev);
  };

  const reset = async () => {
    stopLoop();
    setIsPlaying(false);
    setFps(0);
    setBenchmarkResults(null);

    const targetUrl = `${import.meta.env.BASE_URL}target.png`;
    const targetData = await loadTargetImage(targetUrl, gridsize, gridsize);

    modelRef.current = GeneticModel.new(targetData, populationSize, gridsize);

    setGeneration(0);
    setFitness(0);
    updateState();
  };

  return {
    generation,
    fitness,
    bestImage,
    isPlaying,
    isLoaded,
    populationSize,
    setPopulationSize,
    mutationRate,
    setMutationRate,
    isAutoMutation,
    setIsAutoMutation,
    isParallel,
    setIsParallel,
    fps,
    updateInterval,
    setUpdateInterval,
    isBenchmarkMode,
    setIsBenchmarkMode,
    benchmarkTarget,
    setBenchmarkTarget,
    benchmarkResults,
    togglePlay,
    reset,
    isVisualUpdateEnabled,
    setIsVisualUpdateEnabled,
  };
};
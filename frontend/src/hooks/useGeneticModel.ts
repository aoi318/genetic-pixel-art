// src/hooks/useGeneticModel.ts

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

  // 🔥 表示間隔設定 (何世代ごとに画面更新するか)
  const [updateInterval, setUpdateInterval] = useState(10);

  const lastFpsUpdateTimeRef = useRef<number>(0);
  const generationCountRef = useRef<number>(0);

  const modelRef = useRef<GeneticModel | null>(null);
  const animationRef = useRef<number | null>(null);

  const updateState = useCallback(() => {
    if (!modelRef.current) return;
    setGeneration(modelRef.current.get_generation());
    setFitness(modelRef.current.get_best_fitness());
    setBestImage(modelRef.current.get_best_image());
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

      // 🔥 updateInterval分だけバッチ処理
      if (updateInterval > 1) {
        modelRef.current.step_batch(updateInterval, mutationRate, isAutoMutation, isParallel);
      } else {
        modelRef.current.step(mutationRate, isAutoMutation, isParallel);
      }

      const now = performance.now();

      // 🔥 実際に処理した世代数をカウント
      generationCountRef.current += updateInterval;

      // 毎回画面更新（バッチ処理後に表示）
      updateState();

      // 🔥 メモリ管理を改善
      if (generationCountRef.current % 500 === 0) {
        performance.clearMarks();
        performance.clearMeasures();
      }

      // 🔥 FPS計測 (世代/秒) - 実測値
      if (now - lastFpsUpdateTimeRef.current >= 1000) {
        const elapsed = now - lastFpsUpdateTimeRef.current;
        const currentFps = Math.round((generationCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        generationCountRef.current = 0;
        lastFpsUpdateTimeRef.current = now;
      }

      animationRef.current = requestAnimationFrame(() => loopRef.current());
    };
  }, [mutationRate, isAutoMutation, isParallel, updateInterval, updateState]);

  const loop = useCallback(() => {
    lastFpsUpdateTimeRef.current = performance.now();
    generationCountRef.current = 0;
    loopRef.current();
  }, []);

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

            // 🔥 スレッド数を最大化
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

  useEffect(() => {
    if (isPlaying) {
      loop();
    } else {
      stopLoop();
    }
    return () => stopLoop();
  }, [isPlaying, loop, stopLoop]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const reset = async () => {
    stopLoop();
    setIsPlaying(false);
    setFps(0);

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
    togglePlay,
    reset,
  };
};
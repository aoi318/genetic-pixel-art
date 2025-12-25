// src/hooks/useGeneticModel.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import init, { GeneticModel, initThreadPool } from 'crate'; //
import { loadTargetImage } from '../utils/imageLoader'; //

// 初期化の状態を管理するグローバル変数
let initPromise: Promise<void> | null = null;

export const useGeneticModel = (gridsize: number) => {
  const [generation, setGeneration] = useState(0);
  const [fitness, setFitness] = useState(0);
  const [bestImage, setBestImage] = useState<Uint8Array | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [populationSize, setPopulationSize] = useState(100);
  const [mutationRate, setMutationRate] = useState(0.05);
  const [isAutoMutation, setIsAutoMutation] = useState(true);
  const [isParallel, setIsParallel] = useState(false);
  const [fps, setFps] = useState(0);
  const lastFpsUpdateTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

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

      for (let i = 0; i < speed; i++) {
        modelRef.current.step(mutationRate, isAutoMutation, isParallel);
      }

      const now = performance.now();
      frameCountRef.current++;

      if (now - lastFpsUpdateTimeRef.current >= 100) {
        const elapsed = now - lastFpsUpdateTimeRef.current;
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastFpsUpdateTimeRef.current = now;
      }

      updateState();
      animationRef.current = requestAnimationFrame(() => loopRef.current());
    };
  }, [speed, mutationRate, isAutoMutation, isParallel, updateState]);

  const loop = useCallback(() => {
    lastFpsUpdateTimeRef.current = performance.now();
    frameCountRef.current = 0;
    loopRef.current();
  }, []);

  // 初期化ロジックの修正
  useEffect(() => {
    const setup = async () => {
      try {
        // まだ初期化が始まっていない場合のみ実行
        if (!initPromise) {
          initPromise = (async () => {
            if (typeof SharedArrayBuffer === 'undefined') {
              throw new Error('SharedArrayBuffer がサポートされていません。CORS ヘッダーを確認してください。');
            }

            console.log('WASM を初期化中...');
            await init(`${import.meta.env.BASE_URL}crate_bg.wasm`);

            const numThreads = Math.min(navigator.hardwareConcurrency || 4, 4);
            console.log(`${numThreads} スレッドを初期化中...`);

            // initThreadPool は一度だけ呼ぶ
            await initThreadPool(numThreads);
            console.log('スレッドプール初期化完了');
          })();
        }

        // 初期化の完了を待つ（2回目以降の呼び出しでもここは待機するだけで再実行しない）
        await initPromise;

        // モデルの作成は毎回（またはパラメータ変更時に）行う
        const targetUrl = `${import.meta.env.BASE_URL}target.png`;
        const targetData = await loadTargetImage(targetUrl, gridsize, gridsize);

        // 古いモデルがあれば破棄（Rust側のメモリ解放はGCに任せるか、明示的なfreeが必要なら呼ぶ）
        modelRef.current = GeneticModel.new(targetData, populationSize, gridsize);

        setIsLoaded(true);
        updateState();
      } catch (e) {
        console.error("Setup failed:", e);
        // エラー時は再試行できるようにPromiseをクリアするなどの考慮が必要だが、
        // 重大なエラー（WASMロード失敗など）はリロード推奨
      }
    };

    setup();

    return () => stopLoop();
  }, [populationSize, gridsize, stopLoop, updateState]); // 依存配列は維持

  // ... (残りのコードは同じ)
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
    speed,
    setSpeed,
    populationSize,
    setPopulationSize,
    mutationRate,
    setMutationRate,
    isAutoMutation,
    setIsAutoMutation,
    isParallel,
    setIsParallel,
    fps,
    togglePlay,
    reset,
  };
};
// src/hooks/useGeneticModel.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import init, { GeneticModel } from 'crate';
import { loadTargetImage } from '../utils/imageLoader';

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

  useEffect(() => {
    const setup = async () => {
      try {
        await init();
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
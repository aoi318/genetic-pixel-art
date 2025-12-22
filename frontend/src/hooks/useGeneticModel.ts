// src/hooks/useGeneticModel.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import init, { GeneticModel } from 'core-logic';
import { loadTargetImage } from '../utils/imageLoader';

const IMAGE_SIZE = 32;

export const useGeneticModel = () => {
  const [generation, setGeneration] = useState(0);
  const [fitness, setFitness] = useState(0);
  const [bestImage, setBestImage] = useState<Uint8Array | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [speed, setSpeed] = useState(1);

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
        modelRef.current.step();
      }

      updateState();

      animationRef.current = requestAnimationFrame(() => loopRef.current());
    };
  }, [speed, updateState]);

  const loop = useCallback(() => {
    loopRef.current();
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        await init();
        const targetData = await loadTargetImage('/target.png', IMAGE_SIZE, IMAGE_SIZE);

        modelRef.current = GeneticModel.new(targetData, 100);

        setIsLoaded(true);
        updateState();
      } catch (e) {
        console.error("Setup failed:", e);
      }
    };

    setup();

    return () => stopLoop();
  }, [stopLoop, updateState]);

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

    const targetData = await loadTargetImage('/target.png', IMAGE_SIZE, IMAGE_SIZE);
    modelRef.current = GeneticModel.new(targetData, 100);

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
    togglePlay,
    reset,
  };
};
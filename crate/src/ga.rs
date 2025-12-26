// crate/src/ga.rs

use rand::Rng;
use rayon::prelude::*;

pub struct Population {
    pub individuals: Vec<Individual>,
    pub buffer: Vec<Individual>,
    pub generation: usize,
}

impl Population {
    pub fn new(size: usize, length: usize) -> Self {
        let mut individuals: Vec<Individual> = Vec::with_capacity(size);

        for _ in 0..size {
            individuals.push(Individual::new(length));
        }

        let buffer: Vec<Individual> = individuals.clone();

        Self {
            individuals,
            buffer,
            generation: 0,
        }
    }

    fn compute_fitnesses(&mut self, target: &[u8], is_parallel: bool) {
        if is_parallel {
            self.individuals
                .par_iter_mut()
                .for_each(|ind: &mut Individual| ind.calculate_fitness(target));
        } else {
            for ind in self.individuals.iter_mut() {
                ind.calculate_fitness(target);
            }
        }
    }

    fn sort_by_fitness(&mut self, is_parallel: bool) {
        if is_parallel {
            // 🔥 sort_unstable_by で高速化（順序保証不要）
            self.individuals
                .par_sort_unstable_by(|a: &Individual, b: &Individual| {
                    b.fitness
                        .partial_cmp(&a.fitness)
                        .unwrap_or(std::cmp::Ordering::Equal)
                });
        } else {
            self.individuals
                .sort_unstable_by(|a: &Individual, b: &Individual| {
                    b.fitness
                        .partial_cmp(&a.fitness)
                        .unwrap_or(std::cmp::Ordering::Equal)
                });
        }
    }

    pub fn evolve(&mut self, target: &[u8], mutation_rate: f64, is_parallel: bool) {
        self.compute_fitnesses(target, is_parallel);
        self.sort_by_fitness(is_parallel);

        let individuals: &Vec<Individual> = &self.individuals;
        let next_generation: &mut Vec<Individual> = &mut self.buffer;
        next_generation.clear();

        // 🔥 エリート保存を少し増やす（上位3体）
        // 1体だけだと運悪く変異で悪化する可能性がある
        let num_elites = 3.min(individuals.len());
        for i in 0..num_elites {
            next_generation.push(individuals[i].clone());
        }

        // 🔥 選択プールは元のまま（上位50%）
        let elite_count: usize = self.individuals.len() / 2;
        let num_children: usize = individuals.len() - num_elites;

        if is_parallel {
            let children: Vec<Individual> = (0..num_children)
                .into_par_iter()
                .map(|_| {
                    let mut rng: rand::prelude::ThreadRng = rand::rng();
                    let p1: &Individual = &individuals[rng.random_range(0..elite_count)];
                    let p2: &Individual = &individuals[rng.random_range(0..elite_count)];

                    let mut child: Individual = p1.crossover(p2);
                    child.mutate(mutation_rate);
                    child
                })
                .collect();

            next_generation.extend(children);
        } else {
            let mut rng: rand::prelude::ThreadRng = rand::rng();

            while next_generation.len() < individuals.len() {
                let p1: &Individual = &individuals[rng.random_range(0..elite_count)];
                let p2: &Individual = &individuals[rng.random_range(0..elite_count)];

                let mut child: Individual = p1.crossover(p2);
                child.mutate(mutation_rate);
                next_generation.push(child);
            }
        }

        std::mem::swap(&mut self.individuals, &mut self.buffer);
        self.generation += 1;
    }

    pub fn best_fitness(&self) -> f64 {
        self.individuals[0].fitness
    }
}

#[derive(Clone)]
pub struct Individual {
    pub dna: Vec<u8>,
    fitness: f64,
    length: usize,
}

impl Individual {
    fn new(length: usize) -> Self {
        let size: usize = length * length * 4;

        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let dna: Vec<u8> = (0..size).map(|_| rng.random_range(0..=255)).collect();

        Self {
            dna,
            fitness: 0.0,
            length,
        }
    }

    // 🔥 MSEベースのフィットネス計算（より敏感）
    #[inline]
    fn calculate_fitness(&mut self, target: &[u8]) {
        let mut sum_squared_diff: u64 = 0;

        // 8バイトずつ処理 (キャッシュ効率向上)
        let chunks = self.dna.len() / 8;
        for i in 0..chunks {
            let base = i * 8;
            for j in 0..8 {
                let idx = base + j;
                let diff = (self.dna[idx] as i32 - target[idx] as i32).abs() as u64;
                sum_squared_diff += diff * diff; // 二乗誤差
            }
        }

        // 残りを処理
        for i in (chunks * 8)..self.dna.len() {
            let diff = (self.dna[i] as i32 - target[i] as i32).abs() as u64;
            sum_squared_diff += diff * diff; // 二乗誤差
        }

        // MSE (Mean Squared Error)
        let mse = sum_squared_diff as f64 / self.dna.len() as f64;
        let max_mse = 255.0 * 255.0; // 最大誤差の二乗

        // 1.0に近いほど良い
        self.fitness = 1.0 - (mse / max_mse);
    }

    // 🔥 段階的な突然変異（初期は大胆、後期は微調整）
    fn mutate(&mut self, mutation_rate: f64) {
        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let len: usize = self.dna.len();

        let num_mutations: usize = (len as f64 * mutation_rate).max(1.0) as usize;

        for _ in 0..num_mutations {
            let idx: usize = rng.random_range(0..len);

            // 90%の確率で微調整、10%で大きな変更
            let noise: i16 = if rng.random::<f64>() < 0.9 {
                // 微調整: ±5の範囲（細かい調整）
                rng.random_range(-5..=5)
            } else {
                // 大きな変更: ±30の範囲（多様性維持）
                rng.random_range(-30..=30)
            };

            self.dna[idx] = (self.dna[idx] as i16 + noise).clamp(0, 255) as u8;
        }
    }

    // 🔥 元の2点交叉に戻す（シンプルで効果的）
    pub fn crossover(&self, partner: &Individual) -> Individual {
        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let len: usize = self.dna.len();

        let mut new_dna: Vec<u8> = self.dna.clone();

        let p1: usize = rng.random_range(0..len);
        let p2: usize = rng.random_range(0..len);
        let (start, end) = if p1 < p2 { (p1, p2) } else { (p2, p1) };

        new_dna[start..end].copy_from_slice(&partner.dna[start..end]);

        Individual {
            dna: new_dna,
            fitness: 0.0,
            length: self.length,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_individual_size() {
        let ind: Individual = Individual::new(32);
        assert_eq!(ind.dna.len(), 4096);
    }

    #[test]
    fn test_fitness_perfect_match() {
        let mut ind: Individual = Individual::new(32);
        let target: Vec<u8> = vec![0; 4096];
        ind.dna = vec![0u8; 4096];

        ind.calculate_fitness(&target);

        assert_eq!(ind.fitness, 1.0);
    }

    #[test]
    fn test_mutation_changes_dna() {
        let mut ind: Individual = Individual::new(32);
        ind.mutate(1.0);

        let is_changed: bool = ind.dna.iter().any(|&x| x != 0);
        assert!(is_changed, "DNA should change when mutation rate is 1.0");
    }

    #[test]
    fn test_population_new() {
        let size: usize = 10;
        let length: usize = 32;
        let pop: Population = Population::new(size, length);

        assert_eq!(pop.individuals.len(), size);
    }

    #[test]
    fn test_compute_fitnesses() {
        let mut pop: Population = Population::new(10, 32);
        let target: Vec<u8> = vec![0u8; 4096];

        assert_eq!(pop.individuals[0].fitness, 0.0);

        pop.compute_fitnesses(&target, false);

        assert!(0.0 < pop.individuals[0].fitness);
    }

    #[test]
    fn test_sort() {
        let mut pop: Population = Population::new(3, 32);
        pop.individuals[0].fitness = 0.1;
        pop.individuals[1].fitness = 0.9;
        pop.individuals[2].fitness = 0.5;

        pop.sort_by_fitness(false);

        assert_eq!(pop.individuals[0].fitness, 0.9);
    }

    #[test]
    fn test_evolve() {
        let size: usize = 10;
        let target: Vec<u8> = vec![0u8; 4096];
        let mut pop: Population = Population::new(size, 32);

        pop.compute_fitnesses(&target, false);
        pop.sort_by_fitness(false);
        let prevscore: f64 = pop.individuals[0].fitness;

        pop.evolve(&target, 0.1, false);

        assert_eq!(pop.generation, 1);
        assert_eq!(pop.individuals.len(), size);
        assert!(prevscore <= pop.individuals[0].fitness);
    }

    #[test]
    fn test_crossover() {
        let mut parent_a: Individual = Individual::new(32);
        parent_a.dna = vec![0u8; 4096];

        let mut parent_b: Individual = Individual::new(32);
        parent_b.dna = vec![255u8; 4096];

        let child: Individual = parent_a.crossover(&parent_b);

        let has_zero: bool = child.dna.iter().any(|&x| x == 0);
        let has_255: bool = child.dna.iter().any(|&x| x == 255);

        assert!(has_zero, "Child should inherit some DNA from parent A (0)");
        assert!(has_255, "Child should inherit some DNA from parent B (255)");
        assert_eq!(child.dna.len(), 4096, "Child DNA size should be correct");
    }

    #[test]
    fn test_elitism() {
        let size: usize = 10;
        let mut pop: Population = Population::new(size, 32);
        let target: Vec<u8> = vec![100u8; 4096];

        pop.compute_fitnesses(&target, false);
        pop.sort_by_fitness(false);

        let best_fitness_gen0: f64 = pop.individuals[0].fitness;

        pop.evolve(&target, 0.1, false);

        assert!(
            pop.individuals[0].fitness >= best_fitness_gen0,
            "Best fitness decreased! Elitism might be broken."
        );
    }

    #[test]
    fn test_individual_dynamic_size() {
        let length: usize = 64;
        let ind: Individual = Individual::new(length);

        assert_eq!(ind.dna.len(), 64 * 64 * 4);
        assert_eq!(ind.length, 64);
    }

    #[test]
    fn test_parallel_execution() {
        let size: usize = 100;
        let target: Vec<u8> = vec![0u8; 4096];
        let mut pop: Population = Population::new(size, 32);

        pop.compute_fitnesses(&target, true);

        assert!(pop.individuals[0].fitness > 0.0);
    }
}

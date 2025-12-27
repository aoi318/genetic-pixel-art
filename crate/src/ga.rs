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

        let Population {
            ref individuals,
            ref mut buffer,
            ..
        } = self;

        let num_elites: usize = 3.min(individuals.len());
        for i in 0..num_elites {
            buffer[i].dna.copy_from_slice(&individuals[i].dna);
            buffer[i].fitness = individuals[i].fitness;
        }

        let elite_count: usize = individuals.len() / 2;

        if is_parallel {
            buffer
                .par_iter_mut()
                .skip(num_elites)
                .for_each(|child: &mut Individual| {
                    let mut rng: rand::prelude::ThreadRng = rand::rng();
                    let p1: &Individual = &individuals[rng.random_range(0..elite_count)];
                    let p2: &Individual = &individuals[rng.random_range(0..elite_count)];

                    p1.crossover_into(p2, child);
                    child.mutate(mutation_rate);
                });
        } else {
            buffer.iter_mut().skip(num_elites).for_each(|child| {
                let mut rng: rand::prelude::ThreadRng = rand::rng();
                let p1: &Individual = &individuals[rng.random_range(0..elite_count)];
                let p2: &Individual = &individuals[rng.random_range(0..elite_count)];

                p1.crossover_into(p2, child);
                child.mutate(mutation_rate);
            });
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
}

impl Individual {
    fn new(length: usize) -> Self {
        let size: usize = length * length * 4;

        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let dna: Vec<u8> = (0..size).map(|_| rng.random_range(0..=255)).collect();

        Self { dna, fitness: 0.0 }
    }

    #[inline]
    fn calculate_fitness(&mut self, target: &[u8]) {
        let mut sum_squared_diff: u64 = 0;

        let chunks = self.dna.len() / 8;
        for i in 0..chunks {
            let base = i * 8;
            for j in 0..8 {
                let idx = base + j;
                let diff = (self.dna[idx] as i32 - target[idx] as i32).abs() as u64;
                sum_squared_diff += diff * diff;
            }
        }

        for i in (chunks * 8)..self.dna.len() {
            let diff: u64 = (self.dna[i] as i32 - target[i] as i32).abs() as u64;
            sum_squared_diff += diff * diff;
        }

        let mse: f64 = sum_squared_diff as f64 / self.dna.len() as f64;
        let max_mse: f64 = 255.0 * 255.0;

        self.fitness = 1.0 - (mse / max_mse);
    }

    fn mutate(&mut self, mutation_rate: f64) {
        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let len: usize = self.dna.len();

        let num_mutations: usize = (len as f64 * mutation_rate).max(1.0) as usize;

        for _ in 0..num_mutations {
            let idx: usize = rng.random_range(0..len);

            let noise: i16 = if rng.random::<f64>() < 0.9 {
                rng.random_range(-5..=5)
            } else {
                rng.random_range(-30..=30)
            };

            self.dna[idx] = (self.dna[idx] as i16 + noise).clamp(0, 255) as u8;
        }
    }

    pub fn crossover_into(&self, partner: &Individual, child: &mut Individual) {
        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let len: usize = self.dna.len();

        child.dna.copy_from_slice(&self.dna);
        child.fitness = 0.0;

        let p1: usize = rng.random_range(0..len);
        let p2: usize = rng.random_range(0..len);
        let (start, end) = if p1 < p2 { (p1, p2) } else { (p2, p1) };

        child.dna[start..end].copy_from_slice(&partner.dna[start..end]);
    }

    pub fn copy_from(&mut self, other: &Individual) {
        self.dna.copy_from_slice(&other.dna);
        self.fitness = other.fitness;
    }

    pub(crate) fn new_empty(length: usize) -> Self {
        let size: usize = length * length * 4;
        Self {
            dna: vec![0; size],
            fitness: 0.0,
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
    }

    #[test]
    fn test_parallel_execution() {
        let size: usize = 100;
        let target: Vec<u8> = vec![0u8; 4096];
        let mut pop: Population = Population::new(size, 32);

        pop.compute_fitnesses(&target, true);

        assert!(pop.individuals[0].fitness > 0.0);
    }

    #[test]
    fn test_crossover_into() {
        let length: usize = 10;
        let mut parent_a: Individual = Individual::new(length);
        parent_a.dna.fill(0);
        let mut parent_b: Individual = Individual::new(length);
        parent_b.dna.fill(255);
        let mut child: Individual = Individual::new(length);
        child.dna.fill(168);

        parent_a.crossover_into(&parent_b, &mut child);

        assert_eq!(child.dna.len(), parent_a.dna.len());

        let has_zero: bool = child.dna.iter().any(|&x| x == 0);
        let has_255: bool = child.dna.iter().any(|&x| x == 255);
        assert!(has_zero || has_255, "DNA should be overwritten by parents");
    }

    #[test]
    fn test_copy_from() {
        let length: usize = 10;
        let mut ind1: Individual = Individual::new(length);
        ind1.dna.fill(10);
        ind1.fitness = 0.5;

        let mut ind2: Individual = Individual::new(length);
        ind2.dna.fill(20);
        ind2.fitness = 0.1;

        ind2.copy_from(&ind1);

        assert_eq!(ind2.dna, ind1.dna);
        assert_eq!(ind2.fitness, ind1.fitness);

        assert_eq!(ind1.dna[0], 10);
    }
}

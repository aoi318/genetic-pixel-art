// crate/src/ga.rs

use rand::Rng;

pub struct Population {
    pub individuals: Vec<Individual>,
    pub generation: usize,
}

impl Population {
    pub fn new(size: usize, length: usize) -> Self {
        let mut individuals: Vec<Individual> = Vec::with_capacity(size);

        for _ in 0..size {
            individuals.push(Individual::new(length));
        }

        Self {
            individuals,
            generation: 0,
        }
    }

    fn compute_fitnesses(&mut self, target: &[u8]) {
        for ind in self.individuals.iter_mut() {
            ind.calculate_fitness(target);
        }
    }

    fn sort_by_fitness(&mut self) {
        self.individuals.sort_by(|a: &Individual, b: &Individual| {
            b.fitness
                .partial_cmp(&a.fitness)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
    }

    pub fn evolve(&mut self, target: &[u8], mutation_rate: f64) {
        self.compute_fitnesses(target);
        self.sort_by_fitness();

        let mut next_generation: Vec<Individual> = Vec::with_capacity(self.individuals.len());
        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let elite_count: usize = self.individuals.len() / 2;

        next_generation.push(self.individuals[0].clone());

        while next_generation.len() < self.individuals.len() {
            let parent1: &Individual = &self.individuals[rng.random_range(0..elite_count)];
            let parent2: &Individual = &self.individuals[rng.random_range(0..elite_count)];

            let mut child: Individual = parent1.crossover(parent2);

            child.mutate(mutation_rate);
            next_generation.push(child);
        }

        self.individuals = next_generation;
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

        let mut rng = rand::rng();
        let dna: Vec<u8> = (0..size).map(|_| rng.random_range(0..=255)).collect();

        Self {
            dna,
            fitness: 0.0,
            length,
        }
    }

    fn calculate_fitness(&mut self, target: &[u8]) {
        let mut total_diff: usize = 0;

        for (a, b) in self.dna.iter().zip(target.iter()) {
            let val1: isize = *a as isize;
            let val2: isize = *b as isize;
            let diff: isize = (val1 - val2).abs();

            total_diff += diff as usize;
        }
        let max_diff: f64 = 255.0 * self.dna.len() as f64;
        self.fitness = 1.0 - (total_diff as f64 / max_diff);
    }

    fn mutate(&mut self, mutation_rate: f64) {
        let mut rng: rand::prelude::ThreadRng = rand::rng();

        for val in self.dna.iter_mut() {
            if rng.random::<f64>() < mutation_rate {
                let noise: i16 = rng.random_range(-10..=10);
                *val = (*val as i16 + noise).clamp(0, 255) as u8;
            };
        }
    }

    pub fn crossover(&self, partner: &Individual) -> Individual {
        let mut rng: rand::prelude::ThreadRng = rand::rng();
        let size: usize = self.dna.len();
        let mut new_dna: Vec<u8> = Vec::with_capacity(size);

        for (g1, g2) in self.dna.iter().zip(partner.dna.iter()) {
            if rng.random_bool(0.5) {
                new_dna.push(*g1);
            } else {
                new_dna.push(*g2);
            }
        }

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

        pop.compute_fitnesses(&target);

        assert!(0.0 < pop.individuals[0].fitness);
    }

    #[test]
    fn test_sort() {
        let mut pop: Population = Population::new(3, 32);
        pop.individuals[0].fitness = 0.1;
        pop.individuals[1].fitness = 0.9;
        pop.individuals[2].fitness = 0.5;

        pop.sort_by_fitness();

        assert_eq!(pop.individuals[0].fitness, 0.9);
    }

    #[test]
    fn test_evolve() {
        let size: usize = 10;
        let target: Vec<u8> = vec![0u8; 4096];
        let mut pop: Population = Population::new(size, 32);

        pop.compute_fitnesses(&target);
        pop.sort_by_fitness();
        let prevscore: f64 = pop.individuals[0].fitness;

        pop.evolve(&target, 0.1);

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

        pop.compute_fitnesses(&target);
        pop.sort_by_fitness();

        let best_fitness_gen0: f64 = pop.individuals[0].fitness;

        pop.evolve(&target, 0.1);

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
}

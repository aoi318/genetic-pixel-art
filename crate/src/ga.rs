// crate/src/ga.rs

use rand::Rng;


pub struct Population {
	individuals: Vec<Individual>,
	pub generation: usize,
}

impl Population {
	pub fn new(size: usize) -> Self {
		let mut individuals: Vec<Individual> = Vec::with_capacity(size);

		for _ in 0..size {
			individuals.push(Individual::new());
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
            b.fitness.partial_cmp(&a.fitness).unwrap_or(std::cmp::Ordering::Equal)
        });
    }

	pub fn evolve(&mut self, target: &[u8], mutation_rate: f64) {
		self.compute_fitnesses(target);
		self.sort_by_fitness();

		let mut next_generation: Vec<Individual> = Vec::with_capacity(self.individuals.len());
		let mut rng: rand::prelude::ThreadRng = rand::thread_rng();

		next_generation.push(self.individuals[0].clone());

		while next_generation.len() < self.individuals.len() {
			let parent1: &Individual = &self.individuals[rng.gen_range(0..10)];
			let parent2: &Individual = &self.individuals[rng.gen_range(0..10)];

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
	dna: Vec<u8>,
	fitness: f64,
}

impl Individual {
	fn new() -> Self {
		let size: usize = 32 * 32 * 4;

		let mut rng = rand::thread_rng();
		let dna: Vec<u8> = (0..size).map(|_| rng.gen_range(0..=255)).collect();

		Self {
			dna,
			fitness: 0.0,
		}
	}

	fn calculate_fitness(&mut self, target: &[u8]) {
		let mut total_diff:usize = 0;

		for i in 0..self.dna.len() {
			let val1: isize = self.dna[i] as isize;
			let val2: isize = target[i] as isize;
			let diff :isize = (val1 - val2).abs();

			total_diff += diff as usize;
		}
		self.fitness = 1.0 / (total_diff as f64 + 1.0);
	}

	fn mutate(&mut self, mutation_rate: f64) {
		let mut rng: rand::prelude::ThreadRng = rand::thread_rng();

		for val in self.dna.iter_mut() {
			if rng.gen::<f64>() < mutation_rate {
				*val = rng.gen_range(0..=255)
			};
		};
	}

	pub fn crossover(&self, partner: &Individual) -> Individual {
        let mut rng: rand::prelude::ThreadRng = rand::thread_rng();
        let size: usize = self.dna.len();

		let cross_point: usize = rng.gen_range(0..size);
		let mut new_dna: Vec<u8> = vec![0u8; size];

		new_dna[..cross_point].copy_from_slice(&self.dna[..cross_point]);

        new_dna[cross_point..].copy_from_slice(&partner.dna[cross_point..]);

        Individual {
            dna: new_dna,
            fitness: 0.0,
        }
    }
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_individual_size() {
		let ind: Individual = Individual::new();
		assert_eq!(ind.dna.len(), 4096);
	}

	#[test]
	fn test_fitness_perfect_match() {
		let mut ind: Individual = Individual::new();
		let target:Vec<u8>  = vec![0; 4096];
		ind.dna = vec![0u8; 4096];

		ind.calculate_fitness(&target);

		assert_eq!(ind.fitness, 1.0);
	}

	#[test]
	fn test_mutation_changes_dna() {
		let mut ind: Individual = Individual::new();
		ind.mutate(1.0);

		let is_changed: bool = ind.dna.iter().any(|&x| x != 0);
		assert!(is_changed, "DNA should change when mutation rate is 1.0");
	}

	#[test]
	fn test_population_new() {
		let size: usize = 10;
		let pop: Population = Population::new(size);

		assert_eq!(pop.individuals.len(), size);
	}

	#[test]
	fn test_compute_fitnesses() {
		let mut pop: Population = Population::new(10);
		let target: Vec<u8> = vec![0u8; 32 * 32 * 4];

		assert_eq!(pop.individuals[0].fitness, 0.0);

		pop.compute_fitnesses(&target);

		assert!(0.0 < pop.individuals[0].fitness);
	}

	#[test]
	fn test_sort() {
		let mut pop: Population = Population::new(3);
		pop.individuals[0].fitness = 0.1;
		pop.individuals[1].fitness = 0.9;
		pop.individuals[2].fitness = 0.5;

		pop.sort_by_fitness();

		assert_eq!(pop.individuals[0].fitness, 0.9);
	}

	#[test]
	fn test_evolve() {
		let size: usize = 10;
		let target: Vec<u8> = vec![0u8; 32 * 32 * 4];
		let mut pop: Population = Population::new(size);

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
    let mut parent_a: Individual = Individual::new();
    parent_a.dna = vec![0u8; 4096];

    let mut parent_b: Individual = Individual::new();
    parent_b.dna = vec![255u8; 4096];

    let child: Individual = parent_a.crossover(&parent_b);

    let has_zero: bool = child.dna.iter().any(|&x| x == 0);
    let has_255: bool = child.dna.iter().any(|&x| x == 255);

    assert!(has_zero, "Child should inherit some DNA from parent A (0)");
    assert!(has_255, "Child should inherit some DNA from parent B (255)");
    assert_eq!(child.dna.len(), 4096, "Child DNA size should be correct");
}
}
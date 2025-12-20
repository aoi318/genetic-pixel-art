// crate/src/ga.rs

use rand::Rng;

pub struct Individual {
	pub dna: Vec<u8>,
	pub fitness: f64,
}

impl Individual {
	pub fn new() -> Self {
		let size: usize = 32 * 32 * 4;
		Individual {
			dna: vec![0; size],
			fitness: 0.0,
		}
	}

	pub fn calculate_fitness(&mut self, target: &[u8]) {
		let mut total_diff:usize = 0;

		for i in 0..self.dna.len() {
			let val1: isize = self.dna[i] as isize;
			let val2: isize = target[i] as isize;
			let diff :isize = (val1 - val2).abs();

			total_diff += diff as usize;
		}
		self.fitness = 1.0 / (total_diff as f64 + 1.0);
	}

	pub fn mutate(&mut self, mutation_rate: f64) {
		let mut rng: rand::prelude::ThreadRng = rand::thread_rng();

		for val in self.dna.iter_mut() {
			if rng.gen::<f64>() < mutation_rate {
				*val = rng.gen_range(0..=255)
			};
		};
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
}
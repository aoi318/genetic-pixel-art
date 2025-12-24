// crate/src/lib.rs

mod ga;

use std::io::Cursor;

use ga::Population;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct GeneticModel {
    population: Population,
    target: Vec<u8>,
}

#[wasm_bindgen]
impl GeneticModel {
    pub fn new(target_image_data: &[u8], population_size: usize) -> Self {
        console_error_panic_hook::set_once();
        let target_vec: Vec<u8> = target_image_data.to_vec();

        Self {
            population: Population::new(population_size),
            target: target_vec,
        }
    }

    pub fn step(&mut self, base_mutation_rate: f64, is_auto: bool) {
        let current_fitness: f64 = self.population.best_fitness();
        let effective_rate: f64 =
            calculate_effective_mutation_rate(current_fitness, base_mutation_rate, is_auto);

        self.population.evolve(&self.target, effective_rate);
    }

    pub fn get_best_image(&self) -> Vec<u8> {
        self.population.individuals[0].dna.clone()
    }

    pub fn get_best_fitness(&self) -> f64 {
        self.population.best_fitness()
    }

    pub fn get_generation(&self) -> usize {
        self.population.generation
    }
}

fn calculate_effective_mutation_rate(current_fitness: f64, base_rate: f64, is_auto: bool) -> f64 {
    if !is_auto {
        return base_rate;
    }

    if 0.98 < current_fitness {
        0.001
    } else if 0.95 < current_fitness {
        0.005
    } else if 0.90 < current_fitness {
        0.01
    } else {
        base_rate
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_mutation_rate_auto_off() {
        let rate = calculate_effective_mutation_rate(0.99, 0.05, false);

        assert_eq!(rate, 0.05);
    }

    #[test]
    fn test_mutation_rate_auto_on_low_fitness() {
        let rate = calculate_effective_mutation_rate(0.5, 0.05, true);

        assert_eq!(rate, 0.05);
    }

    #[test]
    fn test_mutation_rate_auto_on_high_fitness() {
        let rate = calculate_effective_mutation_rate(0.96, 0.05, true);

        assert_eq!(rate, 0.005);
    }
    #[test]
    fn test_mutation_rate_auto_on_very_high_fitness() {
        let rate = calculate_effective_mutation_rate(0.99, 0.05, true);

        assert_eq!(rate, 0.001);
    }
}

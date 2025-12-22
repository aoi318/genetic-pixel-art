// crate/src/lib.rs

mod ga;

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

    pub fn step(&mut self) {
        self.population.evolve(&self.target, 0.05);
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

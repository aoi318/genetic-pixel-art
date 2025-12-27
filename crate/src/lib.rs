// crate/src/lib.rs

mod ga;

use ga::Individual;
use ga::Population;
use rayon::prelude::*;
use wasm_bindgen::prelude::*;
pub use wasm_bindgen_rayon::init_thread_pool;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct GeneticModel {
    islands: Vec<Population>,
    target: Vec<u8>,
    migration_buffer: Vec<Individual>,
}

#[wasm_bindgen]
impl GeneticModel {
    pub fn new(target_image_data: &[u8], population_size: usize, length: usize) -> Self {
        console_error_panic_hook::set_once();
        let target_vec: Vec<u8> = target_image_data.to_vec();

        let num_islands: usize = 4;
        let size_per_island: usize = population_size / num_islands;

        let mut migration_buffer: Vec<Individual> = Vec::with_capacity(num_islands);

        let mut islands: Vec<Population> = Vec::with_capacity(num_islands);
        for _ in 0..num_islands {
            islands.push(Population::new(size_per_island, length));
            migration_buffer.push(Individual::new_empty(length));
        }

        Self {
            islands,
            target: target_vec,
            migration_buffer,
        }
    }

    pub fn step_batch(
        &mut self,
        batch_size: usize,
        base_mutation_rate: f64,
        is_auto: bool,
        is_parallel: bool,
    ) {
        for _ in 0..batch_size {
            self.step(base_mutation_rate, is_auto, is_parallel);
        }
    }

    pub fn step(&mut self, base_mutation_rate: f64, is_auto: bool, is_parallel: bool) {
        let current_fitness: f64 = self.get_best_fitness();
        let effective_rate: f64 =
            calculate_effective_mutation_rate(current_fitness, base_mutation_rate, is_auto);

        let target: &Vec<u8> = &self.target;

        if is_parallel {
            self.islands
                .par_iter_mut()
                .for_each(|island: &mut Population| {
                    island.evolve(target, effective_rate, true);
                });
        } else {
            for island in self.islands.iter_mut() {
                island.evolve(target, effective_rate, false);
            }
        }

        if self.get_generation() % 50 == 0 {
            self.migrate();
        }
    }

    pub fn get_best_image(&self) -> Vec<u8> {
        self.get_best_island().individuals[0].dna.clone()
    }

    pub fn get_best_fitness(&self) -> f64 {
        self.get_best_island().best_fitness()
    }

    pub fn get_generation(&self) -> usize {
        if self.islands.is_empty() {
            return 0;
        }
        self.islands[0].generation
    }

    fn get_best_island(&self) -> &Population {
        self.islands
            .iter()
            .max_by(|a: &&Population, b: &&Population| {
                a.best_fitness()
                    .partial_cmp(&b.best_fitness())
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .expect("No islands found")
    }

    fn migrate(&mut self) {
        // 分解してそれぞれ可変参照を取得
        let GeneticModel {
            ref mut islands,
            ref mut migration_buffer,
            ..
        } = self;

        let num_islands = islands.len();
        if num_islands < 2 {
            return;
        }

        // 1. 各島のエリート(index 0)をバッファにコピー
        for (i, island) in islands.iter().enumerate() {
            // さっき作った copy_from を使う！
            migration_buffer[i].copy_from(&island.individuals[0]);
        }

        // 2. バッファの内容を次の島の最悪個体にコピー
        for i in 0..num_islands {
            let target_idx = (i + 1) % num_islands;
            let target_island = &mut islands[target_idx];
            let worst_idx = target_island.individuals.len() - 1;

            // バッファからコピー
            target_island.individuals[worst_idx].copy_from(&migration_buffer[i]);
        }
    }
}

fn calculate_effective_mutation_rate(current_fitness: f64, base_rate: f64, is_auto: bool) -> f64 {
    if !is_auto {
        return base_rate;
    }

    if current_fitness > 0.99 {
        base_rate * 0.3
    } else if current_fitness > 0.98 {
        base_rate * 0.5
    } else if current_fitness > 0.97 {
        base_rate * 0.7
    } else if current_fitness > 0.95 {
        base_rate * 0.8
    } else if current_fitness > 0.90 {
        base_rate * 0.9
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
        let rate = calculate_effective_mutation_rate(0.96, 0.1, true);
        assert!((rate - 0.08).abs() < 1e-10);
    }

    #[test]
    fn test_mutation_rate_auto_on_very_high_fitness() {
        let rate = calculate_effective_mutation_rate(0.991, 0.1, true);
        assert!((rate - 0.03).abs() < 1e-10);
    }

    #[test]
    fn test_mutation_rate_gradient() {
        assert_eq!(calculate_effective_mutation_rate(0.5, 0.1, true), 0.1);
        assert!((calculate_effective_mutation_rate(0.92, 0.1, true) - 0.09).abs() < 1e-10);
        assert!((calculate_effective_mutation_rate(0.96, 0.1, true) - 0.08).abs() < 1e-10);
        assert!((calculate_effective_mutation_rate(0.975, 0.1, true) - 0.07).abs() < 1e-10);
        assert!((calculate_effective_mutation_rate(0.985, 0.1, true) - 0.05).abs() < 1e-10);
        assert!((calculate_effective_mutation_rate(0.995, 0.1, true) - 0.03).abs() < 1e-10);
    }

    #[test]
    fn test_migrate_execution() {
        let target: Vec<u8> = vec![0u8; 4096];
        let mut model: GeneticModel = GeneticModel::new(&target, 100, 32);

        model.migrate();

        model.migrate();
    }
}

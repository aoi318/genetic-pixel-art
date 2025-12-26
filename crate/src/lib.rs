// crate/src/lib.rs

mod ga;

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
}

#[wasm_bindgen]
impl GeneticModel {
    pub fn new(target_image_data: &[u8], population_size: usize, length: usize) -> Self {
        console_error_panic_hook::set_once();
        let target_vec: Vec<u8> = target_image_data.to_vec();

        let num_islands: usize = 4;
        let size_per_island: usize = population_size / num_islands;

        let mut islands: Vec<Population> = Vec::with_capacity(num_islands);
        for _ in 0..num_islands {
            islands.push(Population::new(size_per_island, length));
        }

        Self {
            islands,
            target: target_vec,
        }
    }

    // 🔥 新機能: バッチ処理
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
                    // 🔥 ここを true に変更: 島内も並列化
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
        let num_islands = self.islands.len();
        if num_islands < 2 {
            return;
        }

        let elites: Vec<_> = self
            .islands
            .iter()
            .map(|island: &Population| island.individuals[0].clone())
            .collect();

        for i in 0..num_islands {
            let target_idx: usize = (i + 1) % num_islands;
            let target_island: &mut Population = &mut self.islands[target_idx];

            let worst_idx: usize = target_island.individuals.len() - 1;
            target_island.individuals[worst_idx] = elites[i].clone();
        }
    }
}

// 🔥 変異率の調整を改善（より細かく段階的に）
fn calculate_effective_mutation_rate(current_fitness: f64, base_rate: f64, is_auto: bool) -> f64 {
    if !is_auto {
        return base_rate;
    }

    // 97%以降は非常に細かい調整が必要
    if current_fitness > 0.99 {
        base_rate * 0.3 // 70%削減
    } else if current_fitness > 0.98 {
        base_rate * 0.5 // 50%削減
    } else if current_fitness > 0.97 {
        base_rate * 0.7 // 30%削減
    } else if current_fitness > 0.95 {
        base_rate * 0.8 // 20%削減
    } else if current_fitness > 0.90 {
        base_rate * 0.9 // 10%削減
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
        assert_eq!(rate, 0.015);
    }

    #[test]
    fn test_mutation_rate_auto_on_very_high_fitness() {
        let rate = calculate_effective_mutation_rate(0.99, 0.05, true);
        assert_eq!(rate, 0.005);
    }

    #[test]
    fn test_mutation_rate_gradient() {
        assert_eq!(calculate_effective_mutation_rate(0.5, 0.1, true), 0.1);
        assert_eq!(calculate_effective_mutation_rate(0.85, 0.1, true), 0.07);
        assert_eq!(calculate_effective_mutation_rate(0.92, 0.1, true), 0.05);
        assert_eq!(calculate_effective_mutation_rate(0.96, 0.1, true), 0.03);
        assert_eq!(calculate_effective_mutation_rate(0.99, 0.1, true), 0.01);
    }
}

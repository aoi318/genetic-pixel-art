mod ga;

use ga::Population;

pub fn main() {
    let target: Vec<u8> = vec![0u8; 32 * 32 * 4];
    let mutation_rate: f64 = 0.01;
    let mut pop: Population = Population::new(100);

    for i in 0..1000 {
        pop.evolve(&target, mutation_rate);

        if i % 100 == 0 {
            println!("世代: {}, 最高適応度: {}", i, pop.best_fitness());
        }
    }

    println!("最終結果 - 世代: {}, 最高適応度: {}", pop.generation, pop.best_fitness());
}
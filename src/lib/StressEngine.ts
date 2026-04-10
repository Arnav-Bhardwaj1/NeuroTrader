/**
 * StressEngine.ts
 * Monte Carlo Simulation engine using Geometric Brownian Motion (GBM).
 * Used for stress-testing trading strategies against thousands of potential market paths.
 */

export interface SimulationResult {
  paths: number[][]; // [iteration][day]
  meanFinalPrice: number;
  stdDevFinalPrice: number;
  confidenceIntervals: {
    upper95: number;
    lower95: number;
  };
}

export class StressEngine {
  /**
   * Generates multiple price paths using GBM.
   * Model: St = S0 * exp((mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * Z)
   * Where Z is a standard normal random variable.
   */
  static runGBMSimulation(
    initialPrice: number,
    days: number,
    annualReturn: number,
    annualVolatility: number,
    iterations: number = 1000
  ): SimulationResult {
    const dt = 1 / 252; // Daily time step
    const mu = annualReturn;
    const sigma = annualVolatility;
    const paths: number[][] = [];

    for (let i = 0; i < iterations; i++) {
      const path: number[] = [initialPrice];
      let currentPrice = initialPrice;

      for (let d = 1; d <= days; d++) {
        // Standard normal random variable using Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        const drift = (mu - 0.5 * Math.pow(sigma, 2)) * dt;
        const diffusion = sigma * Math.sqrt(dt) * z;
        
        currentPrice = currentPrice * Math.exp(drift + diffusion);
        path.push(currentPrice);
      }
      paths.push(path);
    }

    // Calculate statistics
    const finalPrices = paths.map(p => p[p.length - 1]);
    const mean = finalPrices.reduce((a, b) => a + b, 0) / iterations;
    const variance = finalPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / iterations;
    const stdDev = Math.sqrt(variance);

    // Sort for percentiles
    const sortedFinal = [...finalPrices].sort((a, b) => a - b);
    const lower95 = sortedFinal[Math.floor(iterations * 0.025)];
    const upper95 = sortedFinal[Math.floor(iterations * 0.975)];

    return {
      paths,
      meanFinalPrice: mean,
      stdDevFinalPrice: stdDev,
      confidenceIntervals: {
        upper95,
        lower95
      }
    };
  }

  /**
   * Estimates the probability of a price drop below a certain threshold.
   */
  static calculateDrawdownProbability(result: SimulationResult, thresholdPercent: number, initialPrice: number): number {
    const target = initialPrice * (1 - thresholdPercent);
    const breaches = result.paths.filter(path => {
      // Check if price ever drops below target in this path
      return path.some(price => price < target);
    }).length;

    return (breaches / result.paths.length) * 100;
  }
}

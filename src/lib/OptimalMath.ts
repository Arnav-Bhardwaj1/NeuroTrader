/**
 * OptimalMath.ts
 * Advanced Mathematical Library for Portfolio Optimization and Quantitative Analysis.
 * Implements Mean-Variance Optimization components and Monte Carlo simulation.
 */

export interface AssetData {
  symbol: string;
  returns: number[]; // Daily percentage returns
}

export interface PortfolioStats {
  weights: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

export class OptimalMath {
  /**
   * Calculates the covariance matrix for a set of assets.
   * Matrix[i][j] is the covariance between asset i and asset j.
   */
  static calculateCovarianceMatrix(assets: AssetData[]): number[][] {
    const numAssets = assets.length;
    const numDays = assets[0].returns.length;
    const matrix: number[][] = Array(numAssets).fill(0).map(() => Array(numAssets).fill(0));

    // Calculate means
    const means = assets.map(a => a.returns.reduce((sum, r) => sum + r, 0) / numDays);

    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j <= i; j++) {
        let covariance = 0;
        for (let d = 0; d < numDays; d++) {
          covariance += (assets[i].returns[d] - means[i]) * (assets[j].returns[d] - means[j]);
        }
        covariance /= (numDays - 1);
        
        matrix[i][j] = covariance;
        matrix[j][i] = covariance; // Symmetric matrix
      }
    }

    return matrix;
  }

  /**
   * Calculates portfolio variance: wT * Cov * w
   */
  static calculatePortfolioVariance(weights: number[], covMatrix: number[][]): number {
    let variance = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covMatrix[i][j];
      }
    }
    return variance;
  }

  /**
   * Runs a Monte Carlo simulation to generate random portfolios.
   * Used to visualize the Efficient Frontier (the "Markowitz Bullet").
   */
  static simulatePortfolios(assets: AssetData[], iterations: number = 2000): PortfolioStats[] {
    const numAssets = assets.length;
    const numDays = assets[0].returns.length;
    
    // Annualization factor (approx 252 trading days)
    const annualFactor = 252;
    
    // Calculate expected annual returns
    const meanReturns = assets.map(a => {
      const dailyMean = a.returns.reduce((sum, r) => sum + r, 0) / numDays;
      return dailyMean * annualFactor;
    });

    const covMatrix = this.calculateCovarianceMatrix(assets);
    // Annualize covariance matrix
    const annualizedCov = covMatrix.map(row => row.map(v => v * annualFactor));

    const results: PortfolioStats[] = [];

    for (let i = 0; i < iterations; i++) {
      // 1. Generate random weights
      let weights = Array(numAssets).fill(0).map(() => Math.random());
      const sum = weights.reduce((a, b) => a + b, 0);
      weights = weights.map(w => w / sum);

      // 2. Calculate portfolio return
      const pReturn = weights.reduce((sum, w, idx) => sum + (w * meanReturns[idx]), 0);

      // 3. Calculate portfolio volatility (std dev)
      const pVariance = this.calculatePortfolioVariance(weights, annualizedCov);
      const pVolatility = Math.sqrt(pVariance);

      // 4. Calculate Sharpe Ratio (assuming risk-free rate of 2%)
      const riskFreeRate = 0.02;
      const sharpeRatio = (pReturn - riskFreeRate) / pVolatility;

      results.push({
        weights,
        expectedReturn: pReturn,
        volatility: pVolatility,
        sharpeRatio
      });
    }

    return results;
  }

  /**
   * Finds the portfolio with the maximum Sharpe Ratio.
   */
  static findOptimalPortfolio(simulations: PortfolioStats[]): PortfolioStats {
    return simulations.reduce((max, p) => p.sharpeRatio > max.sharpeRatio ? p : max, simulations[0]);
  }

  /**
   * Finds the portfolio with the minimum Volatility.
   */
  static findMinimumVariancePortfolio(simulations: PortfolioStats[]): PortfolioStats {
    return simulations.reduce((min, p) => p.volatility < min.volatility ? p : min, simulations[0]);
  }
}

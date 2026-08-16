import { Request, Response } from 'express';

export const getYieldCurveData = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      spread10y2y: -0.23,
      spread10y3m: -1.00,
      isInverted: true,
      recessionProbPercent: 38,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Yield curve calculation error' });
  }
};

export const getMacroLiquidity = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      netLiquidityUsdTrillion: 6.29,
      fedBalanceSheetUsdTrillion: 7.32,
      reverseRepoUsdTrillion: 0.38,
      treasuryGeneralAccountUsdTrillion: 0.65,
    });
  } catch {
    res.status(500).json({ error: 'Macro liquidity service error' });
  }
};

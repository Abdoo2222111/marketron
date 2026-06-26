/**
 * Industry Benchmarks for Digital Advertising in MENA Region
 * Based on actual market data for Arab countries
 */

export type IndustryType =
  | 'e-commerce'
  | 'real-estate'
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'food-beverage'
  | 'fashion'
  | 'technology'
  | 'travel'
  | 'automotive'
  | 'entertainment'
  | 'beauty'
  | 'fitness'
  | 'nonprofit'
  | 'other';

export type PlatformType = 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'x' | 'linkedin';

export interface IndustryBenchmark {
  avgCTR: number;       // Average Click-Through Rate (percentage)
  avgCPC: number;       // Average Cost Per Click (in USD)
  avgCPM: number;       // Average Cost Per Mille (in USD)
  avgConversionRate: number;  // Average Conversion Rate (percentage)
  avgROAS: number;      // Average Return On Ad Spend (ratio)
  avgEngagementRate: number;  // Average Engagement Rate (percentage)
  notes?: string;
}

export const INDUSTRY_BENCHMARKS: Record<IndustryType, Record<PlatformType, IndustryBenchmark>> = {
  'e-commerce': {
    facebook: { avgCTR: 1.8, avgCPC: 0.85, avgCPM: 12.50, avgConversionRate: 3.2, avgROAS: 3.8, avgEngagementRate: 1.5 },
    instagram: { avgCTR: 1.2, avgCPC: 1.20, avgCPM: 15.00, avgConversionRate: 1.8, avgROAS: 2.5, avgEngagementRate: 2.8 },
    tiktok: { avgCTR: 2.5, avgCPC: 0.60, avgCPM: 8.00, avgConversionRate: 2.5, avgROAS: 4.2, avgEngagementRate: 5.5 },
    snapchat: { avgCTR: 1.5, avgCPC: 0.95, avgCPM: 10.50, avgConversionRate: 2.0, avgROAS: 3.0, avgEngagementRate: 3.2 },
    x: { avgCTR: 0.8, avgCPC: 1.50, avgCPM: 18.00, avgConversionRate: 1.0, avgROAS: 1.5, avgEngagementRate: 0.5 },
    linkedin: { avgCTR: 0.6, avgCPC: 3.50, avgCPM: 25.00, avgConversionRate: 1.2, avgROAS: 2.0, avgEngagementRate: 0.8 },
  },
  'real-estate': {
    facebook: { avgCTR: 1.2, avgCPC: 1.50, avgCPM: 18.00, avgConversionRate: 1.5, avgROAS: 5.0, avgEngagementRate: 1.2 },
    instagram: { avgCTR: 0.9, avgCPC: 2.00, avgCPM: 22.00, avgConversionRate: 0.8, avgROAS: 3.5, avgEngagementRate: 2.0 },
    tiktok: { avgCTR: 1.8, avgCPC: 1.20, avgCPM: 14.00, avgConversionRate: 1.2, avgROAS: 4.0, avgEngagementRate: 4.0 },
    snapchat: { avgCTR: 1.0, avgCPC: 1.80, avgCPM: 16.00, avgConversionRate: 1.0, avgROAS: 3.0, avgEngagementRate: 2.5 },
    x: { avgCTR: 0.5, avgCPC: 2.50, avgCPM: 24.00, avgConversionRate: 0.5, avgROAS: 2.0, avgEngagementRate: 0.4 },
    linkedin: { avgCTR: 0.8, avgCPC: 4.00, avgCPM: 30.00, avgConversionRate: 1.0, avgROAS: 4.0, avgEngagementRate: 0.9 },
  },
  'education': {
    facebook: { avgCTR: 2.0, avgCPC: 0.70, avgCPM: 10.00, avgConversionRate: 4.0, avgROAS: 4.5, avgEngagementRate: 2.0 },
    instagram: { avgCTR: 1.5, avgCPC: 1.00, avgCPM: 13.00, avgConversionRate: 2.5, avgROAS: 3.0, avgEngagementRate: 3.5 },
    tiktok: { avgCTR: 3.0, avgCPC: 0.50, avgCPM: 7.00, avgConversionRate: 3.5, avgROAS: 6.0, avgEngagementRate: 7.0 },
    snapchat: { avgCTR: 1.8, avgCPC: 0.80, avgCPM: 9.00, avgConversionRate: 2.8, avgROAS: 4.0, avgEngagementRate: 4.0 },
    x: { avgCTR: 1.0, avgCPC: 1.20, avgCPM: 15.00, avgConversionRate: 1.5, avgROAS: 2.0, avgEngagementRate: 0.6 },
    linkedin: { avgCTR: 0.7, avgCPC: 3.00, avgCPM: 22.00, avgConversionRate: 1.8, avgROAS: 3.0, avgEngagementRate: 1.0 },
  },
  'healthcare': {
    facebook: { avgCTR: 1.5, avgCPC: 1.20, avgCPM: 15.00, avgConversionRate: 2.0, avgROAS: 2.5, avgEngagementRate: 1.8 },
    instagram: { avgCTR: 1.0, avgCPC: 1.50, avgCPM: 18.00, avgConversionRate: 1.2, avgROAS: 2.0, avgEngagementRate: 2.5 },
    tiktok: { avgCTR: 2.0, avgCPC: 0.90, avgCPM: 11.00, avgConversionRate: 1.8, avgROAS: 3.0, avgEngagementRate: 4.5 },
    snapchat: { avgCTR: 1.3, avgCPC: 1.10, avgCPM: 13.00, avgConversionRate: 1.5, avgROAS: 2.5, avgEngagementRate: 2.8 },
    x: { avgCTR: 0.6, avgCPC: 2.00, avgCPM: 20.00, avgConversionRate: 0.8, avgROAS: 1.5, avgEngagementRate: 0.5 },
    linkedin: { avgCTR: 0.5, avgCPC: 3.50, avgCPM: 28.00, avgConversionRate: 1.0, avgROAS: 2.0, avgEngagementRate: 0.7 },
  },
  'finance': {
    facebook: { avgCTR: 1.3, avgCPC: 1.80, avgCPM: 20.00, avgConversionRate: 2.5, avgROAS: 4.0, avgEngagementRate: 1.2 },
    instagram: { avgCTR: 0.8, avgCPC: 2.20, avgCPM: 25.00, avgConversionRate: 1.5, avgROAS: 3.0, avgEngagementRate: 2.0 },
    tiktok: { avgCTR: 1.5, avgCPC: 1.50, avgCPM: 16.00, avgConversionRate: 2.0, avgROAS: 3.5, avgEngagementRate: 3.5 },
    snapchat: { avgCTR: 1.0, avgCPC: 1.90, avgCPM: 18.00, avgConversionRate: 1.8, avgROAS: 2.5, avgEngagementRate: 2.2 },
    x: { avgCTR: 0.7, avgCPC: 2.80, avgCPM: 26.00, avgConversionRate: 0.8, avgROAS: 2.0, avgEngagementRate: 0.5 },
    linkedin: { avgCTR: 0.9, avgCPC: 5.00, avgCPM: 35.00, avgConversionRate: 1.5, avgROAS: 3.5, avgEngagementRate: 1.0 },
  },
  'food-beverage': {
    facebook: { avgCTR: 2.2, avgCPC: 0.60, avgCPM: 9.00, avgConversionRate: 3.5, avgROAS: 4.5, avgEngagementRate: 2.5 },
    instagram: { avgCTR: 1.8, avgCPC: 0.80, avgCPM: 11.00, avgConversionRate: 2.8, avgROAS: 3.5, avgEngagementRate: 4.0 },
    tiktok: { avgCTR: 3.5, avgCPC: 0.40, avgCPM: 6.00, avgConversionRate: 3.0, avgROAS: 6.5, avgEngagementRate: 8.0 },
    snapchat: { avgCTR: 2.5, avgCPC: 0.60, avgCPM: 8.00, avgConversionRate: 3.2, avgROAS: 5.0, avgEngagementRate: 5.0 },
    x: { avgCTR: 1.0, avgCPC: 1.00, avgCPM: 12.00, avgConversionRate: 1.5, avgROAS: 2.0, avgEngagementRate: 0.8 },
    linkedin: { avgCTR: 0.5, avgCPC: 2.50, avgCPM: 20.00, avgConversionRate: 1.0, avgROAS: 1.5, avgEngagementRate: 0.5 },
  },
  'fashion': {
    facebook: { avgCTR: 1.6, avgCPC: 1.00, avgCPM: 14.00, avgConversionRate: 2.8, avgROAS: 4.0, avgEngagementRate: 2.0 },
    instagram: { avgCTR: 1.4, avgCPC: 1.30, avgCPM: 17.00, avgConversionRate: 2.0, avgROAS: 3.0, avgEngagementRate: 4.5 },
    tiktok: { avgCTR: 2.8, avgCPC: 0.70, avgCPM: 9.00, avgConversionRate: 2.5, avgROAS: 5.0, avgEngagementRate: 7.0 },
    snapchat: { avgCTR: 1.8, avgCPC: 0.90, avgCPM: 11.00, avgConversionRate: 2.2, avgROAS: 3.5, avgEngagementRate: 4.0 },
    x: { avgCTR: 0.7, avgCPC: 1.80, avgCPM: 19.00, avgConversionRate: 1.0, avgROAS: 1.5, avgEngagementRate: 0.6 },
    linkedin: { avgCTR: 0.4, avgCPC: 3.00, avgCPM: 24.00, avgConversionRate: 0.8, avgROAS: 1.5, avgEngagementRate: 0.4 },
  },
  'technology': {
    facebook: { avgCTR: 1.4, avgCPC: 1.40, avgCPM: 16.00, avgConversionRate: 2.2, avgROAS: 3.0, avgEngagementRate: 1.5 },
    instagram: { avgCTR: 1.0, avgCPC: 1.80, avgCPM: 20.00, avgConversionRate: 1.5, avgROAS: 2.5, avgEngagementRate: 2.5 },
    tiktok: { avgCTR: 2.2, avgCPC: 1.00, avgCPM: 12.00, avgConversionRate: 2.0, avgROAS: 3.5, avgEngagementRate: 5.0 },
    snapchat: { avgCTR: 1.2, avgCPC: 1.30, avgCPM: 14.00, avgConversionRate: 1.8, avgROAS: 2.5, avgEngagementRate: 3.0 },
    x: { avgCTR: 0.9, avgCPC: 2.00, avgCPM: 22.00, avgConversionRate: 1.2, avgROAS: 2.5, avgEngagementRate: 0.7 },
    linkedin: { avgCTR: 0.7, avgCPC: 4.50, avgCPM: 32.00, avgConversionRate: 1.5, avgROAS: 3.0, avgEngagementRate: 1.0 },
  },
  'travel': {
    facebook: { avgCTR: 2.5, avgCPC: 0.80, avgCPM: 11.00, avgConversionRate: 3.0, avgROAS: 5.0, avgEngagementRate: 2.8 },
    instagram: { avgCTR: 2.0, avgCPC: 1.10, avgCPM: 14.00, avgConversionRate: 2.5, avgROAS: 4.0, avgEngagementRate: 5.0 },
    tiktok: { avgCTR: 4.0, avgCPC: 0.50, avgCPM: 7.00, avgConversionRate: 3.5, avgROAS: 7.0, avgEngagementRate: 9.0 },
    snapchat: { avgCTR: 2.8, avgCPC: 0.70, avgCPM: 9.00, avgConversionRate: 3.0, avgROAS: 5.5, avgEngagementRate: 5.5 },
    x: { avgCTR: 1.2, avgCPC: 1.40, avgCPM: 16.00, avgConversionRate: 1.5, avgROAS: 2.5, avgEngagementRate: 0.9 },
    linkedin: { avgCTR: 0.6, avgCPC: 3.00, avgCPM: 22.00, avgConversionRate: 1.2, avgROAS: 2.5, avgEngagementRate: 0.6 },
  },
  'automotive': {
    facebook: { avgCTR: 1.5, avgCPC: 1.30, avgCPM: 16.00, avgConversionRate: 1.8, avgROAS: 3.5, avgEngagementRate: 1.8 },
    instagram: { avgCTR: 1.2, avgCPC: 1.70, avgCPM: 20.00, avgConversionRate: 1.2, avgROAS: 2.5, avgEngagementRate: 3.0 },
    tiktok: { avgCTR: 2.5, avgCPC: 0.90, avgCPM: 11.00, avgConversionRate: 1.5, avgROAS: 4.0, avgEngagementRate: 5.5 },
    snapchat: { avgCTR: 1.5, avgCPC: 1.20, avgCPM: 14.00, avgConversionRate: 1.3, avgROAS: 3.0, avgEngagementRate: 3.5 },
    x: { avgCTR: 0.8, avgCPC: 2.20, avgCPM: 22.00, avgConversionRate: 0.6, avgROAS: 1.5, avgEngagementRate: 0.5 },
    linkedin: { avgCTR: 0.5, avgCPC: 4.00, avgCPM: 30.00, avgConversionRate: 0.8, avgROAS: 2.0, avgEngagementRate: 0.5 },
  },
  'entertainment': {
    facebook: { avgCTR: 2.8, avgCPC: 0.50, avgCPM: 8.00, avgConversionRate: 4.0, avgROAS: 5.0, avgEngagementRate: 3.5 },
    instagram: { avgCTR: 2.2, avgCPC: 0.70, avgCPM: 10.00, avgConversionRate: 3.0, avgROAS: 4.0, avgEngagementRate: 6.0 },
    tiktok: { avgCTR: 5.0, avgCPC: 0.30, avgCPM: 5.00, avgConversionRate: 4.5, avgROAS: 8.0, avgEngagementRate: 12.0 },
    snapchat: { avgCTR: 3.5, avgCPC: 0.50, avgCPM: 7.00, avgConversionRate: 3.8, avgROAS: 6.0, avgEngagementRate: 7.0 },
    x: { avgCTR: 1.5, avgCPC: 1.00, avgCPM: 12.00, avgConversionRate: 2.0, avgROAS: 3.0, avgEngagementRate: 1.2 },
    linkedin: { avgCTR: 0.6, avgCPC: 2.80, avgCPM: 22.00, avgConversionRate: 1.0, avgROAS: 2.0, avgEngagementRate: 0.5 },
  },
  'beauty': {
    facebook: { avgCTR: 1.9, avgCPC: 0.90, avgCPM: 13.00, avgConversionRate: 3.0, avgROAS: 4.2, avgEngagementRate: 2.5 },
    instagram: { avgCTR: 1.6, avgCPC: 1.20, avgCPM: 16.00, avgConversionRate: 2.5, avgROAS: 3.5, avgEngagementRate: 5.0 },
    tiktok: { avgCTR: 3.2, avgCPC: 0.55, avgCPM: 8.00, avgConversionRate: 3.0, avgROAS: 5.5, avgEngagementRate: 8.0 },
    snapchat: { avgCTR: 2.0, avgCPC: 0.85, avgCPM: 10.00, avgConversionRate: 2.8, avgROAS: 4.0, avgEngagementRate: 4.5 },
    x: { avgCTR: 0.8, avgCPC: 1.60, avgCPM: 18.00, avgConversionRate: 1.2, avgROAS: 2.0, avgEngagementRate: 0.6 },
    linkedin: { avgCTR: 0.5, avgCPC: 3.20, avgCPM: 26.00, avgConversionRate: 0.8, avgROAS: 1.5, avgEngagementRate: 0.4 },
  },
  'fitness': {
    facebook: { avgCTR: 2.0, avgCPC: 0.75, avgCPM: 10.00, avgConversionRate: 3.5, avgROAS: 4.0, avgEngagementRate: 2.5 },
    instagram: { avgCTR: 1.5, avgCPC: 1.00, avgCPM: 13.00, avgConversionRate: 2.5, avgROAS: 3.0, avgEngagementRate: 4.5 },
    tiktok: { avgCTR: 3.5, avgCPC: 0.45, avgCPM: 6.00, avgConversionRate: 3.0, avgROAS: 5.5, avgEngagementRate: 8.5 },
    snapchat: { avgCTR: 2.2, avgCPC: 0.70, avgCPM: 9.00, avgConversionRate: 2.8, avgROAS: 4.0, avgEngagementRate: 5.0 },
    x: { avgCTR: 1.0, avgCPC: 1.20, avgCPM: 14.00, avgConversionRate: 1.5, avgROAS: 2.5, avgEngagementRate: 0.8 },
    linkedin: { avgCTR: 0.5, avgCPC: 2.80, avgCPM: 22.00, avgConversionRate: 1.0, avgROAS: 2.0, avgEngagementRate: 0.5 },
  },
  'nonprofit': {
    facebook: { avgCTR: 3.0, avgCPC: 0.40, avgCPM: 6.00, avgConversionRate: 5.0, avgROAS: 3.0, avgEngagementRate: 4.0 },
    instagram: { avgCTR: 2.0, avgCPC: 0.60, avgCPM: 8.00, avgConversionRate: 3.5, avgROAS: 2.0, avgEngagementRate: 5.5 },
    tiktok: { avgCTR: 4.5, avgCPC: 0.25, avgCPM: 4.00, avgConversionRate: 5.5, avgROAS: 4.0, avgEngagementRate: 10.0 },
    snapchat: { avgCTR: 3.0, avgCPC: 0.40, avgCPM: 5.00, avgConversionRate: 4.0, avgROAS: 3.0, avgEngagementRate: 6.0 },
    x: { avgCTR: 1.8, avgCPC: 0.80, avgCPM: 10.00, avgConversionRate: 2.0, avgROAS: 1.5, avgEngagementRate: 1.5 },
    linkedin: { avgCTR: 0.8, avgCPC: 2.00, avgCPM: 18.00, avgConversionRate: 1.5, avgROAS: 2.0, avgEngagementRate: 0.8 },
  },
  'other': {
    facebook: { avgCTR: 1.5, avgCPC: 1.00, avgCPM: 14.00, avgConversionRate: 2.5, avgROAS: 3.0, avgEngagementRate: 1.8 },
    instagram: { avgCTR: 1.2, avgCPC: 1.30, avgCPM: 17.00, avgConversionRate: 1.8, avgROAS: 2.5, avgEngagementRate: 3.0 },
    tiktok: { avgCTR: 2.5, avgCPC: 0.70, avgCPM: 9.00, avgConversionRate: 2.2, avgROAS: 4.0, avgEngagementRate: 5.0 },
    snapchat: { avgCTR: 1.5, avgCPC: 1.00, avgCPM: 12.00, avgConversionRate: 2.0, avgROAS: 3.0, avgEngagementRate: 3.5 },
    x: { avgCTR: 0.8, avgCPC: 1.80, avgCPM: 20.00, avgConversionRate: 1.0, avgROAS: 1.8, avgEngagementRate: 0.6 },
    linkedin: { avgCTR: 0.6, avgCPC: 3.50, avgCPM: 28.00, avgConversionRate: 1.2, avgROAS: 2.5, avgEngagementRate: 0.7 },
  },
};

/**
 * Get benchmarks for a specific industry and platform
 */
export function getBenchmark(industry: string, platform: string): IndustryBenchmark | null {
  const industryKey = industry.toLowerCase().replace(/[-\s]/g, '') as IndustryType;
  const platformKey = platform.toLowerCase() as PlatformType;

  const industryData = INDUSTRY_BENCHMARKS[industryKey];
  if (!industryData) {
    // Fallback to 'other'
    return INDUSTRY_BENCHMARKS['other'][platformKey] || null;
  }

  return industryData[platformKey] || null;
}

/**
 * Compare campaign metrics against industry benchmarks
 */
export function compareWithBenchmarks(
  industry: string,
  platform: string,
  metrics: {
    ctr: number;
    cpc: number;
    conversionRate: number;
    cpm: number;
    roas?: number;
  }
): {
  benchmark: IndustryBenchmark | null;
  comparisons: Record<string, { yourValue: number; benchmarkValue: number; difference: number; percentageBetter: number; status: 'above' | 'below' | 'at' }>;
  overallScore: number;
} {
  const benchmark = getBenchmark(industry, platform);
  if (!benchmark) {
    return {
      benchmark: null,
      comparisons: {},
      overallScore: 50,
    };
  }

  const comparisons: Record<string, any> = {};

  // Compare CTR (higher is better)
  const ctrDiff = metrics.ctr - benchmark.avgCTR;
  comparisons.ctr = {
    yourValue: metrics.ctr,
    benchmarkValue: benchmark.avgCTR,
    difference: ctrDiff,
    percentageBetter: ((metrics.ctr - benchmark.avgCTR) / benchmark.avgCTR) * 100,
    status: ctrDiff > 0 ? 'above' : ctrDiff < 0 ? 'below' : 'at',
  };

  // Compare CPC (lower is better)
  const cpcDiff = benchmark.avgCPC - metrics.cpc;
  comparisons.cpc = {
    yourValue: metrics.cpc,
    benchmarkValue: benchmark.avgCPC,
    difference: -metrics.cpc + benchmark.avgCPC,
    percentageBetter: ((benchmark.avgCPC - metrics.cpc) / benchmark.avgCPC) * 100,
    status: cpcDiff > 0 ? 'above' : cpcDiff < 0 ? 'below' : 'at',
  };

  // Compare Conversion Rate (higher is better)
  const convDiff = metrics.conversionRate - benchmark.avgConversionRate;
  comparisons.conversionRate = {
    yourValue: metrics.conversionRate,
    benchmarkValue: benchmark.avgConversionRate,
    difference: convDiff,
    percentageBetter: ((metrics.conversionRate - benchmark.avgConversionRate) / benchmark.avgConversionRate) * 100,
    status: convDiff > 0 ? 'above' : convDiff < 0 ? 'below' : 'at',
  };

  // Compare CPM (lower is better)
  const cpmDiff = benchmark.avgCPM - metrics.cpm;
  comparisons.cpm = {
    yourValue: metrics.cpm,
    benchmarkValue: benchmark.avgCPM,
    difference: -metrics.cpm + benchmark.avgCPM,
    percentageBetter: ((benchmark.avgCPM - metrics.cpm) / benchmark.avgCPM) * 100,
    status: cpmDiff > 0 ? 'above' : cpmDiff < 0 ? 'below' : 'at',
  };

  if (metrics.roas !== undefined) {
    const roasDiff = metrics.roas - benchmark.avgROAS;
    comparisons.roas = {
      yourValue: metrics.roas,
      benchmarkValue: benchmark.avgROAS,
      difference: roasDiff,
      percentageBetter: ((metrics.roas - benchmark.avgROAS) / benchmark.avgROAS) * 100,
      status: roasDiff > 0 ? 'above' : roasDiff < 0 ? 'below' : 'at',
    };
  }

  // Calculate overall score (0-100)
  let score = 50; // Start at average
  const weights = { ctr: 0.25, cpc: 0.15, conversionRate: 0.35, cpm: 0.1, roas: 0.15 };

  if (comparisons.ctr) score += comparisons.ctr.percentageBetter * 0.01 * weights.ctr * 50;
  if (comparisons.cpc) score += comparisons.cpc.percentageBetter * 0.01 * weights.cpc * 50;
  if (comparisons.conversionRate) score += comparisons.conversionRate.percentageBetter * 0.01 * weights.conversionRate * 50;
  if (comparisons.cpm) score += comparisons.cpm.percentageBetter * 0.01 * weights.cpm * 50;
  if (comparisons.roas) score += comparisons.roas.percentageBetter * 0.01 * weights.roas * 50;

  const overallScore = Math.max(0, Math.min(100, Math.round(score)));

  return { benchmark, comparisons, overallScore };
}

export default { INDUSTRY_BENCHMARKS, getBenchmark, compareWithBenchmarks };

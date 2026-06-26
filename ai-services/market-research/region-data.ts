/**
 * Regional market data for Arab countries
 * Population, internet usage, social media penetration, and e-commerce metrics
 */

export interface RegionData {
  population: number;
  internetUsers: number;
  socialMediaUsers: number;
  avgSpendOnline: number; // USD per year
  topPlatforms: string[];
  currency: string;
  language: string;
  gdpPerCapita: number;
  ecommerceGrowth: number; // Percentage growth rate
  mobilePenetration: number;
  medianAge: number;
  internetPenetration: number;
  socialMediaPenetration: number;
}

export const REGION_DATA: Record<string, RegionData> = {
  'saudi-arabia': {
    population: 36100000,
    internetUsers: 34000000,
    socialMediaUsers: 32000000,
    avgSpendOnline: 1500,
    topPlatforms: ['snapchat', 'tiktok', 'instagram', 'x', 'facebook', 'youtube'],
    currency: 'SAR',
    language: 'ar',
    gdpPerCapita: 32000,
    ecommerceGrowth: 0.32,
    mobilePenetration: 0.98,
    medianAge: 30,
    internetPenetration: 0.94,
    socialMediaPenetration: 0.89,
  },
  'uae': {
    population: 10000000,
    internetUsers: 9900000,
    socialMediaUsers: 9500000,
    avgSpendOnline: 2500,
    topPlatforms: ['instagram', 'facebook', 'tiktok', 'snapchat', 'x', 'linkedin'],
    currency: 'AED',
    language: 'ar',
    gdpPerCapita: 48000,
    ecommerceGrowth: 0.28,
    mobilePenetration: 0.99,
    medianAge: 33,
    internetPenetration: 0.99,
    socialMediaPenetration: 0.95,
  },
  'egypt': {
    population: 110000000,
    internetUsers: 72000000,
    socialMediaUsers: 59000000,
    avgSpendOnline: 400,
    topPlatforms: ['facebook', 'tiktok', 'instagram', 'x', 'youtube', 'snapchat'],
    currency: 'EGP',
    language: 'ar',
    gdpPerCapita: 4000,
    ecommerceGrowth: 0.45,
    mobilePenetration: 0.95,
    medianAge: 24,
    internetPenetration: 0.65,
    socialMediaPenetration: 0.54,
  },
  'qatar': {
    population: 3000000,
    internetUsers: 2900000,
    socialMediaUsers: 2700000,
    avgSpendOnline: 3000,
    topPlatforms: ['instagram', 'snapchat', 'tiktok', 'x', 'facebook', 'linkedin'],
    currency: 'QAR',
    language: 'ar',
    gdpPerCapita: 62000,
    ecommerceGrowth: 0.25,
    mobilePenetration: 0.99,
    medianAge: 32,
    internetPenetration: 0.97,
    socialMediaPenetration: 0.90,
  },
  'kuwait': {
    population: 4800000,
    internetUsers: 4600000,
    socialMediaUsers: 4200000,
    avgSpendOnline: 2000,
    topPlatforms: ['instagram', 'snapchat', 'tiktok', 'x', 'facebook', 'youtube'],
    currency: 'KWD',
    language: 'ar',
    gdpPerCapita: 38000,
    ecommerceGrowth: 0.30,
    mobilePenetration: 0.98,
    medianAge: 31,
    internetPenetration: 0.96,
    socialMediaPenetration: 0.88,
  },
  'oman': {
    population: 4600000,
    internetUsers: 4100000,
    socialMediaUsers: 3600000,
    avgSpendOnline: 1200,
    topPlatforms: ['facebook', 'instagram', 'snapchat', 'tiktok', 'x', 'youtube'],
    currency: 'OMR',
    language: 'ar',
    gdpPerCapita: 19000,
    ecommerceGrowth: 0.35,
    mobilePenetration: 0.96,
    medianAge: 28,
    internetPenetration: 0.89,
    socialMediaPenetration: 0.78,
  },
  'bahrain': {
    population: 1800000,
    internetUsers: 1750000,
    socialMediaUsers: 1600000,
    avgSpendOnline: 1800,
    topPlatforms: ['instagram', 'facebook', 'tiktok', 'snapchat', 'x', 'linkedin'],
    currency: 'BHD',
    language: 'ar',
    gdpPerCapita: 27000,
    ecommerceGrowth: 0.30,
    mobilePenetration: 0.99,
    medianAge: 32,
    internetPenetration: 0.97,
    socialMediaPenetration: 0.89,
  },
  'jordan': {
    population: 11000000,
    internetUsers: 9000000,
    socialMediaUsers: 7200000,
    avgSpendOnline: 600,
    topPlatforms: ['facebook', 'instagram', 'tiktok', 'x', 'youtube', 'snapchat'],
    currency: 'JOD',
    language: 'ar',
    gdpPerCapita: 4200,
    ecommerceGrowth: 0.38,
    mobilePenetration: 0.93,
    medianAge: 24,
    internetPenetration: 0.82,
    socialMediaPenetration: 0.65,
  },
};

/**
 * Platform-specific data for each market
 */
export interface PlatformMarketData {
  penetration: Record<string, number>; // Country -> penetration rate
  demographics: {
    ageGroups: Record<string, number>;
    genderSplit: { male: number; female: number };
  };
  bestTimes: Record<string, string[]>; // Country -> best posting times
  avgTimePerDay: number; // minutes
  adReach: number;
}

export const PLATFORM_MARKET_DATA: Record<string, PlatformMarketData> = {
  facebook: {
    penetration: {
      'saudi-arabia': 0.45,
      'uae': 0.55,
      'egypt': 0.75,
      'qatar': 0.40,
      'kuwait': 0.50,
      'oman': 0.60,
      'bahrain': 0.52,
    },
    demographics: {
      ageGroups: { '18-24': 0.20, '25-34': 0.35, '35-44': 0.25, '45+': 0.20 },
      genderSplit: { male: 0.55, female: 0.45 },
    },
    bestTimes: {
      'saudi-arabia': ['10:00-12:00', '16:00-18:00', '21:00-23:00'],
      'uae': ['09:00-11:00', '15:00-17:00', '20:00-22:00'],
      'egypt': ['11:00-13:00', '17:00-19:00', '22:00-00:00'],
    },
    avgTimePerDay: 35,
    adReach: 28000000,
  },
  instagram: {
    penetration: {
      'saudi-arabia': 0.65,
      'uae': 0.75,
      'egypt': 0.45,
      'qatar': 0.70,
      'kuwait': 0.72,
      'oman': 0.50,
      'bahrain': 0.68,
    },
    demographics: {
      ageGroups: { '18-24': 0.35, '25-34': 0.38, '35-44': 0.18, '45+': 0.09 },
      genderSplit: { male: 0.48, female: 0.52 },
    },
    bestTimes: {
      'saudi-arabia': ['11:00-13:00', '17:00-19:00', '21:00-23:00'],
      'uae': ['10:00-12:00', '16:00-18:00', '20:00-22:00'],
      'egypt': ['12:00-14:00', '18:00-20:00', '22:00-00:00'],
    },
    avgTimePerDay: 28,
    adReach: 22000000,
  },
  tiktok: {
    penetration: {
      'saudi-arabia': 0.70,
      'uae': 0.68,
      'egypt': 0.55,
      'qatar': 0.62,
      'kuwait': 0.65,
      'oman': 0.45,
      'bahrain': 0.58,
    },
    demographics: {
      ageGroups: { '13-17': 0.25, '18-24': 0.40, '25-34': 0.25, '35+': 0.10 },
      genderSplit: { male: 0.42, female: 0.58 },
    },
    bestTimes: {
      'saudi-arabia': ['12:00-14:00', '18:00-20:00', '22:00-00:00'],
      'uae': ['11:00-13:00', '17:00-19:00', '21:00-23:00'],
      'egypt': ['13:00-15:00', '19:00-21:00', '23:00-01:00'],
    },
    avgTimePerDay: 52,
    adReach: 35000000,
  },
  snapchat: {
    penetration: {
      'saudi-arabia': 0.80,
      'uae': 0.60,
      'egypt': 0.30,
      'qatar': 0.65,
      'kuwait': 0.70,
      'oman': 0.40,
      'bahrain': 0.55,
    },
    demographics: {
      ageGroups: { '13-17': 0.30, '18-24': 0.40, '25-34': 0.22, '35+': 0.08 },
      genderSplit: { male: 0.45, female: 0.55 },
    },
    bestTimes: {
      'saudi-arabia': ['10:00-12:00', '16:00-18:00', '21:00-23:00'],
      'uae': ['09:00-11:00', '15:00-17:00', '20:00-22:00'],
      'egypt': ['11:00-13:00', '17:00-19:00', '22:00-00:00'],
    },
    avgTimePerDay: 25,
    adReach: 25000000,
  },
  x: {
    penetration: {
      'saudi-arabia': 0.55,
      'uae': 0.50,
      'egypt': 0.25,
      'qatar': 0.48,
      'kuwait': 0.52,
      'oman': 0.30,
      'bahrain': 0.45,
    },
    demographics: {
      ageGroups: { '18-24': 0.30, '25-34': 0.38, '35-44': 0.20, '45+': 0.12 },
      genderSplit: { male: 0.62, female: 0.38 },
    },
    bestTimes: {
      'saudi-arabia': ['08:00-10:00', '14:00-16:00', '20:00-22:00'],
      'uae': ['07:00-09:00', '13:00-15:00', '19:00-21:00'],
      'egypt': ['09:00-11:00', '15:00-17:00', '21:00-23:00'],
    },
    avgTimePerDay: 20,
    adReach: 15000000,
  },
  linkedin: {
    penetration: {
      'saudi-arabia': 0.30,
      'uae': 0.45,
      'egypt': 0.15,
      'qatar': 0.38,
      'kuwait': 0.32,
      'oman': 0.20,
      'bahrain': 0.35,
    },
    demographics: {
      ageGroups: { '18-24': 0.15, '25-34': 0.40, '35-44': 0.30, '45+': 0.15 },
      genderSplit: { male: 0.58, female: 0.42 },
    },
    bestTimes: {
      'saudi-arabia': ['08:00-10:00', '13:00-15:00', '20:00-22:00'],
      'uae': ['07:00-09:00', '12:00-14:00', '19:00-21:00'],
      'egypt': ['09:00-11:00', '14:00-16:00', '21:00-23:00'],
    },
    avgTimePerDay: 15,
    adReach: 8000000,
  },
};

/**
 * Get region data for a specific market
 */
export function getRegionData(market: string): RegionData | null {
  return REGION_DATA[market.toLowerCase()] || null;
}

/**
 * Get platform data for a specific platform
 */
export function getPlatformData(platform: string): PlatformMarketData | null {
  return PLATFORM_MARKET_DATA[platform.toLowerCase()] || null;
}

/**
 * Get best posting times for a specific platform and market
 */
export function getBestTimes(platform: string, market: string): string[] {
  const platformData = PLATFORM_MARKET_DATA[platform.toLowerCase()];
  if (!platformData) return ['10:00-12:00', '16:00-18:00', '21:00-23:00'];

  const marketTimes = platformData.bestTimes[market.toLowerCase()];
  return marketTimes || platformData.bestTimes['saudi-arabia'] || ['10:00-12:00', '16:00-18:00', '21:00-23:00'];
}

/**
 * Calculate market opportunity score (0-100)
 */
export function calculateMarketScore(industry: string, market: string): {
  score: number;
  factors: Record<string, number>;
} {
  const region = REGION_DATA[market.toLowerCase()];
  if (!region) return { score: 50, factors: { base: 50 } };

  const factors = {
    internetPenetration: region.internetPenetration * 25,
    socialMediaPenetration: region.socialMediaPenetration * 20,
    ecommerceGrowth: region.ecommerceGrowth * 20,
    gdpPerCapita: Math.min(region.gdpPerCapita / 1000, 30),
    population: Math.min(Math.log10(region.population) * 5, 15),
  };

  const score = Math.round(Object.values(factors).reduce((a, b) => a + b, 0));
  return { score: Math.min(100, score), factors };
}

export default { REGION_DATA, PLATFORM_MARKET_DATA, getRegionData, getPlatformData, getBestTimes, calculateMarketScore };

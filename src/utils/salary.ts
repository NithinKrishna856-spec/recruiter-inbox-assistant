export type PayTier = 'top' | 'high' | 'competitive' | 'modest' | 'undisclosed';

export interface ParsedSalary {
  raw: string;
  minAnnual: number | null;
  maxAnnual: number | null;
  avgAnnual: number | null;
  isHourly: boolean;
  tier: PayTier;
  tierLabel: string;
  formattedDisplay: string;
  barStartPercent: number; // 0 to 100
  barWidthPercent: number; // 0 to 100
}

// Baseline salary scale for new grad software engineers: $40,000 to $160,000
const SCALE_MIN = 40000;
const SCALE_MAX = 160000;

export function parseSalary(payString?: string | null): ParsedSalary {
  if (!payString || payString.trim().toLowerCase() === 'not mentioned' || payString.trim().toLowerCase() === 'undisclosed') {
    return {
      raw: payString || 'Not mentioned',
      minAnnual: null,
      maxAnnual: null,
      avgAnnual: null,
      isHourly: false,
      tier: 'undisclosed',
      tierLabel: 'Undisclosed',
      formattedDisplay: 'Undisclosed',
      barStartPercent: 0,
      barWidthPercent: 0,
    };
  }

  const clean = payString.replace(/,/g, '');
  const isHourly = /hour|hr|\/hr|\/hour/i.test(clean) && !/year|yr|\/yr|\/year/i.test(clean);

  // Extract all numbers matching $XX or XXk or XX
  const numbers: number[] = [];
  const regex = /\$?(\d+(?:\.\d+)?)\s*(k|thousand)?/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(clean)) !== null) {
    const val = parseFloat(match[1]);
    const multiplier = match[2]?.toLowerCase() === 'k' || match[2]?.toLowerCase() === 'thousand' ? 1000 : 1;
    let finalVal = val * multiplier;

    // Filter out common years like 2024, 2025, 2026 if accidental
    if (finalVal >= 2020 && finalVal <= 2030 && !clean.includes('$20')) {
      continue;
    }

    numbers.push(finalVal);
  }

  if (numbers.length === 0) {
    return {
      raw: payString,
      minAnnual: null,
      maxAnnual: null,
      avgAnnual: null,
      isHourly,
      tier: 'undisclosed',
      tierLabel: 'Undisclosed',
      formattedDisplay: payString,
      barStartPercent: 0,
      barWidthPercent: 0,
    };
  }

  let min = Math.min(...numbers);
  let max = Math.max(...numbers);

  // If hourly rate (e.g. $35/hr), convert to standard 2080-hour annual equivalent
  if (isHourly || (min < 200 && max < 200)) {
    const hourlyMin = min;
    const hourlyMax = max;
    const annualMin = Math.round(hourlyMin * 2080);
    const annualMax = Math.round(hourlyMax * 2080);

    const avg = (annualMin + annualMax) / 2;
    const tier = getTier(avg);

    const formatted = hourlyMin === hourlyMax
      ? `$${hourlyMin}/hr (~$${Math.round(annualMin / 1000)}k/yr)`
      : `$${hourlyMin}–$${hourlyMax}/hr (~$${Math.round(annualMin / 1000)}k–$${Math.round(annualMax / 1000)}k/yr)`;

    const { start, width } = calculateBarPercents(annualMin, annualMax);

    return {
      raw: payString,
      minAnnual: annualMin,
      maxAnnual: annualMax,
      avgAnnual: avg,
      isHourly: true,
      tier,
      tierLabel: getTierLabel(tier),
      formattedDisplay: formatted,
      barStartPercent: start,
      barWidthPercent: width,
    };
  }

  // If numbers were written like "120 - 140" without k or zeros, assume k if between 40 and 300
  if (min >= 30 && min <= 300 && max >= 30 && max <= 300) {
    min *= 1000;
    max *= 1000;
  }

  const avg = (min + max) / 2;
  const tier = getTier(avg);

  const formatted = min === max
    ? `$${Math.round(min / 1000)}k/yr`
    : `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k/yr`;

  const { start, width } = calculateBarPercents(min, max);

  return {
    raw: payString,
    minAnnual: min,
    maxAnnual: max,
    avgAnnual: avg,
    isHourly: false,
    tier,
    tierLabel: getTierLabel(tier),
    formattedDisplay: formatted,
    barStartPercent: start,
    barWidthPercent: width,
  };
}

function getTier(annualSalary: number): PayTier {
  if (annualSalary >= 125000) return 'top';
  if (annualSalary >= 95000) return 'high';
  if (annualSalary >= 65000) return 'competitive';
  return 'modest';
}

function getTierLabel(tier: PayTier): string {
  switch (tier) {
    case 'top':
      return 'Top Tier ($125k+)';
    case 'high':
      return 'High Tier ($95k–$125k)';
    case 'competitive':
      return 'Competitive ($65k–$95k)';
    case 'modest':
      return 'Entry / Modest (<$65k)';
    case 'undisclosed':
    default:
      return 'Undisclosed';
  }
}

function calculateBarPercents(min: number, max: number): { start: number; width: number } {
  const clampedMin = Math.max(SCALE_MIN, Math.min(SCALE_MAX, min));
  const clampedMax = Math.max(SCALE_MIN, Math.min(SCALE_MAX, max));

  const startPercent = ((clampedMin - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const endPercent = ((clampedMax - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const widthPercent = Math.max(8, endPercent - startPercent);

  return {
    start: Math.min(92, Math.max(0, Math.round(startPercent))),
    width: Math.min(100, Math.max(8, Math.round(widthPercent))),
  };
}

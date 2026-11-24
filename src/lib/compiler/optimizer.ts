// ============================================================
// SwaraScript Optimizer (Module 2, Phase 5)
// Merge rests, fold constants, remove silent/duplicate events
// ============================================================

import { MusicEvent } from './eventgen';

export interface OptimizationReport {
  originalCount: number;
  optimizedCount: number;
  reductionPercent: number;
  optimizations: string[];
  originalDuration: number;
  optimizedDuration: number;
}

export interface OptimizeResult {
  events: MusicEvent[];
  report: OptimizationReport;
}

export function optimize(events: MusicEvent[]): OptimizeResult {
  const originalCount = events.length;
  const originalDuration = events.length > 0
    ? Math.max(...events.map(e => e.startTime + e.duration))
    : 0;
  const optimizations: string[] = [];
  let result = [...events];

  // 1. Remove zero-duration events
  const beforeZero = result.length;
  result = result.filter(e => e.duration > 0);
  if (result.length < beforeZero) {
    optimizations.push(`Removed ${beforeZero - result.length} zero-duration event(s)`);
  }

  // 2. Remove silent NOTE events (velocity = 0)
  const beforeSilent = result.length;
  result = result.filter(e => !(e.type === 'NOTE' && e.velocity === 0));
  if (result.length < beforeSilent) {
    optimizations.push(`Removed ${beforeSilent - result.length} silent note event(s)`);
  }

  // 3. Merge consecutive REST events
  const merged: MusicEvent[] = [];
  let mergedRests = 0;
  for (let i = 0; i < result.length; i++) {
    const current = result[i];
    if (
      current.type === 'REST' &&
      merged.length > 0 &&
      merged[merged.length - 1].type === 'REST'
    ) {
      // Merge: extend the previous rest
      const prev = merged[merged.length - 1];
      prev.duration += current.duration;
      mergedRests++;
    } else {
      merged.push({ ...current });
    }
  }
  if (mergedRests > 0) {
    optimizations.push(`Merged ${mergedRests} consecutive rest(s)`);
  }
  result = merged;

  // 4. Remove duplicate events at the same time with same pitch and duration
  const beforeDup = result.length;
  const seen = new Set<string>();
  result = result.filter(e => {
    const key = `${e.type}:${e.startTime.toFixed(4)}:${e.pitch || 'rest'}:${e.duration.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (result.length < beforeDup) {
    optimizations.push(`Removed ${beforeDup - result.length} duplicate event(s)`);
  }

  // 5. Recalculate start times to be sequential
  let time = 0;
  for (const event of result) {
    event.startTime = time;
    time += event.duration;
  }

  // Re-assign IDs
  result.forEach((e, i) => { e.id = i; });

  const optimizedDuration = time;
  const optimizedCount = result.length;
  const reductionPercent = originalCount > 0
    ? Math.round(((originalCount - optimizedCount) / originalCount) * 100)
    : 0;

  if (optimizations.length === 0) {
    optimizations.push('No optimizations applicable — event code is already optimal');
  }

  return {
    events: result,
    report: {
      originalCount,
      optimizedCount,
      reductionPercent,
      optimizations,
      originalDuration,
      optimizedDuration,
    },
  };
}

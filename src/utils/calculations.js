/**
 * Pure functions: raw metric in, 0.0 - 1.0 ratio out. No I/O occurs here.
 * These functions translate systeminformation data into normalized ratios 
 * for UI consumption.
 */

/**
 * Enforces strict 0.0 to 1.0 boundaries on any numeric value.
 * 
 * @param {number} value - The raw calculated value.
 * @returns {number} A float strictly clamped between 0 and 1.
 */
export function clampRatio(value) {
  return Math.min(1, Math.max(0, value));
}

/**
 * Normalizes overall CPU utilization into a rendering ratio.
 * 
 * @param {number} currentLoadPercent - The CPU load percentage (0-100).
 * @returns {number} A normalized ratio (0.0 to 1.0).
 */
export function cpuLoadRatio(currentLoadPercent) {
  return clampRatio(currentLoadPercent / 100);
}

/**
 * Extracts and normalizes GPU utilization from the system graphics array.
 * Note: Depends heavily on OS and driver support.
 * 
 * @param {Array<Object>} controllers - Array of GPU controllers from `si.graphics()`.
 * @returns {number|null} A normalized ratio (0.0 to 1.0), or null if unsupported.
 */
export function gpuLoadRatio(controllers) {
  const gpu = (controllers || []).find((c) => typeof c.utilizationGpu === "number");
  if (!gpu) return null;
  return clampRatio(gpu.utilizationGpu / 100);
}

/**
 * Calculates memory usage based on active/used bytes versus total capacity.
 * 
 * @param {Object} memInfo - Memory data object from `si.mem()`.
 * @returns {number} A normalized ratio (0.0 to 1.0). Returns 0 if data is invalid.
 */
export function memRatio(memInfo) {
  if (!memInfo || !memInfo.total) return 0;
  // Fallback to 'used' if 'active' memory metric is unavailable
  const used = memInfo.active ?? memInfo.used;
  return clampRatio(used / memInfo.total);
}

/**
 * Normalizes battery charge level. Returns null for desktop setups.
 * 
 * @param {Object} batteryInfo - Battery data object from `si.battery()`.
 * @returns {number|null} A normalized ratio (0.0 to 1.0), or null if no battery exists.
 */
export function batteryRatio(batteryInfo) {
  if (!batteryInfo || !batteryInfo.hasBattery) return null;
  return clampRatio((batteryInfo.percent || 0) / 100);
}

/**
 * Normalizes system temperature against a defined thermal floor and ceiling.
 * 
 * @param {number} celsius - The raw temperature in degrees Celsius.
 * @param {number} [min=30] - The expected idle temperature (floor).
 * @param {number} [max=100] - The critical throttling temperature (ceiling).
 * @returns {number|null} A normalized ratio (0.0 to 1.0), or null if sensor fails.
 */
export function tempRatio(celsius, min = 30, max = 100) {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return null;
  return clampRatio((celsius - min) / (max - min));
}

/**
 * Identifies the largest mounted filesystem and calculates its capacity ratio.
 * 
 * @param {Array<Object>} fsArray - Array of filesystem data from `si.fsSize()`.
 * @returns {number} A normalized ratio (0.0 to 1.0). Returns 0 if no disks are found.
 */
export function diskRatio(fsArray) {
  if (!fsArray || fsArray.length === 0) return 0;
  const largest = fsArray.reduce((a, b) => (b.size > a.size ? b : a), fsArray[0]);
  if (!largest.size) return 0;
  return clampRatio(largest.used / largest.size);
}

// CGO: aggregate storage usage across every real filesystem, as one
// percentage — a fleet-wide "how full is everything" glance, distinct
// from the per-partition breakdown in the Cargo Bays panel.
export function aggregateDiskRatio(fsArray) {
  if (!fsArray || fsArray.length === 0) return 0;
  const totals = fsArray.reduce(
    (acc, fs) => {
      acc.used += fs.used || 0;
      acc.size += fs.size || 0;
      return acc;
    },
    { used: 0, size: 0 }
  );
  if (!totals.size) return 0;
  return clampRatio(totals.used / totals.size);
}

/**
 * Stateful tracker for network throughput.
 * Because network speeds have no fixed "100%" ceiling, this class tracks a 
 * slow-decaying peak value to create an auto-scaling VU meter effect.
 */
export class NetworkPressureTracker {
  /**
   * @param {number} [decay=0.98] - The rate at which the peak value decays per tick. 
   * Closer to 1.0 creates a slower decay.
   */
  constructor(decay = 0.98) {
    this.peak = 1; // Initialized to 1 to prevent divide-by-zero errors
    this.decay = decay;
  }

  /**
   * Ingests a new throughput reading and recalculates the dynamic ratio.
   * 
   * @param {number} bytesPerSec - The current combined RX/TX network speed.
   * @returns {Object} An object containing the 0-1 ratio, current peak, and raw value.
   */
  sample(bytesPerSec) {
    this.peak = Math.max(bytesPerSec, this.peak * this.decay, 1);
    return {
      ratio: clampRatio(bytesPerSec / this.peak),
      peak: this.peak,
      raw: bytesPerSec,
    };
  }
}

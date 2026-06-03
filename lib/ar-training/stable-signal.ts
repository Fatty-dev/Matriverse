/**
 * Debounces noisy per-frame booleans (e.g. pose visibility) for stable UI.
 */
export class StableBoolean {
  private stable = false;
  private goodStreak = 0;
  private badStreak = 0;

  constructor(
    private readonly turnOnAfterFrames: number = 10,
    private readonly turnOffAfterFrames: number = 6
  ) {}

  update(raw: boolean): boolean {
    if (raw) {
      this.goodStreak += 1;
      this.badStreak = 0;
      if (!this.stable && this.goodStreak >= this.turnOnAfterFrames) {
        this.stable = true;
      }
    } else {
      this.badStreak += 1;
      this.goodStreak = 0;
      if (this.stable && this.badStreak >= this.turnOffAfterFrames) {
        this.stable = false;
      }
    }
    return this.stable;
  }

  /** 0–1 progress toward turning on (for loading-style UI). */
  getOnProgress(): number {
    if (this.stable) return 1;
    return Math.min(1, this.goodStreak / this.turnOnAfterFrames);
  }

  reset(): void {
    this.stable = false;
    this.goodStreak = 0;
    this.badStreak = 0;
  }
}

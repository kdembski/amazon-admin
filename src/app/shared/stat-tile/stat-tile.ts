import { Component, computed, input } from '@angular/core';

const NUMBER = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });

@Component({
  selector: 'app-stat-tile',
  template: `
    <span class="label">{{ label() }}</span>
    <strong class="value">{{ formatted() }}</strong>
    @if (change(); as change) {
      <span class="change" [class.up]="change > 0" [class.down]="change < 0">
        {{ change > 0 ? '+' : '' }}{{ change }}%
      </span>
    }
  `,
  styleUrl: './stat-tile.scss',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly previous = input<number | null>(null);

  protected readonly formatted = computed(() => NUMBER.format(this.value()));
  protected readonly change = computed(() => {
    const previous = this.previous();
    return previous ? Math.round(((this.value() - previous) / previous) * 100) : null;
  });
}

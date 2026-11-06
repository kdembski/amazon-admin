import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { formatNumber } from '@app/shared/format/format-number';
import { SummaryPeriod, SummaryTile } from '@app/types/summary';

@Component({
  selector: 'app-summary-panels',
  imports: [NgTemplateOutlet],
  templateUrl: './summary-panels.html',
  styleUrl: './summary-panels.scss',
})
export class SummaryPanels {
  readonly periods = input.required<SummaryPeriod[]>();

  protected readonly formatNumber = formatNumber;

  // Two independent columns, so a long tile does not stretch its neighbour.
  protected columns(tiles: SummaryTile[]) {
    return [0, 1].map((column) => {
      return tiles.filter((tile, index) => (tile.column ?? index % 2) === column);
    });
  }

  // Without any change in the details, e.g. country outlier channels, the change column goes away.
  protected hasChange(tile: SummaryTile) {
    return tile.details.some((detail) => detail.change !== null);
  }
}

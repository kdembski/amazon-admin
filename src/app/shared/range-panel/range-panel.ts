import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RANGE_PRESETS } from '@app/shared/time-range/time-range';
import { RangePanelSource } from '@app/types/range-panel';

@Component({
  selector: 'app-range-panel',
  imports: [DatePipe, MatButtonToggleModule],
  templateUrl: './range-panel.html',
  styleUrl: './range-panel.scss',
})
export class RangePanel {
  readonly heading = input.required<string>();
  readonly source = input.required<RangePanelSource>();
  // Panels whose data has no range, e.g. the latest scraper reports, hide the range toggle.
  readonly ranged = input(true);

  protected readonly presets = RANGE_PRESETS;
}

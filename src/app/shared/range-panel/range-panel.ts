import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RememberedHeight } from '@app/shared/remembered-height/remembered-height';
import { RANGE_PRESETS } from '@app/shared/time-range/time-range';
import { RangePanelSource } from '@app/types/range-panel';

@Component({
  selector: 'app-range-panel',
  imports: [DatePipe, MatButtonToggleModule, MatProgressSpinner, RememberedHeight],
  templateUrl: './range-panel.html',
  styleUrl: './range-panel.scss',
})
export class RangePanel {
  readonly heading = input.required<string>();
  readonly source = input.required<RangePanelSource>();
  readonly ranged = input(true);
  readonly chart = input(false);

  protected readonly presets = RANGE_PRESETS;
}

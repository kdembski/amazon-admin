import { Component } from '@angular/core';

// The shape of SummaryPanels while the summary loads; its height comes from --summary-height.
@Component({
  selector: 'app-summary-skeleton',
  host: { role: 'status', 'aria-label': 'Loading' },
  template: `
    @for (panel of [0, 1]; track panel) {
      <div class="panel" aria-hidden="true">
        <span class="bar heading"></span>
        <div class="tiles">
          @for (tile of [0, 1, 2, 3]; track tile) {
            <div class="tile">
              <span class="bar label"></span>
              <span class="bar value"></span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './summary-skeleton.scss',
})
export class SummarySkeleton {}

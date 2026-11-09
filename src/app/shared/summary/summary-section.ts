import { Component, input } from '@angular/core';
import { RememberedHeight } from '@app/shared/remembered-height/remembered-height';
import { SummarySource } from '@app/types/summary';
import { SummaryPanels } from './summary-panels';
import { SummarySkeleton } from './summary-skeleton';

@Component({
  selector: 'app-summary-section',
  imports: [RememberedHeight, SummaryPanels, SummarySkeleton],
  host: { '[style.--remembered-height]': "defaultHeight() + 'px'" },
  template: `
    <section
      class="summary"
      [attr.aria-label]="label()"
      [appRememberedHeight]="storageKey()"
      [loaded]="source().data() !== null"
    >
      @if (source().data(); as periods) {
        <app-summary-panels [periods]="periods" />
      } @else if (source().error(); as error) {
        <p class="error" role="alert">Failed to load the summary: {{ error }}</p>
      } @else {
        <app-summary-skeleton />
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .summary {
      display: grid;
      align-content: start;
      min-height: var(--remembered-height);
    }
  `,
})
export class SummarySection {
  readonly source = input.required<SummarySource>();
  readonly label = input.required<string>();
  readonly storageKey = input.required<string>();
  readonly defaultHeight = input.required<number>();
}

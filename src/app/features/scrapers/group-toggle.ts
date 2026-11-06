import { Component, input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ScraperCountKey } from '@app/types/api-dtos';
import { GroupedChartSource } from '@app/types/chart';

@Component({
  selector: 'app-group-toggle',
  imports: [MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      hideSingleSelectionIndicator
      [value]="source().group()"
      (change)="source().setGroup($event.value)"
      [attr.aria-label]="label()"
    >
      <mat-button-toggle value="country">Country</mat-button-toggle>
      <mat-button-toggle value="scraper">Scraper</mat-button-toggle>
    </mat-button-toggle-group>
  `,
})
export class GroupToggle {
  readonly source = input.required<GroupedChartSource<ScraperCountKey>>();
  readonly label = input.required<string>();
}

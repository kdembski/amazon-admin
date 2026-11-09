import { Component, input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CountryToggleSource } from '@app/types/scrapers';

@Component({
  selector: 'app-country-toggle',
  imports: [MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      multiple
      hideMultipleSelectionIndicator
      [attr.aria-label]="label()"
      [value]="source().visibleCountries()"
      (change)="source().setVisibleCountries($event.value)"
    >
      @for (country of source().countries(); track country) {
        <mat-button-toggle [value]="country">{{ country }}</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
})
export class CountryToggle {
  readonly source = input.required<CountryToggleSource>();
  readonly label = input.required<string>();
}

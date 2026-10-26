import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TimeRangePicker } from '@app/shared/time-range/time-range-picker';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TimeRangePicker],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}

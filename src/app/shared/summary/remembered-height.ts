import { afterRenderEffect, computed, Directive, ElementRef, inject, input } from '@angular/core';

const read = (key: string) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as {
      width: number;
      height: number;
    } | null;

    // Another window width can wrap the panels differently.
    return saved?.width === window.innerWidth ? saved.height : null;
  } catch {
    return null;
  }
};

const save = (key: string, height: number) => {
  try {
    localStorage.setItem(key, JSON.stringify({ width: window.innerWidth, height }));
  } catch {
    // Without storage the next load falls back to the default height.
  }
};

// The height depends on the data, so the skeleton takes it from the previous load. Before the
// first load in this browser, or at a new window width, the default of --summary-height applies.
@Directive({
  selector: '[appRememberedHeight]',
  host: { '[style.--summary-height]': 'height()' },
})
export class RememberedHeight {
  readonly key = input.required<string>({ alias: 'appRememberedHeight' });
  readonly loaded = input.required<boolean>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly remembered = computed(() => read(this.key()));

  protected readonly height = computed(() => {
    if (this.loaded()) {
      return '0px';
    }

    const remembered = this.remembered();

    return remembered === null ? null : `${remembered}px`;
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.loaded()) {
        save(this.key(), this.element.offsetHeight);
      }
    });
  }
}

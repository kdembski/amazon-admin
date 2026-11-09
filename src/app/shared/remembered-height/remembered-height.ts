import { afterRenderEffect, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { SavedHeight } from '@app/types/remembered-height';

const read = (key: string) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as SavedHeight | null;

    return saved?.width === window.innerWidth ? saved.height : null;
  } catch {
    return null;
  }
};

const save = (key: string, height: number) => {
  try {
    localStorage.setItem(key, JSON.stringify({ width: window.innerWidth, height }));

    return true;
  } catch {
    return false;
  }
};

@Directive({
  selector: '[appRememberedHeight]',
  host: { '[style.--remembered-height]': 'height()' },
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

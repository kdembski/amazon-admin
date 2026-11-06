import { TestBed } from '@angular/core/testing';
import { SummarySkeleton } from '@app/shared/summary/summary-skeleton';

describe('SummarySkeleton', () => {
  it('announces loading and draws two hidden panels of placeholder tiles', async () => {
    const fixture = TestBed.createComponent(SummarySkeleton);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const panels = [...element.querySelectorAll('.panel')];
    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-label')).toBe('Loading');
    expect(panels).toHaveLength(2);
    expect(panels.every((panel) => panel.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(panels[0].querySelectorAll('.tile')).toHaveLength(4);
  });
});

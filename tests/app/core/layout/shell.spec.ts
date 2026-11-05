import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Shell } from '@app/core/layout/shell';

@Component({ template: '' })
class Blank {}

const render = async (url: string) => {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '**', component: Blank }])],
  });
  await TestBed.inject(Router).navigateByUrl(url);
  const fixture = TestBed.createComponent(Shell);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

const links = (element: HTMLElement) => {
  return [...element.querySelectorAll('nav a')].map((a) => [
    a.textContent?.trim(),
    a.getAttribute('href'),
  ]);
};

describe('Shell', () => {
  it('renders the navigation links and the router outlet', async () => {
    const element = await render('/');

    expect(links(element)).toEqual([
      ['Overview', '/'],
      ['Scrapers', '/scrapers'],
    ]);
    expect(element.querySelector('router-outlet')).not.toBeNull();
  });
});

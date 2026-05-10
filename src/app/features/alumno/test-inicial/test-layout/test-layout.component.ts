

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-test-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="flex min-h-[100dvh] flex-col bg-slate-50/80">
      <app-header class="flex-none"></app-header>
      <main
        class="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 md:px-10 md:py-10"
      >
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class TestLayoutComponent {}
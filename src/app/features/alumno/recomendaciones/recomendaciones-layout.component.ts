import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-recomendaciones-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="animate-in fade-in duration-700">
      <router-outlet></router-outlet>
    </div>
  `
})
export class RecomendacionesLayoutComponent {}
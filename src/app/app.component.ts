import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestVerificationComponent } from './features/test-verification.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { AppStore } from './state/app.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`, // Solo el outlet
})
export class AppComponent implements OnInit{
  readonly store = inject(AppStore);

  ngOnInit() {
    this.store.initializeAuth(); // Sincroniza el estado al arrancar
  }
}

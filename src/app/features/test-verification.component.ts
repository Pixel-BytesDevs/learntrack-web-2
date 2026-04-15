import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AppStore } from '../state/app.store';

@Component({
  selector: 'app-test-verification',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzCardModule, NzIconModule],
  template: `
   
  `
})
export class TestVerificationComponent {
  readonly store = inject(AppStore);
}
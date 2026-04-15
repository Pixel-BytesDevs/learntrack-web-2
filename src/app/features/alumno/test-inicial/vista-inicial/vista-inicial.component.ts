import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-vista-inicial',
  standalone: true,
  imports: [RouterModule, NzButtonModule, NzIconModule, NzTypographyModule],
  templateUrl: './vista-inicial.component.html',
  styleUrl: './vista-inicial.component.scss'
})
export class VistaInicialComponent {
  private router = inject(Router);

  startDiagnostico(): void {
    // Navegamos al primer paso: el test VARK
    this.router.navigate(['/alumno/test-inicial/vark']);
  }
}
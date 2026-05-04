import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Ng-Zorro Imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { AppStore } from '../../../state/app.store';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCheckboxModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private store = inject(AppStore);

  loading = false;
  passwordVisible = false;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  get username() {
    return this.form.controls.username;
  }
  get password() {
    return this.form.controls.password;
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, password } = this.form.getRawValue();

    this.authService.login({ username: username.trim(), password }).subscribe({
      next: (res) => {
        this.tokenService.setTokens(res.access_token, res.refresh_token);
        this.store.setAuth(); // Actualiza el estado global
        this.message.success('Bienvenido de nuevo');
        this.redirectByRole();
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Usuario o contraseña incorrectos';
        this.message.error(errorMsg);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  private redirectByRole(): void {
  const roles = this.tokenService.getRoles();
  const firstLogin = this.tokenService.isFirstLogin();

  if (roles.includes('ROLE_ADMIN')) {
    this.router.navigate(['/admin/dashboard']);
  } else if (roles.includes('ROLE_PROFESOR')) {
    this.router.navigate(['/profesor/dashboard']);
  } else if (roles.includes('ROLE_USER')) {
    // CORRECCIÓN: Apuntar a la ruta hija específica
    if (firstLogin) {
      this.router.navigate(['/alumno/test-inicial']);
    } else {
      this.router.navigate(['/alumno/dashboard']);
    }
  } else {
    this.router.navigate(['/']);
  }
}
}
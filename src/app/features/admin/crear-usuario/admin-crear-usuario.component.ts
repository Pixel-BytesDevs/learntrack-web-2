import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { finalize, of, switchMap } from 'rxjs';
import { AlumnoDataRequest } from '../../../core/interfaces/request/alumno-data-request';
import { CreateAppUserDto } from '../../../core/models/auth.models';
import { AlumnoService } from '../../../core/services/alumno/alumno.service';
import { AuthService } from '../../../core/services/auth.service';

type RolCrear = 'ROLE_USER' | 'ROLE_PROFESOR';

@Component({
  selector: 'app-admin-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
  ],
  templateUrl: './admin-crear-usuario.component.html',
  styleUrl: './admin-crear-usuario.component.scss',
})
export class AdminCrearUsuarioComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly alumnoService = inject(AlumnoService);
  private readonly message = inject(NzMessageService);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  passwordVisible = false;

  readonly rolesOptions: { label: string; value: RolCrear }[] = [
    { label: 'Estudiante', value: 'ROLE_USER' },
    { label: 'Profesor', value: 'ROLE_PROFESOR' },
  ];

  readonly generoOptions = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' },
  ];

  readonly salonOptions = [
    { label: 'Salón A', value: 1 },
    { label: 'Salón H', value: 2 },
  ];

  form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['ROLE_USER' as RolCrear, [Validators.required]],
      primerNombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      edad: [null as number | null],
      genero: ['Masculino'],
      idSalon: [1],
    },
    { validators: this.passwordMatchValidator },
  );

  constructor() {
    this.syncAlumnoValidators(this.form.controls.role.getRawValue());
    this.form.controls.role.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => this.syncAlumnoValidators(role));
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto: CreateAppUserDto = {
      username: raw.username.trim(),
      password: raw.password,
      roles: [raw.role],
    };

    this.loading = true;
    this.authService
      .createAppUser(dto)
      .pipe(
        switchMap((created) => {
          if (raw.role !== 'ROLE_USER') {
            return of(null);
          }
          const alumno: AlumnoDataRequest = {
            usuarioId: created.id,
            primerNombre: raw.primerNombre.trim(),
            apellidoPaterno: raw.apellidoPaterno.trim(),
            apellidoMaterno: raw.apellidoMaterno.trim(),
            edad: Number(raw.edad),
            genero: raw.genero,
            idSalon: Number(raw.idSalon),
          };
          return this.alumnoService.createAlumno(alumno);
        }),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (alumnoMsg) => {
          if (raw.role === 'ROLE_USER') {
            this.message.success(
              alumnoMsg?.trim() || 'Usuario y alumno creados correctamente',
            );
          } else {
            this.message.success('Usuario creado correctamente');
          }
          this.resetForm();
        },
        error: (err) => {
          const errorMsg =
            err?.error?.message ??
            err?.message ??
            'No se pudo completar el registro. Inténtalo de nuevo.';
          this.message.error(
            typeof errorMsg === 'string' ? errorMsg : 'Error al crear el usuario',
          );
        },
      });
  }

  private resetForm(): void {
    this.form.reset({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'ROLE_USER',
      primerNombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      edad: null,
      genero: 'Masculino',
      idSalon: 1,
    });
    this.syncAlumnoValidators('ROLE_USER');
  }

  private syncAlumnoValidators(role: RolCrear): void {
    const textos = [
      this.form.controls.primerNombre,
      this.form.controls.apellidoPaterno,
      this.form.controls.apellidoMaterno,
    ];
    const edadCtrl = this.form.controls.edad;
    const generoCtrl = this.form.controls.genero;
    const salonCtrl = this.form.controls.idSalon;

    if (role === 'ROLE_USER') {
      for (const c of textos) {
        c.setValidators([Validators.required]);
      }
      edadCtrl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(120),
      ]);
      generoCtrl.setValidators([Validators.required]);
      salonCtrl.setValidators([Validators.required]);
    } else {
      for (const c of textos) {
        c.clearValidators();
      }
      edadCtrl.clearValidators();
      generoCtrl.clearValidators();
      salonCtrl.clearValidators();
    }

    for (const c of [...textos, edadCtrl, generoCtrl, salonCtrl]) {
      c.updateValueAndValidity({ emitEvent: false });
    }
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
}

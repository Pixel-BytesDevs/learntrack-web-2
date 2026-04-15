import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzBadgeModule,
  ],
  template: `
    <main class="bg-white overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div
          class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"
        ></div>
        <div
          class="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]"
        ></div>
      </div>

      <section class="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4">
        <div class="container mx-auto text-center max-w-5xl">
          <div
            class="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-8 animate-bounce-subtle"
          >
            <nz-badge nzStatus="processing" nzColor="#2563eb"></nz-badge>
            <span class="text-blue-700 text-sm font-semibold"
              >Nueva actualización: IA Predictiva v2.0</span
            >
          </div>

          <h1
            class="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight"
          >
            La educación se adapta a <br class="hidden md:block" />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
            >
              tu propia mente.
            </span>
          </h1>

          <p
            class="text-lg md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            LearnTrack no es solo un LMS. Es un ecosistema que evoluciona
            contigo, detectando si eres visual, auditivo o práctico para guiarte
            al éxito.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-5">
            <button
              nz-button
              nzType="primary"
              class="h-14 px-10 text-lg font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
              routerLink="/register"
            >
              Empezar como Estudiante
              <span nz-icon nzType="arrow-right" class="ml-2"></span>
            </button>
            <button
              nz-button
              nzType="default"
              class="h-14 px-10 text-lg font-bold rounded-xl border-2 hover:bg-slate-50 transition-all"
            >
              Soy Profesor
            </button>
          </div>

          <div class="mt-20 relative mx-auto max-w-4xl group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"
            ></div>
            <div
              class="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
            >
              <div class="flex flex-col items-center">
                <span
                  nz-icon
                  nzType="play-circle"
                  nzTheme="twotone"
                  [nzTwotoneColor]="'#2563eb'"
                  class="text-7xl opacity-80 cursor-pointer hover:scale-110 transition-transform"
                ></span>
                <p class="mt-4 text-slate-400 font-medium">
                  Ver cómo funciona LearnTrack
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 bg-slate-50/50 relative">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Por qué LearnTrack es diferente?
            </h2>
            <div class="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div
              class="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div
                class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors"
              >
                <span
                  nz-icon
                  nzType="rocket"
                  class="text-2xl text-blue-600 group-hover:text-white"
                ></span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">
                Progreso Dinámico
              </h3>
              <p class="text-slate-500 leading-relaxed">
                Olvídate de las clases lineales. Si dominas un concepto, la IA
                te reta con el siguiente nivel de inmediato.
              </p>
            </div>

            <div
              class="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div
                class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors"
              >
                <span
                  nz-icon
                  nzType="bulb"
                  class="text-2xl text-indigo-600 group-hover:text-white"
                ></span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">
                Multimodalidad VARK
              </h3>
              <p class="text-slate-500 leading-relaxed">
                ¿Prefieres videos o lecturas? El sistema aprende tu estilo y
                prioriza los recursos que mejor se te dan.
              </p>
            </div>

            <div
              class="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div
                class="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 transition-colors"
              >
                <span
                  nz-icon
                  nzType="line-chart"
                  class="text-2xl text-violet-600 group-hover:text-white"
                ></span>
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-3">
                Analítica Real
              </h3>
              <p class="text-slate-500 leading-relaxed">
                Dashboard detallado para profesores. Detecta qué alumnos
                necesitan refuerzo antes de que ellos lo sepan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 px-4">
        <div
          class="container mx-auto max-w-4xl bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-10 opacity-10">
            <span nz-icon nzType="block" class="text-[150px]"></span>
          </div>
          <h2 class="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para transformar <br />
            la enseñanza?
          </h2>
          <p class="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Únete a cientos de estudiantes que ya están desbloqueando su
            verdadero potencial.
          </p>
          <button
            nz-button
            nzType="default"
            nzSize="large"
            class="h-14 px-12 text-blue-800 font-bold rounded-xl bg-white border-none hover:bg-blue-50"
          >
            Crear mi cuenta gratuita
          </button>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      @keyframes bounce-subtle {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      .animate-bounce-subtle {
        animation: bounce-subtle 3s infinite ease-in-out;
      }
    `,
  ],
})
export class HomeComponent {}

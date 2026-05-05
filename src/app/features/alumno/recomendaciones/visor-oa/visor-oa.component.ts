import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Ng-Zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCardModule } from 'ng-zorro-antd/card';
import { RecomendationStateService } from '../../../../core/services/recomendation/recomendation-state.service';
import {
  OAData,
  Recommendation,
} from '../../../../core/models/recomendation.models';
import { TiposMaterial } from '../../../../core/enums/tipos-material.enum';
import { DomSanitizer } from '@angular/platform-browser';

// Core

@Component({
  selector: 'app-visor-oa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzToolTipModule,
    NzProgressModule,
    NzCardModule,
  ],
  templateUrl: './visor-oa.component.html',
  styleUrl: './visor-oa.component.scss',
})
export class VisorOaComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  private stateService = inject(RecomendationStateService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer); // CRÍTICO para PDFs y Media
  private destroy$ = new Subject<void>();

  // Signals
  loading = signal(true);
  isPlaying = signal(false);
  progress = signal(0);
  currentTime = signal(0);
  duration = signal(0);

  recommendation = signal<Recommendation | null>(null);
  selectedResource = signal<OAData | null>(null);

  // URL Sanitizada para iframe/video/audio
  safeUrl = computed(() => {
    const url = this.selectedResource()?.s3Url;
    if (!url) return null;

    const cleanUrl = url.split('?')[0].toLowerCase();

    if (cleanUrl.endsWith('.pdf')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    if (cleanUrl.endsWith('.ppt') || cleanUrl.endsWith('.pptx')) {
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(officeViewer);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  resourceType = computed(() => {
    return this.getResourceType(this.selectedResource()?.s3Url);
  });

  complementaryResources = computed(() => {
    const rec = this.recommendation();
    const current = this.selectedResource();
    if (!rec) return [];
    return rec.learningObjects
      .filter((oa) => oa.idObject !== current?.idObject)
      .sort((a, b) => (b.stylePercentage ?? 0) - (a.stylePercentage ?? 0))
      .slice(0, 3);
  });

  protected readonly TiposMaterial = TiposMaterial;

  ngOnInit(): void {
    this.stateService.recommendation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.recommendation.set(res);
          this.loading.set(false);
        }
      });

    this.stateService.oaPrincipal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((oa) => {
        if (oa) this.selectedResource.set(oa);
      });
  }

  // --- Controles de Media (Video y Audio compartido) ---
  togglePlay(): void {
    const player =
      this.videoPlayer?.nativeElement || this.audioPlayer?.nativeElement;
    if (!player) return;

    if (this.isPlaying()) player.pause();
    else player.play();

    this.isPlaying.set(!this.isPlaying());
  }

  onTimeUpdate(event: any): void {
    const player = event.target as HTMLMediaElement;
    this.currentTime.set(player.currentTime);
    this.duration.set(player.duration);
    this.progress.set((player.currentTime / player.duration) * 100);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  selectResource(resource: OAData): void {
    this.selectedResource.set(resource);
    this.isPlaying.set(false);
    this.progress.set(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  initEvaluation(): void {
    const rec = this.recommendation();
    if (rec)
      this.router.navigate(['/alumno/recomendaciones/evaluacion'], {
        queryParams: { topicId: rec.topicId },
      });
  }

  goBack(): void {
    this.router.navigate(['/alumno/recomendaciones']);
  }

  getResourceType(url?: string | null): TiposMaterial | null {
    if (!url) return null;

    const cleanUrl = url.split('?')[0].toLowerCase();

    if (cleanUrl.endsWith('.mp4')) return TiposMaterial.VIDEO;
    if (
      cleanUrl.endsWith('.m4a') ||
      cleanUrl.endsWith('.mp3') ||
      cleanUrl.endsWith('.wav')
    )
      return TiposMaterial.AUDIO;
    if (
      cleanUrl.endsWith('.pdf') ||
      cleanUrl.endsWith('.ppt') ||
      cleanUrl.endsWith('.pptx')
    )
      return TiposMaterial.DOCUMENTO;

    return null;
  }

  openFullscreen(): void {
    const iframe = document.querySelector('iframe');
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  }

  seek(seconds: number): void {
    const player =
      this.videoPlayer?.nativeElement || this.audioPlayer?.nativeElement;
    if (!player) return;

    player.currentTime += seconds;
  }

  enterFullscreen(): void {
  const video = this.videoPlayer?.nativeElement;
  if (!video) return;

  if (video.requestFullscreen) {
    video.requestFullscreen();
  }
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

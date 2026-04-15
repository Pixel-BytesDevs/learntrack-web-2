import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import katex from 'katex';

@Directive({
  selector: '[katex]',
  standalone: true,
})
export class KatexDirective implements OnChanges {
  @Input('katex') expr: string | null = null;
  @Input() displayMode = true;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    const el = this.host.nativeElement;
    if (!this.expr) {
      el.innerHTML = '';
      return;
    }

    try {
      katex.render(this.expr, el, {
        displayMode: this.displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
      });
    } catch (e) {
      el.textContent = this.expr;
    }
  }
}

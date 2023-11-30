// directiva2.directive.ts
import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDirectiva2]'
})
export class Directiva2Directive {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.setFontSize('larger');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.setFontSize('initial'); // Restablece el tamaño al valor predeterminado
  }

  private setFontSize(size: string) {
    this.renderer.setStyle(this.el.nativeElement, 'font-size', size);
  }
}

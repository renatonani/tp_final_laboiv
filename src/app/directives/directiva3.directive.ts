// directiva3.directive.ts
import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDirectiva3]'
})
export class Directiva3Directive {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    this.setBorderColor('black'); // Cambia el color del borde al hacer clic
  }

  private setBorderColor(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'border', `3px solid ${color}`);
  }
}

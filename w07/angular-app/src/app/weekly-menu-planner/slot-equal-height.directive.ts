import { Directive, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSlotEqualHeight]'
})
export class SlotEqualHeightDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Keresd meg az összes meal-slot elemet a naptár gridben
    const slots: HTMLElement[] = Array.from(this.el.nativeElement.querySelectorAll('.meal-slot'));
    let maxHeight = 0;
    slots.forEach(slot => {
      slot.style.height = 'auto'; // reset
      const h = slot.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });
    slots.forEach(slot => {
      this.renderer.setStyle(slot, 'height', maxHeight + 'px');
    });
  }
}

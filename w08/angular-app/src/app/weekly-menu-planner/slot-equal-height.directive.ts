import { Directive, AfterViewInit, ElementRef, Renderer2, OnDestroy, NgZone } from '@angular/core';

@Directive({
  selector: '[appSlotEqualHeight]'
})
export class SlotEqualHeightDirective implements AfterViewInit, OnDestroy {
  private mo?: MutationObserver;
  private rafId: any = null;
  private resizeHandler = () => this.queueMeasure();

  constructor(private el: ElementRef, private renderer: Renderer2, private ngZone: NgZone) {}

  ngAfterViewInit() {
    // initial measure
    this.ngZone.runOutsideAngular(() => this.measureAndApply());

    // Observe DOM changes that affect slots (add/remove or content changes)
    this.mo = new MutationObserver(() => this.queueMeasure());
    this.mo.observe(this.el.nativeElement, { childList: true, subtree: true, characterData: true });

    // Recompute on window resize
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    if (this.mo) this.mo.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private queueMeasure() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.ngZone.runOutsideAngular(() => this.measureAndApply());
    });
  }

  private measureAndApply() {
    const slots: HTMLElement[] = Array.from(this.el.nativeElement.querySelectorAll('.meal-slot'));
    let maxHeight = 0;
    // reset heights first so natural heights are measured
    slots.forEach(slot => {
      this.renderer.setStyle(slot, 'height', 'auto');
      const h = slot.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });
    // apply uniform height only if we have at least one
    if (maxHeight > 0) {
      slots.forEach(slot => {
        this.renderer.setStyle(slot, 'height', maxHeight + 'px');
      });
    }
  }
}

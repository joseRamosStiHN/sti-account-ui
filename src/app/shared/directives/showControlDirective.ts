import { Directive, Input, ElementRef, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[showControl]',
})
export class showControlDirective {
  @Input() hasPermission: number = 0;
  @Input() roles: string[] = [];
  t: any[] = [];
  private element: ElementRef<HTMLInputElement> = inject(ElementRef);
  // observable
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    //console.log(this.element);
    /* console.log(this.roles);
    this.t.find(x=> this.roles.includes(x))
    console.log('permiso', this.hasPermission);
    */
    if (this.hasPermission !== 1) {
      this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
    } else {
      this.renderer.setStyle(this.element.nativeElement, 'display', 'block');
    }
  }
}

import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { NavStiLink } from '../../navigation.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) children!: NavStiLink[];

  show: boolean = false;

  constructor(private elementRef: ElementRef) {}

  onClick() {
    this.show = !this.show;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (
      targetElement &&
      !this.elementRef.nativeElement.contains(targetElement)
    ) {
      this.show = false;
    }
  }

  @HostListener('document:onMouseLeve', ['$event'])
  onMouseLeve(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    console.log(this.elementRef.nativeElement.contains(targetElement));
    //this.show = false;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dpdpa-side-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="drawer-overlay" [class.open]="isOpen" (click)="close.emit()"></div>
    <div class="drawer" [class.open]="isOpen" [style.width.px]="width">
      <div class="drawer-header">
        <h3>{{ title }}</h3>
        <button class="drawer-close" (click)="close.emit()">&times;</button>
      </div>
      <div class="drawer-body">
        <ng-content select="[body]"></ng-content>
      </div>
      <div class="drawer-footer">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class SideDrawerComponent {
  @Input() isOpen = false;
  @Input() title = 'Configuration';
  @Input() width = 460;
  @Output() close = new EventEmitter<void>();
}

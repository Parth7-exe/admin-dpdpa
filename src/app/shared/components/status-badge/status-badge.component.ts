import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dpdpa-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() value: any;

  get label(): string {
    if (this.value === true || this.value === 'true' || this.value === 1 || this.value === 'Active') {
      return 'Active';
    }
    if (this.value === false || this.value === 'false' || this.value === 0 || this.value === 'Inactive') {
      return 'Inactive';
    }
    return String(this.value ?? '—');
  }

  get badgeClass(): string {
    const lbl = this.label.toLowerCase();
    if (lbl === 'active' || lbl === 'approved' || lbl === 'completed' || lbl === 'yes') {
      return 'badge-green';
    }
    if (lbl === 'inactive' || lbl === 'rejected' || lbl === 'failed' || lbl === 'no' || lbl === 'high') {
      return 'badge-red';
    }
    if (lbl === 'pending' || lbl === 'investigating' || lbl === 'medium') {
      return 'badge-amber';
    }
    if (lbl === 'low' || lbl === 'info' || lbl === 'processed') {
      return 'badge-blue';
    }
    return 'badge-gray';
  }
}

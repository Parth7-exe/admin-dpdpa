import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { ToastService } from '../../../core/toast.service';
import { CategoryService, CategoryDetail } from '../../../core/category.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { SideDrawerComponent } from '../side-drawer/side-drawer.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  required?: boolean;
  optionsFromCategory?: string; // Preload option matches from category_dtl
}

@Component({
  selector: 'dpdpa-generic-module',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    SideDrawerComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="page-header">
      <h2 class="page-title">{{ title }}</h2>
      <p class="page-sub">{{ subtitle }}</p>
    </div>

    <!-- ── KPI Indicators (Dynamic) ── -->
    <div *ngIf="kpiConfigs && kpiConfigs.length > 0" class="kpi-grid">
      <div *ngFor="let kpi of kpiConfigs" class="kpi-card">
        <div>
          <div class="kpi-value" [style.color]="kpi.color">{{ computeKpiValue(kpi) }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
        <div class="kpi-icon" [style.background-color]="kpi.bgColor" [style.color]="kpi.color">
          {{ kpi.icon }}
        </div>
      </div>
    </div>

    <dpdpa-data-table
      [spName]="sp.fn"
      [columns]="tableColumns"
      [addLabel]="'Add ' + singleName"
      [rowClickable]="rowClickable"
      (rowClick)="onRowClick($event)"
      (addClick)="openCreate()"
      (editClick)="openEdit($event)"
      (deleteClick)="confirmDelete($event)"
      (recordsLoaded)="onRecordsLoaded($event)"
    />

    <!-- ── Edit / Create Side Drawer ── -->
    <dpdpa-side-drawer
      [isOpen]="drawerOpen"
      [title]="(editingRecord ? 'Edit ' : 'New ') + singleName"
      (close)="drawerOpen = false"
    >
      <form [formGroup]="form" (ngSubmit)="save()" body>
        <ng-container *ngFor="let field of fields">
          <div *ngIf="field.key !== 'isActive'" class="form-group">
            <label [class.required]="field.required">{{ field.label }}</label>

            <!-- Text Field -->
            <input 
              *ngIf="field.type === 'text'"
              type="text"
              [formControlName]="field.key"
              [placeholder]="'Enter ' + field.label.toLowerCase()"
            />

            <!-- Number Field -->
            <input 
              *ngIf="field.type === 'number'"
              type="number"
              [formControlName]="field.key"
              [placeholder]="'Enter ' + field.label.toLowerCase()"
            />

            <!-- Textarea Field -->
            <textarea 
              *ngIf="field.type === 'textarea'"
              [formControlName]="field.key"
              [placeholder]="'Enter ' + field.label.toLowerCase()"
            ></textarea>

            <!-- Date Field -->
            <input 
              *ngIf="field.type === 'date'"
              type="date"
              [formControlName]="field.key"
            />

            <!-- Checkbox / Toggle -->
            <label *ngIf="field.type === 'checkbox'" class="toggle-switch">
              <input type="checkbox" [formControlName]="field.key" />
              <span class="toggle-track"></span>
            </label>

            <!-- Select List preloaded from Category Details -->
            <select *ngIf="field.type === 'select'" [formControlName]="field.key">
              <option [value]="null">-- Select {{ field.label }} --</option>
              <option *ngFor="let opt of getSelectOptions(field)" [value]="opt.id">
                {{ opt.title }}
              </option>
            </select>

            <!-- Error Feedback -->
            <div 
              class="form-error" 
              *ngIf="form.get(field.key)?.touched && form.get(field.key)?.invalid"
            >
              {{ field.label }} is required.
            </div>
          </div>
        </ng-container>
      </form>

      <div footer>
        <button class="btn btn-secondary" (click)="drawerOpen = false">Cancel</button>
        <button 
          class="btn btn-primary" 
          [disabled]="form.invalid || saving" 
          (click)="save()"
        >
          {{ saving ? 'Saving...' : 'Save Configuration' }}
        </button>
      </div>
    </dpdpa-side-drawer>

    <!-- ── Confirmation Modal ── -->
    <dpdpa-confirm-modal
      [show]="confirmModalOpen"
      [title]="'Remove ' + singleName"
      [message]="'Are you sure you want to permanently remove this ' + singleName.toLowerCase() + ' record?'"
      (confirm)="delete()"
      (cancel)="confirmModalOpen = false"
    />
  `
})
export class GenericModuleComponent implements OnInit {
  title = '';
  subtitle = '';
  singleName = '';
  sp!: { fn: string; pa: string };
  fields: FormField[] = [];
  primaryKey = 'id';
  tableColumns: { label: string; key: string }[] = [];
  records: any[] = [];
  kpiConfigs: any[] = [];

  form!: FormGroup;
  drawerOpen = false;
  editingRecord: any = null;
  saving = false;
  rowClickable = false;

  confirmModalOpen = false;
  deletingRecord: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      this.title = data.title || 'Configuration';
      this.subtitle = data.subtitle || '';
      this.singleName = data.singleName || 'Item';
      this.sp = data.sp;
      this.fields = data.fields || [];
      this.primaryKey = data.primaryKey || 'id';
      this.kpiConfigs = data.kpis || [];

      this.rowClickable = (this.primaryKey === 'applicationId');

      // Map fields to table columns for display
      this.tableColumns = this.fields.map(f => ({
        label: f.label,
        key: f.key
      }));

      this.buildForm();
    });
  }

  onRecordsLoaded(records: any[]) {
    this.records = records;
  }

  onRowClick(row: any) {
    if (this.rowClickable) {
      this.router.navigate(['/applications', row[this.primaryKey]]);
    }
  }

  computeKpiValue(kpi: any): string | number {
    if (!this.records || this.records.length === 0) {
      return kpi.fallbackVal !== undefined ? kpi.fallbackVal : 0;
    }

    const rule = kpi.compute;
    if (!rule) return 0;

    switch (rule.type) {
      case 'total':
        return this.records.length;

      case 'filter': {
        const field = rule.field;
        const val = rule.value;
        const count = this.records.filter(r => {
          const actual = r[field];
          if (typeof val === 'boolean') {
            return String(actual).toLowerCase() === String(val).toLowerCase();
          }
          return actual === val;
        }).length;
        return count;
      }

      case 'sum': {
        const field = rule.field;
        const sum = this.records.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);
        return sum;
      }

      case 'avg': {
        const field = rule.field;
        const sum = this.records.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);
        return Math.round(sum / this.records.length);
      }

      default:
        return 0;
    }
  }

  buildForm() {
    const group: Record<string, any> = {};
    this.fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      const defaultValue = field.type === 'checkbox' ? true : null;
      group[field.key] = [defaultValue, validators];
    });
    this.form = this.fb.group(group);
  }

  getSelectOptions(field: FormField): CategoryDetail[] {
    if (!field.optionsFromCategory) return [];
    return this.categoryService.getOptions(field.optionsFromCategory);
  }

  openCreate() {
    this.editingRecord = null;
    this.form.reset();
    
    // Set checkbox defaults
    this.fields.forEach(f => {
      if (f.type === 'checkbox') {
        this.form.get(f.key)?.setValue(true);
      }
    });

    this.drawerOpen = true;
  }

  openEdit(row: any) {
    this.editingRecord = row;
    this.form.reset();

    // Map record values to form controls
    const values: Record<string, any> = {};
    this.fields.forEach((field) => {
      let val = row[field.key];
      if (field.type === 'date' && val) {
        val = new Date(val).toISOString().split('T')[0];
      }
      values[field.key] = val;
    });

    this.form.patchValue(values);
    this.drawerOpen = true;
  }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const body = { ...this.form.value };

    if (this.editingRecord) {
      body[this.primaryKey] = this.editingRecord[this.primaryKey];
      // Backend expects 'id' parameter for primary keys in stored procedure UPDATE
      body.id = this.editingRecord[this.primaryKey];

      this.apiService.update(this.sp.pa, body).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.responseCode === '0' || res.responseCode === '00') {
            this.toastService.success('Update Successful', `${this.singleName} configuration has been saved.`);
            this.drawerOpen = false;
            // Reload page layout by forcing navigation re-run or datatable refresh
            window.location.reload();
          } else {
            this.toastService.error('Update Failed', res.description || 'Verification constraint failed.');
          }
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Communication Error', 'Failed to connect to the backend server.');
        }
      });
    } else {
      this.apiService.create(this.sp.pa, body).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.responseCode === '0' || res.responseCode === '00') {
            this.toastService.success('Record Created', `New ${this.singleName.toLowerCase()} registered.`);
            this.drawerOpen = false;
            window.location.reload();
          } else {
            this.toastService.error('Creation Failed', res.description || 'Database duplicate or parameter issue.');
          }
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Communication Error', 'Failed to connect to the server.');
        }
      });
    }
  }

  confirmDelete(row: any) {
    this.deletingRecord = row;
    this.confirmModalOpen = true;
  }

  delete() {
    if (!this.deletingRecord) return;
    const targetId = this.deletingRecord[this.primaryKey];

    this.apiService.delete(this.sp.pa, targetId).subscribe({
      next: (res) => {
        this.confirmModalOpen = false;
        if (res.responseCode === '0' || res.responseCode === '00') {
          this.toastService.success('Record Removed', 'The configuration has been deleted successfully.');
          window.location.reload();
        } else {
          this.toastService.error('Deletion Failed', res.description || 'Action denied by security constraints.');
        }
      },
      error: () => {
        this.confirmModalOpen = false;
        this.toastService.error('Communication Error', 'Failed to complete transaction.');
      }
    });
  }
}

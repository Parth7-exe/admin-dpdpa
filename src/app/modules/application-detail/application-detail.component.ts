import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { CategoryService, CategoryDetail } from '../../core/category.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SideDrawerComponent } from '../../shared/components/side-drawer/side-drawer.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SP } from '../../core/config';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  required?: boolean;
  optionsFromCategory?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  sp: { fn: string; pa: string };
  primaryKey: string;
  singleName: string;
  fields: FormField[];
}

@Component({
  selector: 'dpdpa-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DataTableComponent,
    SideDrawerComponent,
    ConfirmModalComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-header" style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
      <div>
        <a routerLink="/applications" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 13px; text-decoration: none; border-radius: var(--radius-sm); border: 1px solid var(--line); color: var(--ink-2); background: #fff; cursor: pointer; transition: background var(--transition);">
          ← Back to Applications
        </a>
      </div>
      
      <!-- ── Application Overview Header Card ── -->
      <div *ngIf="application" class="app-detail-card" style="background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <h1 style="margin: 0; font-size: 22px; color: var(--navy);">{{ application.applicationName }}</h1>
              <span style="background: var(--blue-light); color: var(--blue); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                {{ application.applicationCode }}
              </span>
            </div>
            <p style="margin: 0; color: var(--ink-2); font-size: 13.5px;">{{ application.applicationDescription || 'No description provided.' }}</p>
          </div>
          <div>
            <dpdpa-status-badge [value]="application.applicationStatus || application.isActive"></dpdpa-status-badge>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; padding-top: 16px; border-top: 1px solid var(--line-2);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--ink-3); font-weight: 600;">Short Name</div>
            <div style="font-size: 13px; color: var(--ink); font-weight: 500; margin-top: 2px;">{{ application.applicationShortName || '—' }}</div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--ink-3); font-weight: 600;">Business Function</div>
            <div style="font-size: 13px; color: var(--ink); font-weight: 500; margin-top: 2px;">{{ application.businessFunction || '—' }}</div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--ink-3); font-weight: 600;">Department</div>
            <div style="font-size: 13px; color: var(--ink); font-weight: 500; margin-top: 2px;">{{ application.department || '—' }}</div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--ink-3); font-weight: 600;">Go-Live Date</div>
            <div style="font-size: 13px; color: var(--ink); font-weight: 500; margin-top: 2px;">
              {{ application.goLiveDate ? (application.goLiveDate | date:'mediumDate') : '—' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tabs Navigation ── -->
    <div class="tabs">
      <button 
        *ngFor="let tab of tabs" 
        class="tab-btn" 
        [class.active]="activeTab.id === tab.id"
        (click)="selectTab(tab)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Tab Grid Content ── -->
    <div *ngIf="activeTab" style="background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow);">
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; margin: 0; color: var(--navy);">{{ activeTab.label }} Mappings</h3>
        <p style="font-size: 12.5px; color: var(--ink-2); margin-top: 2px;">Manage lists, items, and compliance configurations mapped specifically to this application.</p>
      </div>

      <dpdpa-data-table
        #dataTable
        [spName]="activeTab.sp.fn"
        [columns]="tableColumns"
        [filters]="tableFilters"
        [addLabel]="'Add ' + activeTab.singleName"
        (addClick)="openCreate()"
        (editClick)="openEdit($event)"
        (deleteClick)="confirmDelete($event)"
        (recordsLoaded)="onRecordsLoaded($event)"
      />
    </div>

    <!-- ── Edit / Create Side Drawer ── -->
    <dpdpa-side-drawer
      [isOpen]="drawerOpen"
      [title]="(editingRecord ? 'Edit ' : 'New ') + activeTab.singleName"
      (close)="drawerOpen = false"
    >
      <form [formGroup]="form" (ngSubmit)="save()" body>
        <ng-container *ngFor="let field of activeTab.fields">
          <!-- Hide applicationId because we set it automatically behind the scenes -->
          <div *ngIf="field.key !== 'applicationId'" class="form-group">
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
          {{ saving ? 'Saving...' : 'Save ' + activeTab.singleName }}
        </button>
      </div>
    </dpdpa-side-drawer>

    <!-- ── Confirmation Modal ── -->
    <dpdpa-confirm-modal
      [show]="confirmModalOpen"
      [title]="'Remove ' + activeTab.singleName"
      [message]="'Are you sure you want to permanently remove this ' + activeTab.singleName.toLowerCase() + ' record?'"
      (confirm)="delete()"
      (cancel)="confirmModalOpen = false"
    />
  `,
  styles: []
})
export class ApplicationDetailComponent implements OnInit {
  @ViewChild('dataTable') dataTable?: DataTableComponent;

  appId!: number;
  application: any = null;
  activeTab!: TabConfig;
  tableColumns: { label: string; key: string }[] = [];
  tableFilters: Record<string, any> = {};
  records: any[] = [];

  form!: FormGroup;
  drawerOpen = false;
  editingRecord: any = null;
  saving = false;

  confirmModalOpen = false;
  deletingRecord: any = null;

  tabs: TabConfig[] = [
    {
      id: 'environments',
      label: 'Environments',
      sp: SP.APPLICATION_ENVIRONMENT,
      primaryKey: 'environmentId',
      singleName: 'Environment',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'environmentName', label: 'Environment Name', type: 'text', required: true },
        { key: 'url', label: 'Access URL', type: 'text' },
        { key: 'environmentStatus', label: 'Status', type: 'select', optionsFromCategory: 'Environment Type' },
        { key: 'hostingLocation', label: 'Hosting Location / Region', type: 'text' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      sp: SP.APPLICATION_INFRASTRUCTURE,
      primaryKey: 'infraId',
      singleName: 'Infrastructure',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'hostingType', label: 'Hosting Type', type: 'select', optionsFromCategory: 'Hosting Type' },
        { key: 'cloudProvider', label: 'Cloud Provider', type: 'select', optionsFromCategory: 'Cloud Provider' },
        { key: 'serverCount', label: 'Server Count', type: 'number' },
        { key: 'loadBalancerCount', label: 'Load Balancer Count', type: 'number' },
        { key: 'containerPlatform', label: 'Container Platform', type: 'select', optionsFromCategory: 'Container Platform' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'owners',
      label: 'Owners',
      sp: SP.APPLICATION_OWNER,
      primaryKey: 'ownerId',
      singleName: 'Owner Link',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'ownerType', label: 'Owner Type / Department', type: 'text' },
        { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
        { key: 'emailId', label: 'Email Address', type: 'text', required: true },
        { key: 'mobileNo', label: 'Mobile Number', type: 'text' },
        { key: 'designation', label: 'Designation', type: 'select', optionsFromCategory: 'Designation' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendors',
      sp: SP.APPLICATION_VENDOR,
      primaryKey: 'vendorId',
      singleName: 'Vendor Contract',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
        { key: 'supportEmail', label: 'Support Email', type: 'text' },
        { key: 'supportContact', label: 'Support Contact Phone', type: 'text' },
        { key: 'contractExpiryDate', label: 'Contract Expiration Date', type: 'date' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'apis',
      label: 'API Inventory',
      sp: SP.APPLICATION_API_INVENTORY,
      primaryKey: 'apiId',
      singleName: 'API Endpoint',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'apiName', label: 'API Name / Action', type: 'text', required: true },
        { key: 'apiUrl', label: 'Endpoint Path', type: 'text' },
        { key: 'apiMethod', label: 'HTTP Method (GET, POST etc)', type: 'text' },
        { key: 'authenticationType', label: 'Auth Scheme', type: 'select', optionsFromCategory: 'Authentication Type' },
        { key: 'apiStatus', label: 'API Health Status', type: 'select', optionsFromCategory: 'API Status' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'interfaces',
      label: 'Interface Inventory',
      sp: SP.APPLICATION_INTERFACE_INV,
      primaryKey: 'interfaceId',
      singleName: 'System Interface',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'sourceSystem', label: 'Source System Name', type: 'text' },
        { key: 'targetSystem', label: 'Target System Name', type: 'text' },
        { key: 'interfaceType', label: 'Interface Architecture', type: 'select', optionsFromCategory: 'Interface Type' },
        { key: 'protocol', label: 'Data Protocol', type: 'select', optionsFromCategory: 'Protocol' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'risks',
      label: 'Risk Profiles',
      sp: SP.APPLICATION_RISK_PROFILE,
      primaryKey: 'riskProfileId',
      singleName: 'Risk Profile',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'overallRiskLevel', label: 'Overall Risk Level', type: 'select', optionsFromCategory: 'Risk Level' },
        { key: 'riskScore', label: 'Risk Score (0 - 100)', type: 'number' },
        { key: 'assessmentDate', label: 'Assessment Conducted On', type: 'date' },
        { key: 'assessedBy', label: 'Assessor Name', type: 'text' },
        { key: 'nextReviewDate', label: 'Next Review Date', type: 'date' },
        { key: 'remarks', label: 'Remarks / Mitigation Actions', type: 'textarea' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance Scope',
      sp: SP.APPLICATION_COMPLIANCE_SCOPE,
      primaryKey: 'scopeId',
      singleName: 'Scope Mapping',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'frameworkName', label: 'Compliance Standard', type: 'select', optionsFromCategory: 'Compliance Framework' },
        { key: 'applicableFlag', label: 'Is Applicable', type: 'checkbox' },
        { key: 'remarks', label: 'Scope Remarks', type: 'textarea' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idVal = params.get('id');
      if (idVal) {
        this.appId = Number(idVal);
        this.loadApplication();
        this.selectTab(this.tabs[0]);
      }
    });
  }

  loadApplication() {
    this.apiService.getById<any>(SP.APPLICATION_MASTER.fn, this.appId).subscribe({
      next: (res) => {
        this.application = res;
      },
      error: (err) => {
        this.toastService.error('Error', 'Failed to load application details');
      }
    });
  }

  selectTab(tab: TabConfig) {
    this.activeTab = tab;
    
    // Filter out applicationId from the table columns display
    this.tableColumns = tab.fields
      .filter(f => f.key !== 'applicationId')
      .map(f => ({
        label: f.label,
        key: f.key
      }));

    this.tableFilters = { applicationId: this.appId };
    this.buildForm();
  }

  onRecordsLoaded(records: any[]) {
    this.records = records;
  }

  buildForm() {
    const group: Record<string, any> = {};
    this.activeTab.fields.forEach((field) => {
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

    // Set defaults
    this.activeTab.fields.forEach(f => {
      if (f.type === 'checkbox') {
        this.form.get(f.key)?.setValue(true);
      }
    });

    // Auto-set the applicationId behind the scenes
    this.form.get('applicationId')?.setValue(this.appId);
    this.drawerOpen = true;
  }

  openEdit(row: any) {
    this.editingRecord = row;
    this.form.reset();

    const values: Record<string, any> = {};
    this.activeTab.fields.forEach((field) => {
      let val = row[field.key];
      if (field.type === 'date' && val) {
        val = new Date(val).toISOString().split('T')[0];
      }
      values[field.key] = val;
    });

    this.form.patchValue(values);
    // Ensure the applicationId is set
    this.form.get('applicationId')?.setValue(this.appId);
    this.drawerOpen = true;
  }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const body = { ...this.form.value };
    // Ensure the current applicationId is forced
    body.applicationId = this.appId;

    if (this.editingRecord) {
      body[this.activeTab.primaryKey] = this.editingRecord[this.activeTab.primaryKey];
      body.id = this.editingRecord[this.activeTab.primaryKey];

      this.apiService.update(this.activeTab.sp.pa, body).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.responseCode === '0' || res.responseCode === '00') {
            this.toastService.success('Record Saved', `${this.activeTab.singleName} updated successfully.`);
            this.drawerOpen = false;
            this.dataTable?.loadData();
          } else {
            this.toastService.error('Update Failed', res.description || 'Database duplicate or parameter issue.');
          }
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Communication Error', 'Failed to connect to the server.');
        }
      });
    } else {
      this.apiService.create(this.activeTab.sp.pa, body).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.responseCode === '0' || res.responseCode === '00') {
            this.toastService.success('Record Created', `New ${this.activeTab.singleName.toLowerCase()} registered.`);
            this.drawerOpen = false;
            this.dataTable?.loadData();
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
    const targetId = this.deletingRecord[this.activeTab.primaryKey];

    this.apiService.delete(this.activeTab.sp.pa, targetId).subscribe({
      next: (res) => {
        this.confirmModalOpen = false;
        if (res.responseCode === '0' || res.responseCode === '00') {
          this.toastService.success('Record Removed', 'The item has been deleted successfully.');
          this.dataTable?.loadData();
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

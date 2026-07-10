import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PageResult } from '../../../core/api.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { CategoryLabelPipe } from '../../pipes/category-label.pipe';

@Component({
  selector: 'dpdpa-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, CategoryLabelPipe],
  template: `
    <div class="toolbar">
      <div class="search-box" *ngIf="searchable">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search by keyword..."
        />
      </div>

      <div class="toolbar-spacer"></div>

      <button *ngIf="addLabel" class="btn btn-primary" (click)="addClick.emit()">
        ➕ {{ addLabel }}
      </button>
    </div>

    <div class="table-wrapper">
      <table *ngIf="!loading && records.length > 0">
        <thead>
          <tr>
            <th *ngFor="let col of displayColumns">{{ col.label }}</th>
            <th style="width: 100px; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of records" [style.cursor]="rowClickable ? 'pointer' : 'default'" (click)="onRowClick(row, $event)">
            <td *ngFor="let col of displayColumns">
              <!-- Render Status Badges -->
              <ng-container *ngIf="col.key === 'isActive' || col.key === 'status' || col.key === 'applicationStatus' || col.key === 'environmentStatus'">
                <dpdpa-status-badge [value]="row[col.key]"></dpdpa-status-badge>
              </ng-container>

              <!-- Render category dropdown lookups (if key ends with 'Type' or matches specific lookup keys) -->
              <ng-container *ngIf="col.key !== 'isActive' && col.key !== 'status' && col.key !== 'applicationStatus' && col.key !== 'environmentStatus'">
                <ng-container *ngIf="isLookupKey(col.key); else rawVal">
                  {{ row[col.key] | categoryLabel }}
                </ng-container>
                <ng-template #rawVal>
                  <span [class.clickable-link-text]="isClickableColumn(col.key)">
                    {{ formatValue(row[col.key]) }}
                  </span>
                </ng-template>
              </ng-container>
            </td>
            <td style="text-align: right;">
              <div class="actions-cell" style="justify-content: flex-end;">
                <button class="btn-icon" title="Edit" (click)="editClick.emit(row)">✏️</button>
                <button class="btn-icon" style="color: var(--red);" title="Delete" (click)="deleteClick.emit(row)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ── Empty State ── -->
      <div class="table-empty" *ngIf="!loading && records.length === 0">
        <div class="empty-icon">📂</div>
        <h3>No Records Found</h3>
        <p>There are no items matching the criteria or configured in the system yet.</p>
      </div>

      <!-- ── Skeleton Loader Rows ── -->
      <table *ngIf="loading">
        <thead>
          <tr>
            <th *ngFor="let col of getSkeletonCols()">
              <div class="skeleton skl-line" style="width: 60px;"></div>
            </th>
            <th style="width: 100px; text-align: right;">
              <div class="skeleton skl-line" style="width: 40px; margin-left: auto;"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of [1, 2, 3]">
            <td *ngFor="let col of getSkeletonCols()">
              <div class="skeleton skl-line" [style.width.%]="getRandomWidth()"></div>
            </td>
            <td style="text-align: right;">
              <div class="skeleton skl-line" style="width: 60px; margin-left: auto;"></div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ── Pagination ── -->
      <div class="pagination" *ngIf="records.length > 0 || pagination.totalRecords > 0">
        <div class="page-info">
          Showing {{ getStartRecord() }}–{{ getEndRecord() }} of {{ pagination.totalRecords }} records
        </div>
        <button 
          class="page-btn" 
          [class.disabled]="pagination.page === 1"
          (click)="setPage(pagination.page - 1)"
        >
          &lt;
        </button>
        <button 
          *ngFor="let p of getPagesArray()" 
          class="page-btn"
          [class.active]="pagination.page === p"
          (click)="setPage(p)"
        >
          {{ p }}
        </button>
        <button 
          class="page-btn" 
          [class.disabled]="pagination.page === pagination.totalPages"
          (click)="setPage(pagination.page + 1)"
        >
          &gt;
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() spName!: string;
  @Input() columns: { label: string; key: string }[] = [];
  @Input() searchable = true;
  @Input() addLabel = '';
  @Input() filters: Record<string, any> = {};
  @Input() rowClickable = false;

  @Output() addClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();
  @Output() recordsLoaded = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();

  records: any[] = [];
  displayColumns: { label: string; key: string }[] = [];
  searchQuery = '';
  loading = false;

  pagination = {
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0
  };

  private searchDebounceTimer: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['spName'] && !changes['spName'].firstChange) || 
        (changes['filters'] && !changes['filters'].firstChange)) {
      this.pagination.page = 1;
      this.loadData();
    }
  }

  loadData() {
    if (!this.spName) return;
    this.loading = true;

    const payloadFilters = {
      search: this.searchQuery || undefined,
      ...this.filters
    };

    this.apiService.search<any>(this.spName, payloadFilters, this.pagination.page, this.pagination.pageSize)
      .subscribe({
        next: (res: PageResult) => {
          this.records = res.records;
          this.recordsLoaded.emit(this.records);
          this.pagination = res.pagination;
          
          // Always prefer columns returned directly from the DB response
          if (res.columns && res.columns.length > 0) {
            // Display exactly what the database provides, without removing any columns
            this.displayColumns = res.columns;
          } else if (this.columns && this.columns.length > 0) {
            // Fallback to manual columns config from component input
            this.displayColumns = this.columns;
          } else {
            // Fallback to generating columns from the first row keys
            if (this.records && this.records.length > 0) {
              const firstRow = this.records[0];
              this.displayColumns = Object.keys(firstRow)
                .filter(key => typeof firstRow[key] !== 'object')
                .map(key => ({
                  label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
                  key: key
                }));
            }
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onRowClick(row: any, event: Event) {
    if (this.rowClickable) {
      const target = event.target as HTMLElement;
      if (target.closest('.actions-cell') || target.closest('button')) {
        return;
      }
      this.rowClick.emit(row);
    }
  }

  onSearchChange(val: string) {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.pagination.page = 1;
      this.loadData();
    }, 400);
  }

  setPage(page: number) {
    if (page < 1 || page > this.pagination.totalPages || page === this.pagination.page) return;
    this.pagination.page = page;
    this.loadData();
  }

  getPagesArray(): number[] {
    const arr = [];
    for (let i = 1; i <= this.pagination.totalPages; i++) {
      arr.push(i);
    }
    return arr;
  }

  getStartRecord(): number {
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  getEndRecord(): number {
    return Math.min(this.pagination.page * this.pagination.pageSize, this.pagination.totalRecords);
  }

  getRandomWidth(): number {
    return Math.floor(Math.random() * 40) + 40; // 40% to 80%
  }

  getSkeletonCols(): any[] {
    return this.displayColumns && this.displayColumns.length ? this.displayColumns : [1, 2, 3, 4, 5];
  }

  isLookupKey(key: string): boolean {
    const k = key.toLowerCase();
    return k.endsWith('type') || 
           k.endsWith('status') || 
           k.includes('classification') || 
           k.includes('designation') ||
           k.includes('provider') ||
           k.includes('role') ||
           k.includes('category') ||
           k.includes('framework') ||
           k.includes('protocol') ||
           k.includes('platform') ||
           k.includes('level') ||
           k.includes('channel') ||
           k.includes('fiduciary') ||
           k.includes('impact') ||
           k.includes('rating') ||
           k.includes('basis');
  }

  isClickableColumn(key: string): boolean {
    const k = key.toLowerCase();
    return this.rowClickable && (k === 'applicationname' || k === 'applicationcode' || k === 'name' || k === 'appname');
  }

  formatValue(val: any): string {
    if (val == null) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  }
}

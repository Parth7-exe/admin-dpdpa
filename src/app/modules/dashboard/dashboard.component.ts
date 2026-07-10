import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { SP } from '../../core/config';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'dpdpa-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Compliance Dashboard</h2>
      <p class="page-sub">Real-time overview of the DPDP Act 2023 compliance status across fiduciaries and processing units.</p>
    </div>

    <!-- ── KPI Indicators ── -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-value">{{ stats.apps }}</div>
          <div class="kpi-label">Registered Applications</div>
        </div>
        <div class="kpi-icon" style="background: var(--blue-light); color: var(--blue);">🏢</div>
      </div>

      <div class="kpi-card">
        <div>
          <div class="kpi-value">{{ stats.dbs }}</div>
          <div class="kpi-label">Active Databases</div>
        </div>
        <div class="kpi-icon" style="background: var(--purple-light); color: var(--purple);">🗄️</div>
      </div>

      <div class="kpi-card">
        <div>
          <div class="kpi-value">{{ stats.notices }}</div>
          <div class="kpi-label">Consent Notices</div>
        </div>
        <div class="kpi-icon" style="background: var(--green-light); color: var(--green);">📜</div>
      </div>

      <div class="kpi-card">
        <div>
          <div class="kpi-value">{{ stats.requests }}</div>
          <div class="kpi-label">Pending DSR Requests</div>
        </div>
        <div class="kpi-icon" style="background: var(--red-light); color: var(--red);">👤</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px;">
      <!-- ── Data Mapping Progress ── -->
      <div class="card">
        <div class="card-header">
          <h3>Personal Data Mapping Summary</h3>
        </div>
        <div class="card-body">
          <p style="margin-bottom: 20px;">Your organization's current personal data mappings categorized by principal type and sensitivity.</p>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                <span>Application System Coverage</span>
                <span>80%</span>
              </div>
              <div style="height: 8px; background: var(--line-2); border-radius: 4px; overflow: hidden;">
                <div style="width: 80%; height: 100%; background: var(--blue); border-radius: 4px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                <span>Database Cataloging & Discovery</span>
                <span>95%</span>
              </div>
              <div style="height: 8px; background: var(--line-2); border-radius: 4px; overflow: hidden;">
                <div style="width: 95%; height: 100%; background: var(--purple); border-radius: 4px;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 500; font-size: 13px;">
                <span>Notice Acceptances Documented</span>
                <span>65%</span>
              </div>
              <div style="height: 8px; background: var(--line-2); border-radius: 4px; overflow: hidden;">
                <div style="width: 65%; height: 100%; background: var(--green); border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Compliance Status ── -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div class="card-header">
          <h3>Overall Health Score</h3>
        </div>
        <div class="card-body" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
          <div style="width: 120px; height: 120px; border-radius: 50%; border: 10px solid var(--blue-light); display: grid; place-items: center; margin-bottom: 16px; border-top-color: var(--blue);">
            <span style="font-size: 28px; font-weight: 800; color: var(--navy);">82%</span>
          </div>
          <p style="font-size: 13px; color: var(--ink-2);">Compliance checklist points fulfilled according to current GAP scorecard.</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = {
    apps: 0,
    dbs: 0,
    notices: 0,
    requests: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    forkJoin({
      apps: this.apiService.search(SP.APPLICATION_MASTER.fn, { isActive: true }, 1, 1).pipe(catchError(() => of({ pagination: { totalRecords: 0 } }))),
      dbs: this.apiService.search(SP.DATABASE_MASTER.fn, { isActive: true }, 1, 1).pipe(catchError(() => of({ pagination: { totalRecords: 0 } }))),
      notices: this.apiService.search(SP.CONSENT_NOTICE.fn, { isActive: true }, 1, 1).pipe(catchError(() => of({ pagination: { totalRecords: 0 } }))),
      requests: this.apiService.search(SP.DSR_REQUEST.fn, {}, 1, 1).pipe(catchError(() => of({ pagination: { totalRecords: 0 } })))
    }).subscribe({
      next: (results: any) => {
        this.stats.apps = results.apps?.pagination?.totalRecords ?? 0;
        this.stats.dbs = results.dbs?.pagination?.totalRecords ?? 0;
        this.stats.notices = results.notices?.pagination?.totalRecords ?? 0;
        this.stats.requests = results.requests?.pagination?.totalRecords ?? 0;
      }
    });
  }
}

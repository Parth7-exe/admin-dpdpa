import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ACTION } from './config';

export interface SpResponse {
  responseCode: string;
  respMessage?: string;
  description?: string;
  key?: Record<string, { label: string; key: string }[]>;
  data?: {
    pagination?: { page: number; pageSize: number; totalRecords: number; totalPages: number };
    data?: any[];
  } | any;
}

export interface PageResult<T = any> {
  records: T[];
  pagination: { page: number; pageSize: number; totalRecords: number; totalPages: number };
  columns: { label: string; key: string }[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBase;
  private readonly orgId = environment.orgId;

  constructor(private http: HttpClient) {}

  private readonly KNOWN_CONTROLLERS = new Set<string>([
    'application-master',
    'application-owner',
    'application-environment',
    'application-infrastructure',
    'application-interface-inventory',
    'application-data-scope',
    'application-data-scope-mapping',
    'application-database-mapping',
    'application-document-repository',
    'application-risk-profile',
    'application-risk-profile-detail',
    'application-vendor',
    'application-compliance-scope-master',
    'application-compliance-scope',
    'application-api-inventory',
    'dpdpa-cookies',
    'dpdpa-cookie-categories',
    'dpdpa-cookie-consents',
    'dpdpa-cookie-notice-config',
    'database-master',
    'database-environment',
    'database-vendor',
    'database-ownership',
    'database-compliance',
    'database-data-scope',
    'database-data-scope-detail',
    'column-inventory',
    'consent-notice-master',
    'consent-notice-language',
    'consent-channel-master',
    'consent-notice-version',
    'consent-purpose-master',
    'consent-purpose-detail',
    'consent-artifact',
    'consent-purpose-mapping',
    'consent-notice-purpose-mapping',
    'consent-notice-publication',
    'consent-status-history',
    'consent-withdrawal',
    'consent-notice-channel-mapping',
    'consent-audit-log',
    'consent-evidence',
    'evidence-category-master',
    'evidence-access-log',
    'evidence-approval',
    'evidence-audit-log',
    'evidence-mapping',
    'consent-notice-acceptance',
    'consent-history',
    'consent-notice-audit-log',
    'data-classification-master',
    'data-inventory-master',
    'data-inventory',
    'data-principal-notification',
    'data-principal-request',
    'data-scope-master'
  ]);

  private getEndpointPrefix(spName: string): string {
    let clean = spName.replace('dpdpa_fn_', '').replace('dpdpa_pa_', '').replace('_mgmt', '');
    const overrides: Record<string, string> = {
      'cookies': 'dpdpa-cookies',
      'cookie_categories': 'dpdpa-cookie-categories',
      'cookie_consents': 'dpdpa-cookie-consents',
      'cookie_notice_config': 'dpdpa-cookie-notice-config',
      'consent_notice_acceptance': 'consent-notice-acceptance'
    };
    if (overrides[clean]) {
      return overrides[clean];
    }
    return clean.replace(/_/g, '-');
  }

  /** Execute any stored procedure via the generic endpoint or its specific REST controller */
  private execute(spName: string, payload: any): Observable<SpResponse> {
    const prefix = this.getEndpointPrefix(spName);

    if (this.KNOWN_CONTROLLERS.has(prefix)) {
      const action = payload.action;
      const { action: _, ...cleanPayload } = payload;

      let path = '';
      if (action === 'SEARCH') {
        path = `${prefix}/search`;
      } else if (action === 'GETBYID') {
        path = `${prefix}/get-by-id`;
      } else if (action === 'GETBYAPP') {
        path = `${prefix}/get-by-app`;
      } else if (action === 'C') {
        path = `${prefix}/create`;
      } else if (action === 'U') {
        path = `${prefix}/update`;
      } else if (action === 'D') {
        path = `${prefix}/delete`;
      } else {
        path = `${prefix}/search`;
      }

      return this.http
        .post<any>(`${this.base}/${path}`, cleanPayload)
        .pipe(
          map((res) => {
            // Write ops (C/U/D) return { responseCode, description, data } at top level.
            // Read ops (SEARCH/GETBYID) return { responseCode, data: { pagination, data[] } }.
            // Use res directly when it already has responseCode; only unwrap res.data for reads.
            const dbRes = (res?.responseCode != null ? res : (res?.data ?? res)) as any;
            if (res && res.key && dbRes && !dbRes.key) {
              dbRes.key = res.key;
            }
            return dbRes as SpResponse;
          }),
          catchError((err) => {
            console.error(`[ApiService] Route "${path}" failed, falling back:`, err);
            // Fallback to generic if specific route fails
            return this.http.post<any>(`${this.base}/generic/execute`, { spName, payload }).pipe(
              map((fallbackRes) => {
                const dbRes = (fallbackRes?.data ?? fallbackRes) as any;
                if (fallbackRes && fallbackRes.key && dbRes && !dbRes.key) {
                  dbRes.key = fallbackRes.key;
                }
                return dbRes as SpResponse;
              })
            );
          })
        );
    }

    return this.http
      .post<any>(`${this.base}/generic/execute`, { spName, payload })
      .pipe(
        map((res) => {
          const dbRes = (res?.data ?? res) as any;
          if (res && res.key && dbRes && !dbRes.key) {
            dbRes.key = res.key;
          }
          return dbRes as SpResponse;
        }),
        catchError((err) => {
          console.error(`[ApiService] SP "${spName}" failed:`, err);
          return of({ responseCode: '2', description: err?.message ?? 'Network error', data: null });
        })
      );
  }

  /** SEARCH — returns paginated records + column definitions */
  search<T = any>(
    spName: string,
    filters: Record<string, any> = {},
    page = 1,
    pageSize = 10
  ): Observable<PageResult<T>> {
    const payload = {
      action: ACTION.SEARCH,
      orgId: this.orgId,
      pageNo: page,
      pageSize,
      isActive: true,
      ...filters,
    };
    return this.execute(spName, payload).pipe(
      map((res) => {
        const dataBlock = res?.data as any;
        const rows: T[] = Array.isArray(dataBlock?.data)
          ? dataBlock.data
          : Array.isArray(dataBlock)
          ? dataBlock
          : [];
        const pagination = dataBlock?.pagination ?? {
          page,
          pageSize,
          totalRecords: rows.length,
          totalPages: 1,
        };
        // Column definitions come from the SP's "key" field
        const keyBlock = res?.key ?? {};
        const firstKey = Object.keys(keyBlock)[0];
        const columns: { label: string; key: string }[] = firstKey ? keyBlock[firstKey] : [];
        return { records: rows, pagination, columns };
      })
    );
  }

  /** GETBYID — returns a single record */
  getById<T = any>(spName: string, id: number): Observable<T | null> {
    return this.execute(spName, { action: ACTION.GETBYID, orgId: this.orgId, id }).pipe(
      map((res) => {
        if (res?.responseCode === '00' || res?.responseCode === '0') {
          return (res.data ?? null) as T;
        }
        return null;
      })
    );
  }

  /** GETBYAPP — fetch single record by applicationId */
  getByApp<T = any>(spName: string, applicationId: number): Observable<T | null> {
    return this.execute(spName, { action: ACTION.GETBYAPP, applicationId }).pipe(
      map((res) => {
        if (res?.responseCode === '00' || res?.responseCode === '0') {
          return (res.data ?? null) as T;
        }
        return null;
      })
    );
  }

  create(spName: string, body: Record<string, any>): Observable<SpResponse> {
    return this.execute(spName, {
      action: ACTION.CREATE,
      orgId: this.orgId,
      createdBy: environment.defaultUser,
      ...body,
    });
  }

  /** UPDATE (action: U) */
  update(spName: string, body: Record<string, any>): Observable<SpResponse> {
    return this.execute(spName, {
      action: ACTION.UPDATE,
      orgId: this.orgId,
      updatedBy: environment.defaultUser,
      ...body,
    });
  }

  /** DELETE (soft — action: D) */
  delete(spName: string, id: number): Observable<SpResponse> {
    return this.execute(spName, {
      action: ACTION.DELETE,
      orgId: this.orgId,
      id,
      updatedBy: environment.defaultUser,
    });
  }

  /** EXCELDUMP — returns all records for export */
  dump<T = any>(spName: string, filters: Record<string, any> = {}): Observable<T[]> {
    return this.execute(spName, {
      action: ACTION.EXCELDUMP,
      orgId: this.orgId,
      ...filters,
    }).pipe(
      map((res) => {
        const dataBlock = res?.data as any;
        return Array.isArray(dataBlock?.data) ? dataBlock.data : [];
      })
    );
  }
}

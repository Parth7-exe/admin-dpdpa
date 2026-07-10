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

  /** Execute any stored procedure via the generic endpoint */
  private execute(spName: string, payload: any): Observable<SpResponse> {
    return this.http
      .post<any>(`${this.base}/generic/execute`, { spName, payload })
      .pipe(
        map((res) => (res?.data ?? res) as SpResponse),
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

  /** CREATE (action: C) */
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

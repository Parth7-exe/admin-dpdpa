import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SP } from './config';

export interface CategoryDetail {
  id: number;
  title: string;
  code: number;
  description: string;
  iconUrl: string;
  isActive: boolean;
  categoryName?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _categories = new BehaviorSubject<CategoryDetail[]>([]);
  categories$ = this._categories.asObservable();
  
  private _cookieCategories = new BehaviorSubject<any[]>([]);
  cookieCategories$ = this._cookieCategories.asObservable();

  private loaded = false;

  constructor(private api: ApiService) {}

  /** Load all active category details once at app startup */
  loadAll(): Observable<any> {
    if (this.loaded) return of(this._categories.value);
    
    return forkJoin({
      categories: this.api.search<CategoryDetail>(SP.CATEGORY_DETAIL.fn, { isActive: true }, 1, 1000),
      cookieCategories: this.api.search<any>('dpdpa_fn_cookie_categories_mgmt', { isActive: true }, 1, 1000)
    }).pipe(
      tap((result) => {
        this._categories.next(result.categories.records || []);
        this._cookieCategories.next(result.cookieCategories.records || []);
        this.loaded = true;
      }),
      catchError((err) => {
        console.error('[CategoryService] Failed to load categories:', err);
        return of([]);
      })
    );
  }

  /** Resolve a category code (bigint foreign key) → human-readable label */
  getLabel(code: number | null | undefined): string {
    if (code == null) return '—';
    const match = this._categories.value.find((c) => Number(c.id) === Number(code));
    return match?.title ?? String(code);
  }

  /** Resolve a cookie category ID → human-readable label */
  getCookieLabel(categoryId: number | null | undefined): string {
    if (categoryId == null) return '—';
    const match = this._cookieCategories.value.find((c) => Number(c.categoryId) === Number(categoryId));
    return match?.name ?? String(categoryId);
  }

  /** Get all categories matching a title prefix (for dropdown options) */
  getOptions(titleContains: string): CategoryDetail[] {
    const q = titleContains.toLowerCase().trim();
    // First, try exact match on parent categoryName
    const exactMatches = this._categories.value.filter((c) => 
      c.isActive && c.categoryName && c.categoryName.toLowerCase() === q
    );
    if (exactMatches.length > 0) {
      return exactMatches;
    }
    // Fallback to original partial match logic if no exact match exists
    return this._categories.value.filter((c) => 
      c.isActive && (
        c.title.toLowerCase().includes(q) ||
        (c.categoryName && c.categoryName.toLowerCase().includes(q))
      )
    );
  }

  get all(): CategoryDetail[] {
    return this._categories.value;
  }

  get cookieCategories(): any[] {
    return this._cookieCategories.value;
  }
}


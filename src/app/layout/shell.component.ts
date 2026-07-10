import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastService, ToastMessage } from '../core/toast.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { SP } from '../core/config';
import { AuthService, User } from '../core/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

interface NavGroup {
  label: string;
  icon: string;
  collapsed: boolean;
  items: NavItem[];
}

@Component({
  selector: 'dpdpa-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-shell">
      <!-- ── Sidebar Navigation ── -->
      <aside class="sidebar">
        <div class="sidebar-logo" style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center;">
          <img src="assets/logo.png" alt="Jodetx Logo" style="max-height: 32px; max-width: 100%; filter: brightness(0) invert(1);" />
        </div>

        <div class="sidebar-section-label">Compliance Operations</div>

        <nav style="flex: 1; padding: 10px 0;">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item-top">
            <i class="bi bi-speedometer2" style="display: inline-block; width: 18px; opacity: 0.8;"></i> &nbsp;<span>Dashboard</span>
          </a>

          <div *ngFor="let grp of navGroups" class="nav-group">
            <div class="nav-group-header" 
                 [class.collapsed]="grp.collapsed"
                 (click)="toggleGroup(grp)">
               <span><i [class]="grp.icon" style="display: inline-block; width: 18px; opacity: 0.8;"></i> &nbsp;{{ grp.label }}</span>
              <span class="chevron">▼</span>
            </div>
            <div class="nav-group-items" [class.closed]="grp.collapsed">
              <a *ngFor="let item of grp.items"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-item">
                <i *ngIf="item.icon" [class]="item.icon" style="display: inline-block; width: 14px; font-size: 11px; opacity: 0.7;"></i> &nbsp;
                <span>{{ item.label }}</span>
              </a>
            </div>
          </div>
        </nav>
      </aside>

      <!-- ── Main Content Area ── -->
      <div class="main-area">
        <!-- ── Topbar ── -->
        <header class="topbar">
          <div class="topbar-left">
            DPDP Act 2023 Compliance Panel
          </div>
          <div class="topbar-right" *ngIf="currentUser">
            <div class="topbar-badge" style="background: var(--purple-light); color: var(--purple);">
              <span>🛡️</span> {{ currentUser.roleName }}
            </div>
            <div class="topbar-badge">
              <span>🏢</span> Org ID: {{ orgId }}
            </div>
            <div style="font-weight: 500; font-size: 13px; color: var(--ink-2); display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; border-radius: 50%; background: var(--blue); color: #fff; display: grid; place-items: center; font-weight: 700;">{{ currentUser.initials }}</span>
              <span>{{ currentUser.email }}</span>
              <button (click)="logout()" style="background: transparent; border: 1px solid var(--line); color: var(--red); padding: 5px 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; cursor: pointer; transition: all var(--transition); margin-left: 8px;">
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        <!-- ── Router Outlet ── -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- ── Global Toast Container ── -->
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async" 
           class="toast" 
           [ngClass]="'toast-' + toast.type">
        <div style="display: flex; flex-direction: column; flex: 1;">
          <b style="font-size: 12.5px;">{{ toast.title }}</b>
          <span *ngIf="toast.body" style="font-size: 11.5px; opacity: 0.8; margin-top: 2px;">{{ toast.body }}</span>
        </div>
        <span style="cursor: pointer; opacity: 0.5; font-size: 14px; font-weight: 700;" (click)="dismissToast(toast.id)">&times;</span>
      </div>
    </div>
  `
})
export class ShellComponent implements OnInit {
  toasts$: Observable<ToastMessage[]>;
  orgId = environment.orgId;
  currentUser: User | null = null;

  navGroups: NavGroup[] = [];

  constructor(
    private toastService: ToastService,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadMenu();
      } else {
        this.navGroups = [];
      }
    });
  }

  loadMenu() {
    const roleFilter = this.currentUser ? { isActive: true, roleId: this.currentUser.roleId } : { isActive: true };
    this.apiService.search<any>(SP.MENU_MGMT.fn, roleFilter).subscribe({
      next: (res) => {
        if (res && res.records) {
          this.navGroups = res.records.map((m: any) => {
            const key = `nav_collapsed_${m.name}`;
            const saved = localStorage.getItem(key);
            // Default collapse to true unless stored otherwise
            const collapsed = saved !== null ? saved === 'true' : true;

            return {
              label: m.name,
              icon: m.icon || '📁',
              collapsed: collapsed,
              items: (m.items || []).map((c: any) => ({
                label: c.label,
                route: c.route,
                icon: c.icon
              }))
            };
          });
        }
      },
      error: (err) => {
        console.error('[ShellComponent] Failed to load dynamic sidebar menu:', err);
        this.toastService.error('Error', 'Failed to load navigation menu.');
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleGroup(grp: NavGroup) {
    grp.collapsed = !grp.collapsed;
    localStorage.setItem(`nav_collapsed_${grp.label}`, String(grp.collapsed));
  }

  dismissToast(id: number) {
    this.toastService.dismiss(id);
  }
}

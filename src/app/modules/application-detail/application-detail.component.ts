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

      <!-- Custom Cookie Categories Toggle Interface -->
      <ng-container *ngIf="activeTab.id === 'cookies'; else standardTable">

        <!-- ── Cookie Notice Description Card ── -->
        <div style="margin-bottom: 18px; padding: 16px; background: #f8f9fb; border: 1px solid var(--line); border-radius: var(--radius); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: var(--navy);">📋 Cookie Notice Description</div>
              <div style="font-size: 11.5px; color: var(--ink-3); margin-top: 2px;">This text appears in the "About Cookies" dialog shown to website visitors.</div>
            </div>
            <button *ngIf="!editingNoticeDesc" type="button" style="background: none; border: none; color: var(--burgundy); cursor: pointer; font-size: 12px; padding: 4px 0; text-decoration: underline; font-weight: 500; white-space: nowrap;" (click)="editingNoticeDesc = true">✏️ Edit</button>
          </div>

          <ng-container *ngIf="editingNoticeDesc; else showNoticeDesc">
            <textarea
              #noticeDescInput
              style="width: 100%; min-height: 90px; padding: 10px 14px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff; font-family: inherit; resize: vertical; line-height: 1.6;"
              [value]="cookieNoticeConfig?.noticeDescription || ''"
              placeholder="Enter the cookie notice text that visitors will see when they open the consent dialog…"
            ></textarea>
            
            <!-- Text Color Selection -->
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px; margin-bottom: 6px;">
              <span style="font-size: 12.5px; font-weight: 600; color: var(--navy); width: 90px;">Text Color:</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input 
                  #noticeTextColorInput
                  type="color" 
                  style="width: 38px; height: 38px; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; padding: 0; background: none;"
                  [value]="cookieNoticeConfig?.textColor || '#86003c'"
                />
                <input 
                  #noticeTextColorTextInput
                  type="text" 
                  style="width: 100px; padding: 6px 10px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff;"
                  [value]="noticeTextColorInput.value"
                  (input)="noticeTextColorInput.value = noticeTextColorTextInput.value"
                />
              </div>
            </div>

            <!-- Button Color Selection -->
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px; margin-bottom: 6px;">
              <span style="font-size: 12.5px; font-weight: 600; color: var(--navy); width: 90px;">Button Color:</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input 
                  #noticeButtonColorInput
                  type="color" 
                  style="width: 38px; height: 38px; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; padding: 0; background: none;"
                  [value]="cookieNoticeConfig?.buttonColor || '#86003c'"
                />
                <input 
                  #noticeButtonColorTextInput
                  type="text" 
                  style="width: 100px; padding: 6px 10px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff;"
                  [value]="noticeButtonColorInput.value"
                  (input)="noticeButtonColorInput.value = noticeButtonColorTextInput.value"
                />
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button type="button" class="btn btn-primary" style="padding: 5px 14px; font-size: 12px; border-radius: 5px;" (click)="saveCookieNoticeConfig(noticeDescInput.value, noticeTextColorInput.value, noticeButtonColorInput.value)">Save</button>
              <button type="button" class="btn btn-secondary" style="padding: 5px 14px; font-size: 12px; border-radius: 5px;" (click)="editingNoticeDesc = false">Cancel</button>
            </div>
          </ng-container>

          <ng-template #showNoticeDesc>
            <p style="margin: 0; font-size: 13px; color: var(--ink-2); line-height: 1.65; white-space: pre-wrap;">{{ cookieNoticeConfig?.noticeDescription || 'No cookie notice text set. Click Edit to add one.' }}</p>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
              <div *ngIf="cookieNoticeConfig?.textColor" style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-3);">
                <span style="width: 90px;">Text Color:</span>
                <span [style.background-color]="cookieNoticeConfig.textColor" style="width: 16px; height: 16px; border-radius: 4px; display: inline-block; border: 1px solid var(--line);"></span>
                <code style="font-weight: 600;">{{ cookieNoticeConfig.textColor }}</code>
              </div>
              <div *ngIf="cookieNoticeConfig?.buttonColor" style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-3);">
                <span style="width: 90px;">Button Color:</span>
                <span [style.background-color]="cookieNoticeConfig.buttonColor" style="width: 16px; height: 16px; border-radius: 4px; display: inline-block; border: 1px solid var(--line);"></span>
                <code style="font-weight: 600;">{{ cookieNoticeConfig.buttonColor }}</code>
              </div>
            </div>
          </ng-template>
        </div>

        <!-- ── Add Category Header Row ── -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px; margin-top: 16px;">
          <button type="button" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 13px; font-weight: 600; border-radius: 6px; cursor: pointer;" (click)="openAddCategoryModal()">
            ➕ Add Cookie Category
          </button>
        </div>

        <div class="cookie-categories-list" style="display: flex; flex-direction: column; gap: 12px;">
          <div *ngFor="let cat of cookieCategoriesList" class="cookie-category-item" style="display: flex; flex-direction: column; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: #fcfcfc; transition: all 0.2s;">

            
            <!-- Category Header Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; flex-direction: column; gap: 4px; max-width: 80%; width: 100%;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h4 style="margin: 0; font-size: 14.5px; color: var(--navy); font-weight: 600;">{{ cat.name }}</h4>
                  <button *ngIf="!cat.isEssential" type="button" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 11px; padding: 0 4px; text-decoration: underline; font-weight: 500; display: inline-flex; align-items: center;" (click)="deleteCategory(cat)">
                    🗑️ Delete Category
                  </button>
                </div>
                
                <ng-container *ngIf="cat.editingDescription; else showDesc">
                  <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px; width: 100%;">
                    <textarea 
                      #descInput
                      style="width: 100%; min-height: 50px; padding: 8px 12px; font-size: 12.5px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff; font-family: inherit;"
                      [value]="cat.description"
                    ></textarea>
                    <div style="display: flex; gap: 6px;">
                      <button type="button" class="btn btn-primary" style="padding: 4px 10px; font-size: 11px; border-radius: 4px;" (click)="saveCategoryDescription(cat, descInput.value)">Save</button>
                      <button type="button" class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px; border-radius: 4px;" (click)="cat.editingDescription = false">Cancel</button>
                    </div>
                  </div>
                </ng-container>

                <ng-template #showDesc>
                  <p style="margin: 0; font-size: 12.5px; color: var(--ink-3); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span>{{ cat.description }}</span>
                    <button type="button" style="background: none; border: none; color: var(--burgundy); cursor: pointer; font-size: 11.5px; padding: 0; text-decoration: underline; font-weight: 500;" (click)="cat.editingDescription = true">✏️ Edit Description</button>
                  </p>
                </ng-template>
              </div>
              <div>
                <label class="toggle-switch" [style.opacity]="cat.isEssential ? 0.6 : 1" [style.cursor]="cat.isEssential ? 'not-allowed' : 'pointer'">
                  <input type="checkbox" [checked]="cat.active" [disabled]="cat.isEssential" (change)="onCookieCategoryToggle(cat, $event)" />
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>

            <!-- Nested Cookies Inline Manager -->
            <div *ngIf="cat.active" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--line); display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <div style="font-size: 12.5px; font-weight: 700; color: var(--navy); margin-bottom: 2px;">Mapped Cookies:</div>
              
              <!-- Cookie Pills -->
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <div *ngFor="let ck of getActiveCookies(cat)" style="display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); padding: 6px 12px; border-radius: 6px; font-size: 13px; box-shadow: var(--shadow-sm);">
                  <span style="font-weight: 500; color: var(--navy);">{{ ck.cookieName }}</span>
                  <span style="font-size: 11px; color: var(--ink-3);">({{ ck.provider }} • Host: {{ ck.domain || '*' }})</span>
                  <button type="button" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 13px; font-weight: bold; padding: 0 0 0 4px;" (click)="deleteCookieInline(cat, ck)">&times;</button>
                </div>
                
                <div *ngIf="getActiveCookies(cat).length === 0" style="font-size: 12.5px; color: var(--ink-3); font-style: italic;">No specific cookies mapped. Toggling this category enables defaults.</div>
              </div>

              <!-- Quick Add Inputs (Name & Host) -->
              <div style="display: flex; gap: 8px; margin-top: 8px; max-width: 600px; flex-wrap: wrap;">
                <input 
                  #ckInput
                  type="text" 
                  placeholder="Cookie Name (e.g. _ga)" 
                  style="flex: 2; min-width: 150px; padding: 6px 12px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff;"
                  (keyup.enter)="addCookieInline(cat, ckInput.value, hostInput.value); ckInput.value = ''; hostInput.value = ''"
                />
                <input 
                  #hostInput
                  type="text" 
                  placeholder="Host (e.g. *.google.com)" 
                  style="flex: 1.5; min-width: 120px; padding: 6px 12px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff;"
                  (keyup.enter)="addCookieInline(cat, ckInput.value, hostInput.value); ckInput.value = ''; hostInput.value = ''"
                />
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  style="padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 6px;"
                  (click)="addCookieInline(cat, ckInput.value, hostInput.value); ckInput.value = ''; hostInput.value = ''"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        </div>
      </ng-container>

      <ng-template #standardTable>
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
      </ng-template>
    </div>

    <!-- ── Edit / Create Side Drawer ── -->
    <dpdpa-side-drawer
      [isOpen]="drawerOpen"
      [title]="(editingRecord ? 'Edit ' : 'New ') + activeTab.singleName"
      (close)="drawerOpen = false"
    >
      <form [formGroup]="form" (ngSubmit)="save()" body>
        <ng-container *ngFor="let field of activeTab.fields">
          <!-- Hide applicationId because we set it automatically behind the scenes, and hide isActive -->
          <div *ngIf="field.key !== 'applicationId' && field.key !== 'isActive'" class="form-group">
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

    <!-- ── Add Category Modal ── -->
    <div *ngIf="showAddCategoryModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
      <div style="background: #fff; width: 100%; max-width: 480px; padding: 24px; border-radius: var(--radius); border: 1px solid var(--line); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line-2); padding-bottom: 12px;">
          <h3 style="margin: 0; font-size: 16px; color: var(--navy); font-weight: 700;">Add Cookie Category</h3>
          <button type="button" style="background: none; border: none; font-size: 20px; color: var(--ink-3); cursor: pointer;" (click)="showAddCategoryModal = false">&times;</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="required" style="font-size: 12px; font-weight: 600; color: var(--navy);">Category Key</label>
            <input 
              #newCatKey
              type="text" 
              placeholder="e.g. Analytics" 
              style="width: 100%; padding: 8px 12px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff;"
            />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="required" style="font-size: 12px; font-weight: 600; color: var(--navy);">Category Name</label>
            <input 
              #newCatName
              type="text" 
              placeholder="e.g. Analytics Cookies" 
              style="width: 100%; padding: 8px 12px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff;"
            />
          </div>
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 12px; font-weight: 600; color: var(--navy);">Description</label>
            <textarea 
              #newCatDesc
              placeholder="e.g. Help us understand how visitors use the site..." 
              style="width: 100%; min-height: 60px; padding: 8px 12px; font-size: 13px; border: 1px solid var(--line); border-radius: 6px; outline: none; background: #fff; font-family: inherit; resize: vertical;"
            ></textarea>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
            <input 
              #newCatEssential
              type="checkbox" 
              id="newCatEssential"
              style="cursor: pointer;"
            />
            <label for="newCatEssential" style="font-size: 12.5px; font-weight: 500; color: var(--ink); cursor: pointer; user-select: none;">Is Essential (Necessary for site operations)</label>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--line-2); padding-top: 14px; margin-top: 6px;">
          <button type="button" class="btn btn-secondary" style="padding: 6px 14px; font-size: 12px; border-radius: 6px;" (click)="showAddCategoryModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; border-radius: 6px;" 
                  (click)="createCategory(newCatKey.value, newCatName.value, newCatDesc.value, newCatEssential.checked)">
            Save Category
          </button>
        </div>
      </div>
    </div>
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
  cookieCategories: { id: number; title: string }[] = [];
  cookieCategoriesList: any[] = [];
  editingNoticeDesc = false;
  savingNoticeDesc = false;
  cookieNoticeConfig: any = null; // dedicated cookie notice config record
  showAddCategoryModal = false;

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
        { key: 'environmentStatus', label: 'Environment Type', type: 'select', optionsFromCategory: 'Environment Type' },
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
        { key: 'overallRiskLevel', label: 'Overall Risk Level', type: 'select', optionsFromCategory: 'Risk Rating' },
        { key: 'riskScore', label: 'Risk Score (0 - 100)', type: 'number' },
        { key: 'assessmentDate', label: 'Assessment Conducted On', type: 'date' },
        { key: 'assessedBy', label: 'Assessor Name', type: 'text' },
        { key: 'nextReviewDate', label: 'Next Review Date', type: 'date' },
        { key: 'remarks', label: 'Remarks / Mitigation Actions', type: 'textarea' },
        { key: 'isActive', label: 'Active Status', type: 'checkbox' }
      ]
    },
    {
      id: 'cookies',
      label: 'Cookie Consent',
      sp: SP.APPLICATION_COOKIES,
      primaryKey: 'cookieId',
      singleName: 'Cookie',
      fields: [
        { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
        { key: 'cookieName', label: 'Cookie Name', type: 'text', required: true },
        { key: 'categoryId', label: 'Category', type: 'select', required: true },
        { key: 'provider', label: 'Provider', type: 'text' },
        { key: 'domain', label: 'Domain', type: 'text' },
        { key: 'purpose', label: 'Purpose', type: 'textarea' },
        { key: 'dataCollected', label: 'Data Collected', type: 'text' },
        { key: 'duration', label: 'Duration', type: 'text' },
        { key: 'isThirdParty', label: 'Is Third Party', type: 'checkbox' },
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
        { key: 'frameworkName', label: 'Compliance Standard', type: 'select', optionsFromCategory: 'Framework' },
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
        this.loadCookieCategories();
        this.loadCookieNoticeConfig();
        this.selectTab(this.tabs[0]);
      }
    });
  }

  loadCookieCategories() {
    this.apiService.search<any>('dpdpa_fn_cookie_categories_mgmt', { isActive: true }, 1, 100).subscribe({
      next: (catRes) => {
        if (catRes && catRes.records) {
          const categories = catRes.records;

          this.apiService.search<any>('dpdpa_fn_cookies_mgmt', { applicationId: this.appId, isActive: null as any }, 1, 1000).subscribe({
            next: (cookieRes) => {
              const cookies = cookieRes?.records || [];

              this.cookieCategoriesList = categories.map((cat: any) => {
                const catCookies = cookies.filter((ck: any) => Number(ck.categoryId) === Number(cat.categoryId));
                const hasActive = catCookies.some((ck: any) => ck.isActive === true);

                return {
                  categoryId: cat.categoryId,
                  name: cat.name,
                  description: cat.description,
                  isEssential: cat.isEssential,
                  active: cat.isEssential ? true : hasActive,
                  cookies: catCookies
                };
              });

              // Auto-seed Necessary Cookie in DB if missing
              this.cookieCategoriesList.forEach((cat) => {
                if (cat.isEssential && cat.cookies.length === 0) {
                  const defaultName = `${cat.name.replace(' Cookies', '')} Cookie`;
                  this.apiService.create(SP.APPLICATION_COOKIES.pa, {
                    orgId: 1,
                    applicationId: this.appId,
                    categoryId: cat.categoryId,
                    cookieName: defaultName,
                    provider: 'Self',
                    domain: '*',
                    purpose: `Required for website operations and security.`,
                    duration: 'Session',
                    isThirdParty: false,
                    isActive: true
                  }).subscribe({
                    next: (res: any) => {
                      cat.cookies = [{
                        cookieId: res.data?.id,
                        categoryId: cat.categoryId,
                        cookieName: defaultName,
                        isActive: true
                      }];
                    }
                  });
                }
              });

              this.cookieCategories = categories.map((c: any) => ({
                id: Number(c.categoryId),
                title: c.name
              }));
            }
          });
        }
      }
    });
  }

  onCookieCategoryToggle(cat: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    cat.active = isChecked;

    if (isChecked) {
      if (cat.cookies && cat.cookies.length > 0) {
        let completedCount = 0;
        cat.cookies.forEach((ck: any) => {
          this.apiService.update(SP.APPLICATION_COOKIES.pa, {
            id: Number(ck.cookieId),
            orgId: 1,
            applicationId: this.appId,
            categoryId: cat.categoryId,
            cookieName: ck.cookieName,
            isActive: true
          }).subscribe({
            next: () => {
              ck.isActive = true;
              completedCount++;
              if (completedCount === cat.cookies.length) {
                this.toastService.success('Category Enabled', `${cat.name} are now active.`);
              }
            }
          });
        });
      } else {
        const defaultName = `${cat.name.replace(' Cookies', '')} Cookie`;

        this.apiService.create(SP.APPLICATION_COOKIES.pa, {
          orgId: 1,
          applicationId: this.appId,
          categoryId: cat.categoryId,
          cookieName: defaultName,
          provider: 'Self',
          domain: '*',
          purpose: `Required for ${cat.name.toLowerCase()} processing`,
          duration: 'Session',
          isThirdParty: false,
          isActive: true
        }).subscribe({
          next: (res: any) => {
            const newCookie = {
              cookieId: res.data?.id,
              categoryId: cat.categoryId,
              cookieName: defaultName,
              isActive: true
            };
            cat.cookies = [newCookie];
            this.toastService.success('Category Enabled', `${cat.name} are now active.`);
          },
          error: () => {
            this.toastService.error('Error', 'Failed to enable category');
            cat.active = false;
            (event.target as HTMLInputElement).checked = false;
          }
        });
      }
    } else {
      if (cat.cookies && cat.cookies.length > 0) {
        let completedCount = 0;
        cat.cookies.forEach((ck: any) => {
          this.apiService.update(SP.APPLICATION_COOKIES.pa, {
            id: Number(ck.cookieId),
            orgId: 1,
            applicationId: this.appId,
            categoryId: cat.categoryId,
            cookieName: ck.cookieName,
            isActive: false
          }).subscribe({
            next: () => {
              ck.isActive = false;
              completedCount++;
              if (completedCount === cat.cookies.length) {
                this.toastService.success('Category Disabled', `${cat.name} are now inactive.`);
              }
            }
          });
        });
      } else {
        this.toastService.success('Category Disabled', `${cat.name} are now inactive.`);
      }
    }
  }

  addCookieInline(cat: any, name: string, host: string) {
    const trimmed = name?.trim();
    const trimmedHost = host?.trim() || '*';
    if (!trimmed) {
      this.toastService.error('Validation Error', 'Cookie name cannot be empty');
      return;
    }

    const defaultDetails: Record<number, { provider: string; purpose: string; duration: string }> = {
      1: { provider: 'Self', purpose: 'Essential security or session token', duration: 'Session' },
      2: { provider: 'Self', purpose: 'Remembers user interface preferences', duration: '1 month' },
      3: { provider: 'Google Analytics', purpose: 'Collects website usage and performance metrics', duration: '2 years' },
      4: { provider: 'Marketing Vendor', purpose: 'Delivers targeted promotional advertising campaigns', duration: '3 months' }
    };

    const info = defaultDetails[Number(cat.categoryId)] || { provider: 'Self', purpose: 'Integration token', duration: 'Session' };

    this.apiService.create(SP.APPLICATION_COOKIES.pa, {
      orgId: 1,
      applicationId: this.appId,
      categoryId: cat.categoryId,
      cookieName: trimmed,
      provider: info.provider,
      domain: trimmedHost,
      purpose: info.purpose,
      duration: info.duration,
      isThirdParty: cat.categoryId > 2,
      isActive: true
    }).subscribe({
      next: (res: any) => {
        const newCookie = {
          cookieId: res.data?.id,
          orgId: this.application?.orgId || 1,
          applicationId: this.appId,
          categoryId: cat.categoryId,
          cookieName: trimmed,
          provider: info.provider,
          domain: trimmedHost,
          purpose: info.purpose,
          duration: info.duration,
          isActive: true
        };
        cat.cookies = [...(cat.cookies || []), newCookie];
        this.toastService.success('Cookie Added', `"${trimmed}" is registered under ${cat.name}.`);
      },
      error: () => {
        this.toastService.error('Error', 'Failed to save cookie.');
      }
    });
  }

  deleteCookieInline(cat: any, ck: any) {
    this.apiService.delete(SP.APPLICATION_COOKIES.pa, ck.cookieId).subscribe({
      next: () => {
        cat.cookies = cat.cookies.filter((x: any) => x.cookieId !== ck.cookieId);
        this.toastService.success('Cookie Removed', `"${ck.cookieName}" was deleted.`);
      },
      error: () => {
        this.toastService.error('Error', 'Failed to delete cookie.');
      }
    });
  }

  saveCategoryDescription(cat: any, newDesc: string) {
    this.apiService.update('dpdpa_pa_cookie_categories_mgmt', {
      id: Number(cat.categoryId),
      orgId: 1,
      description: newDesc
    }).subscribe({
      next: () => {
        cat.description = newDesc;
        cat.editingDescription = false;
        this.toastService.success('Description Updated', `Successfully updated description for ${cat.name}.`);
      },
      error: (err) => {
        console.error('Failed to update category description:', err);
        this.toastService.error('Error', 'Failed to update category description.');
      }
    });
  }

  openAddCategoryModal() {
    this.showAddCategoryModal = true;
  }

  createCategory(key: string, name: string, desc: string, isEssential: boolean) {
    if (!key?.trim()) {
      this.toastService.error('Validation', 'Category Key is required.');
      return;
    }
    if (!name?.trim()) {
      this.toastService.error('Validation', 'Category Name is required.');
      return;
    }

    const payload = {
      categoryKey: key.trim(),
      name: name.trim(),
      description: desc?.trim() || '',
      isEssential: !!isEssential,
      displayOrder: 1,
      createdBy: 'admin'
    };

    this.apiService.create('dpdpa_pa_cookie_categories_mgmt', payload).subscribe({
      next: (res: any) => {
        if (res.responseCode === '0' || res.responseCode === '00') {
          this.toastService.success('Category Added', `"${name}" category created successfully.`);
          this.showAddCategoryModal = false;
          this.loadCookieCategories();
        } else {
          this.toastService.error('Error', res.description || 'Failed to create category.');
        }
      },
      error: (err) => {
        console.error('Failed to create category:', err);
        this.toastService.error('Error', 'Failed to save cookie category.');
      }
    });
  }

  deleteCategory(cat: any) {
    if (confirm(`Are you sure you want to delete the category "${cat.name}"? This will soft-delete the category.`)) {
      this.apiService.delete('dpdpa_pa_cookie_categories_mgmt', Number(cat.categoryId)).subscribe({
        next: (res: any) => {
          if (res.responseCode === '0' || res.responseCode === '00') {
            this.toastService.success('Category Deleted', `"${cat.name}" has been deleted.`);
            this.loadCookieCategories();
          } else {
            this.toastService.error('Error', res.description || 'Failed to delete category.');
          }
        },
        error: (err) => {
          console.error('Failed to delete category:', err);
          this.toastService.error('Error', 'Failed to delete category.');
        }
      });
    }
  }

  getActiveCookies(cat: any): any[] {
    if (!cat || !cat.cookies) return [];
    return cat.cookies.filter((ck: any) => ck.isActive === true);
  }

  saveCookieNoticeConfig(newDesc: string, newTextColor: string, newButtonColor: string) {
    if (!newDesc?.trim()) {
      this.toastService.error('Validation', 'Description cannot be empty.');
      return;
    }
    this.savingNoticeDesc = true;
    this.apiService.create(SP.COOKIE_NOTICE_CONFIG.pa, {
      applicationId: this.appId,
      noticeDescription: newDesc.trim(),
      textColor: newTextColor || '#86003c',
      buttonColor: newButtonColor || '#86003c',
      createdBy: 'admin'
    }).subscribe({
      next: (res) => {
        this.savingNoticeDesc = false;
        if (res?.responseCode === '0' || res?.responseCode === '00') {
          this.cookieNoticeConfig = { 
            ...(this.cookieNoticeConfig || {}), 
            noticeDescription: newDesc.trim(),
            textColor: newTextColor,
            buttonColor: newButtonColor
          };
          this.editingNoticeDesc = false;
          this.toastService.success('Saved', 'Cookie notice config saved successfully.');
        } else {
          this.toastService.error('Error', res?.description || 'Failed to save config.');
        }
      },
      error: () => {
        this.savingNoticeDesc = false;
        this.toastService.error('Error', 'Failed to save cookie notice config.');
      }
    });
  }

  loadCookieNoticeConfig() {
    this.apiService.getByApp<any>(SP.COOKIE_NOTICE_CONFIG.fn, this.appId).subscribe({
      next: (res) => {
        console.log('[loadCookieNoticeConfig] Loaded notice config:', res);
        this.cookieNoticeConfig = res;
      },
      error: (err) => {
        console.error('[loadCookieNoticeConfig] Failed to load notice config:', err);
        this.cookieNoticeConfig = null;
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

  getSelectOptions(field: FormField): any[] {
    if (field.key === 'categoryId') {
      return this.cookieCategories;
    }
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

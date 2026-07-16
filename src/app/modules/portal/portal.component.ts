import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { ApiService } from '../../core/api.service';
import { CategoryService } from '../../core/category.service';
import { SP } from '../../core/config';

interface Consent {
  id: string;
  versionId: number;
  name: string;
  org: string;
  scope: string;
  active: boolean;
  date: string;
}

interface Grievance {
  ref: string;
  subject: string;
  cat: string;
  status: string;
  date: string;
}

interface DsrRequest {
  ref: string;
  type: string;
  cat: string;
  date: string;
  details: string;
  status: string;
}

@Component({
  selector: 'dpdpa-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class DataPrincipalPortalComponent implements OnInit {

  currentView = 'dashboard';
  currentUser: User | null = null;

  // Loaded database profile parameters
  profileName = 'Data Principal';
  profileMobile = '';
  profileCode = ''; // entity_id / JDX0000x code
  profileDob = '1995-05-15';
  profileCity = 'Pune';
  profileState = 'Maharashtra';
  profileNationality = 'Indian';
  profileKyc = 'Verified';

  // Dynamic States
  consents: Consent[] = [];
  requests: DsrRequest[] = [];
  grievances: Grievance[] = [];
  notifications: { text: string; date: string }[] = [];

  dataCategories: string[] = [];
  rightsTabs: string[] = [];
  activeRightsTab = 'Access';
  grievanceCategories: string[] = [];

  // Forms
  requestForm!: FormGroup;
  grievanceForm!: FormGroup;




  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private toastService: ToastService,
    private categoryService: CategoryService
  ) {
    this.initForms();
  }

  ngOnInit() {
    // Load categories dynamically from DB via CategoryService
    const dbCategories = this.categoryService.getOptions('Data Category Name');
    if (dbCategories && dbCategories.length > 0) {
      this.dataCategories = dbCategories.map(c => c.title);
    } else {
      this.dataCategories = ['Identity Data', 'Contact Data', 'Financial Data', 'Health Data', 'Biometric Data'];
    }

    // Load rights tabs dynamically from DB
    const reqTypes = this.categoryService.getOptions('Request Type');
    const filtered = reqTypes.filter(c => Number(c.code) !== 5 && Number(c.code) !== 6);
    this.rightsTabs = filtered.map(c => c.title);
    if (this.rightsTabs.length > 0) {
      this.activeRightsTab = this.rightsTabs[0];
    } else {
      this.rightsTabs = ['Access', 'Correction', 'Erasure', 'Consent Withdrawal', 'Nomination'];
      this.activeRightsTab = 'Access';
    }

    // Load grievance categories dynamically
    this.grievanceCategories = reqTypes.map(c => c.title);
    if (!this.grievanceCategories.includes('Other')) {
      this.grievanceCategories.push('Other');
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadProfileAndRelatedData();
      }
    });

    this.route.params.subscribe(params => {
      this.currentView = params['view'] || 'dashboard';
      this.setRightsTab(this.activeRightsTab); // reset form validation on view changes
    });
  }



  private initForms() {
    this.requestForm = this.fb.group({
      category: ['', [Validators.required]],
      correctValue: [''],
      details: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.grievanceForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(4)]],
      category: ['Consent Management', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  setRightsTab(tab: string) {
    this.activeRightsTab = tab;
    this.requestForm.reset({ category: '', correctValue: '', details: '' });
    
    const correctValControl = this.requestForm.get('correctValue');
    if (tab === 'Correct' || tab === 'Correction') {
      correctValControl?.setValidators([Validators.required]);
    } else {
      correctValControl?.clearValidators();
    }
    correctValControl?.updateValueAndValidity();
  }

  // ── Database Dynamic Queries ────────────────────────────────────────────

  private loadProfileAndRelatedData() {
    if (!this.currentUser) return;

    // Fetch profile dynamically from database using email search
    this.apiService.search<any>(SP.DATA_PRINCIPAL.fn, { email: this.currentUser.email }).subscribe({
      next: (res) => {
        if (res && res.records && res.records.length > 0) {
          const principal = res.records[0];
          this.profileName = principal.fullName || 'Data Principal';
          this.profileMobile = principal.mobile || '';
          this.profileCode = principal.principalCode || '';
          this.profileDob = principal.dateOfBirth || '';
          this.profileCity = principal.city || '';
          this.profileState = principal.state || '';
          this.profileNationality = principal.nationality || '';
          this.profileKyc = principal.kycStatus || 'Verified';

          // Load other tables using the resolved profileCode/customerId
          this.loadDsrRequests();
          this.loadConsents();
          this.loadNotifications();
        }
      },
      error: (err) => {
        console.error('[PortalComponent] Failed to load data principal profile:', err);
      }
    });
  }

  loadDsrRequests() {
    // Use entityId from auth session if profileCode not yet loaded from data_principal_master
    const customerId = this.profileCode || this.currentUser?.entityId || '';
    if (!customerId) return;

    this.apiService.search<any>(SP.DSR_REQUEST.fn, { customerId }).subscribe({
      next: (res) => {
        if (res && res.records) {
          const mappedRequests: DsrRequest[] = [];
          const mappedGrievances: Grievance[] = [];

          res.records.forEach((r: any) => {
            const typeLabel = this.getRequestTypeLabel(r.requestTypeId);
            const statusLabel = this.getStatusLabel(r.currentStatus);
            const formattedDate = r.requestDate ? new Date(r.requestDate).toLocaleString('en-US', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : '';

            if (Number(r.requestTypeId) === 5) {
              let categoryLabel = 'Consent';
              let subjectLine = 'Grievance Concern';
              let cleanRemarks = r.remarks || '';

              if (r.remarks && r.remarks.startsWith('[Category: ')) {
                const endIndex = r.remarks.indexOf(']');
                if (endIndex > -1) {
                  categoryLabel = r.remarks.substring(11, endIndex);
                  cleanRemarks = r.remarks.substring(endIndex + 1).trim();
                }
              }
              
              if (cleanRemarks.startsWith('Subject: ')) {
                const newlineIndex = cleanRemarks.indexOf('\n');
                if (newlineIndex > -1) {
                  subjectLine = cleanRemarks.substring(9, newlineIndex).trim();
                } else {
                  subjectLine = cleanRemarks.substring(9).trim();
                }
              } else {
                subjectLine = cleanRemarks.split('\n')[0] || 'Grievance Concern';
              }

              mappedGrievances.push({
                ref: r.requestReferenceNo,
                subject: subjectLine,
                cat: categoryLabel,
                status: statusLabel,
                date: formattedDate
              });
            } else {
              let categoryLabel = 'Financial Data';
              let cleanRemarks = r.remarks || '';
              
              if (r.remarks && r.remarks.startsWith('[Category: ')) {
                const endIndex = r.remarks.indexOf(']');
                if (endIndex > -1) {
                  categoryLabel = r.remarks.substring(11, endIndex);
                  cleanRemarks = r.remarks.substring(endIndex + 1).trim();
                }
              } else {
                const matchedCat = this.dataCategories.find(c => r.remarks && r.remarks.toLowerCase().includes(c.toLowerCase()));
                if (matchedCat) {
                  categoryLabel = matchedCat;
                }
              }

              mappedRequests.push({
                ref: r.requestReferenceNo,
                type: typeLabel,
                cat: categoryLabel,
                date: formattedDate,
                details: cleanRemarks,
                status: statusLabel
              });
            }
          });

          this.requests = mappedRequests;
          this.grievances = mappedGrievances;
        }
      }
    });
  }

  loadConsents() {
    if (!this.profileCode) return;

    this.apiService.search<any>(SP.CONSENT_NOTICE_ACCEPTANCE.fn, { customerId: this.profileCode }).subscribe({
      next: (res) => {
        if (res && res.records) {
          this.consents = res.records.map((r: any) => ({
            id: r.acceptanceId.toString(),
            versionId: r.versionId,
            name: r.noticeName,
            org: r.applicationName ? r.applicationName.trim() : '',
            scope: r.versionNo || 'V1.0',
            active: r.acceptedFlag,
            date: r.acceptanceDate ? new Date(r.acceptanceDate).toLocaleDateString() : ''
          }));
        }
      }
    });
  }

  loadNotifications() {
    this.apiService.search<any>(SP.PRINCIPAL_NOTIFICATION.fn).subscribe({
      next: (res) => {
        if (res && res.records) {
          const channels = this.categoryService.getOptions('Notification Channel');
          this.notifications = res.records.map((r: any) => {
            const channelOpt = channels.find(c => Number(c.code) === Number(r.notificationChannel));
            const channel = channelOpt ? channelOpt.title : 'Notification';
            const formattedDate = r.notificationDate ? new Date(r.notificationDate).toLocaleDateString() : '';
            return {
              text: `Security breach notice ID #${r.notificationId} was dispatched via ${channel} notifying ${r.affectedCount} users.`,
              date: formattedDate
            };
          });
        }
      }
    });
  }

  toggleConsent(id: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const consent = this.consents.find(c => c.id === id);
    if (!consent) return;

    // Update notice acceptance accepted_flag dynamically in the database
    this.apiService.update(SP.CONSENT_NOTICE_ACCEPTANCE.pa, {
      id: Number(consent.id),
      versionId: consent.versionId,
      acceptedFlag: isChecked,
      updatedBy: this.currentUser?.email
    }).subscribe({
      next: (res) => {
        if (res && (res.responseCode === '0' || res.responseCode === '00')) {
          consent.active = isChecked;
          this.toastService.success('Consent Updated', `${consent.name} data processing has been ${isChecked ? 'authorized' : 'withdrawn'}.`);
        } else {
          this.toastService.error('Error', res.description || 'Failed to update consent acceptance.');
          (event.target as HTMLInputElement).checked = !isChecked; // revert checkbox
        }
      },
      error: () => {
        this.toastService.error('Error', 'Communication failure updating consent.');
        (event.target as HTMLInputElement).checked = !isChecked; // revert checkbox
      }
    });
  }

  submitRequest() {
    if (this.requestForm.invalid || !this.currentUser) return;

    const val = this.requestForm.value;
    const typeId = this.getRequestTypeId(this.activeRightsTab);
    const randRef = `DR-${Math.floor(100000 + Math.random() * 900000)}`;

    const body = {
      customerId: this.profileCode,
      requestReferenceNo: randRef,
      requestTypeId: typeId,
      requestDate: new Date().toISOString(),
      currentStatus: 1, // Open status ID
      priority: 2, // Medium priority
      remarks: `[Category: ${val.category}] ` + val.details + (val.correctValue ? ` (Requested new value: ${val.correctValue})` : ''),
      createdBy: this.currentUser.email
    };

    this.apiService.create(SP.DSR_REQUEST.pa, body).subscribe({
      next: (res) => {
        if (res && (res.responseCode === '0' || res.responseCode === '00')) {
          this.toastService.success('Request Submitted', `DSR right request reference: ${randRef} has been filed successfully.`);
          this.requestForm.reset({ category: '', correctValue: '', details: '' });
          this.loadDsrRequests(); // reload requests list dynamically from DB
        } else {
          this.toastService.error('Submission Failed', res.description || 'Failed to file DSR request.');
        }
      },
      error: () => {
        this.toastService.error('Error', 'Network communication error while filing request.');
      }
    });
  }

  submitGrievance() {
    if (this.grievanceForm.invalid || !this.currentUser) return;

    const val = this.grievanceForm.value;
    const randRef = `GR-${Math.floor(100000 + Math.random() * 900000)}`;

    const body = {
      customerId: this.profileCode,
      requestReferenceNo: randRef,
      requestTypeId: 5, // Grievance type ID
      requestDate: new Date().toISOString(),
      currentStatus: 1, // Open
      priority: 3, // High priority
      remarks: `[Category: ${val.category}] Subject: ${val.subject}\nDescription: ${val.description}`,
      createdBy: this.currentUser.email
    };

    this.apiService.create(SP.DSR_REQUEST.pa, body).subscribe({
      next: (res) => {
        if (res && (res.responseCode === '0' || res.responseCode === '00')) {
          this.toastService.success('Grievance Logged', `Grievance reference: ${randRef} has been dispatched to DPO.`);
          this.grievanceForm.reset({ subject: '', category: '', description: '' });
          this.loadDsrRequests(); // reload grievances/requests list dynamically from DB
        } else {
          this.toastService.error('Submission Failed', res.description || 'Failed to record grievance.');
        }
      },
      error: () => {
        this.toastService.error('Error', 'Network communication error while filing grievance.');
      }
    });
  }

  saveProfile() {
    this.toastService.success('Profile Saved', 'Account profile parameters have been updated.');
  }


  // ── Helper Lookup functions ─────────────────────────────────────────────

  private getRequestTypeLabel(typeId: number): string {
    const reqTypes = this.categoryService.getOptions('Request Type');
    const match = reqTypes.find(c => Number(c.code) === Number(typeId));
    return match ? match.title + ' Request' : 'Data Request';
  }

  private getRequestTypeId(tab: string): number {
    switch (tab) {
      case 'Access': return 1;
      case 'Correct':
      case 'Correction': return 2;
      case 'Erase':
      case 'Erasure': return 3;
      case 'Nominate':
      case 'Nomination': return 4;
      case 'Withdraw':
      case 'Consent Withdrawal': return 7;
      default: return 1;
    }
  }

  private getStatusLabel(statusId: number): string {
    const statuses = this.categoryService.getOptions('Current Status');
    const match = statuses.find(c => Number(c.code) === Number(statusId));
    return match ? match.title : 'Pending';
  }

  getActiveConsentsCount(): number {
    return this.consents.filter(c => c.active).length;
  }

  getPendingRequestsCount(): number {
    return this.requests.filter(r => r.status === 'Pending').length;
  }

  getBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'resolved':
      case 'active':
        return 'badge-green';
      case 'pending':
      case 'open':
      case 'in progress':
        return 'badge-amber';
      case 'rejected':
      case 'failed':
      case 'closed':
        return 'badge-red';
      default:
        return 'badge-blue';
    }
  }

}

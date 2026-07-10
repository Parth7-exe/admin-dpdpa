import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { GenericModuleComponent } from './shared/components/generic-module/generic-module.component';
import { ApplicationDetailComponent } from './modules/application-detail/application-detail.component';
import { LoginComponent } from './modules/login/login.component';
import { authGuard } from './core/auth.guard';
import { SP } from './core/config';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // ── Application Registry ────────────────────────────────────
      {
        path: 'applications',
        component: GenericModuleComponent,
        data: {
          title: 'Applications Registry',
          subtitle: 'Catalog and audit company applications subject to DPDP Act regulations.',
          singleName: 'Application',
          primaryKey: 'applicationId',
          sp: SP.APPLICATION_MASTER,
          kpis: [
            { label: 'Total Applications', icon: '📱', color: '#1f8fd4', bgColor: '#e6f4fc', compute: { type: 'total' } },
            { label: 'Active Apps', icon: '✔️', color: '#16a34a', bgColor: '#e7f7ee', compute: { type: 'filter', field: 'isActive', value: true } },
            { label: 'Inactive Apps', icon: '⚠️', color: '#dc2626', bgColor: '#fdeaea', compute: { type: 'filter', field: 'isActive', value: false } }
          ],
          fields: [
            { key: 'applicationCode', label: 'Application Code', type: 'text', required: true },
            { key: 'applicationName', label: 'Application Name', type: 'text', required: true },
            { key: 'applicationShortName', label: 'Short Name', type: 'text' },
            { key: 'applicationDescription', label: 'Description', type: 'textarea' },
            { key: 'applicationType', label: 'Application Type', type: 'select', optionsFromCategory: 'Application Type' },
            { key: 'businessFunction', label: 'Business Function', type: 'text' },
            { key: 'department', label: 'Department', type: 'text' },
            { key: 'goLiveDate', label: 'Go-Live Date', type: 'date' },
            { key: 'retirementDate', label: 'Retirement Date', type: 'date' },
            { key: 'applicationStatus', label: 'Status', type: 'select', optionsFromCategory: 'Application Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'applications/:id',
        component: ApplicationDetailComponent
      },
      {
        path: 'app-environments',
        component: GenericModuleComponent,
        data: {
          title: 'Application Environments',
          subtitle: 'Hosting environments (Dev, QA, UAT, Prod) mapping per application.',
          singleName: 'Environment',
          primaryKey: 'environmentId',
          sp: SP.APPLICATION_ENVIRONMENT,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'environmentName', label: 'Environment Name', type: 'text', required: true },
            { key: 'url', label: 'Access URL', type: 'text' },
            { key: 'environmentStatus', label: 'Status', type: 'select', optionsFromCategory: 'Environment Type' },
            { key: 'hostingLocation', label: 'Hosting Location / Region', type: 'text' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'app-infrastructure',
        component: GenericModuleComponent,
        data: {
          title: 'Infrastructure Inventory',
          subtitle: 'Compute resources, cloud platforms, and load balancers mapping.',
          singleName: 'Infrastructure',
          primaryKey: 'infraId',
          sp: SP.APPLICATION_INFRASTRUCTURE,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'hostingType', label: 'Hosting Type', type: 'select', optionsFromCategory: 'Hosting Type' },
            { key: 'cloudProvider', label: 'Cloud Provider', type: 'select', optionsFromCategory: 'Cloud Provider' },
            { key: 'serverCount', label: 'Server Count', type: 'number' },
            { key: 'loadBalancerCount', label: 'Load Balancer Count', type: 'number' },
            { key: 'containerPlatform', label: 'Container Platform', type: 'select', optionsFromCategory: 'Container Platform' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'app-owners',
        component: GenericModuleComponent,
        data: {
          title: 'Application Owners',
          subtitle: 'Point of contacts, fiduciaries, and DPOs linked to system assets.',
          singleName: 'Owner Link',
          primaryKey: 'ownerId',
          sp: SP.APPLICATION_OWNER,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'ownerType', label: 'Owner Type / Department', type: 'text' },
            { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
            { key: 'emailId', label: 'Email Address', type: 'text', required: true },
            { key: 'mobileNo', label: 'Mobile Number', type: 'text' },
            { key: 'designation', label: 'Designation', type: 'select', optionsFromCategory: 'Designation' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'app-vendors',
        component: GenericModuleComponent,
        data: {
          title: 'Third-Party Vendors',
          subtitle: 'External data processors, software providers, and contact details.',
          singleName: 'Vendor Contract',
          primaryKey: 'vendorId',
          sp: SP.APPLICATION_VENDOR,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
            { key: 'supportEmail', label: 'Support Email', type: 'text' },
            { key: 'supportContact', label: 'Support Contact Phone', type: 'text' },
            { key: 'contractExpiryDate', label: 'Contract Expiration Date', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'app-apis',
        component: GenericModuleComponent,
        data: {
          title: 'API Catalog',
          subtitle: 'APIs exposed by applications carrying personal or sensitive information.',
          singleName: 'API Endpoint',
          primaryKey: 'apiId',
          sp: SP.APPLICATION_API_INVENTORY,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'apiName', label: 'API Name / Action', type: 'text', required: true },
            { key: 'apiUrl', label: 'Endpoint Path', type: 'text' },
            { key: 'apiMethod', label: 'HTTP Method (GET, POST etc)', type: 'text' },
            { key: 'authenticationType', label: 'Auth Scheme', type: 'select', optionsFromCategory: 'Authentication Type' },
            { key: 'apiStatus', label: 'API Health Status', type: 'select', optionsFromCategory: 'API Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'app-interfaces',
        component: GenericModuleComponent,
        data: {
          title: 'Interface Connections',
          subtitle: 'Data flow integrations between systems (Source to Target mappings).',
          singleName: 'System Interface',
          primaryKey: 'interfaceId',
          sp: SP.APPLICATION_INTERFACE_INV,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'sourceSystem', label: 'Source System Name', type: 'text' },
            { key: 'targetSystem', label: 'Target System Name', type: 'text' },
            { key: 'interfaceType', label: 'Interface Architecture', type: 'select', optionsFromCategory: 'Interface Type' },
            { key: 'protocol', label: 'Data Protocol', type: 'select', optionsFromCategory: 'Protocol' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'app-risks',
        component: GenericModuleComponent,
        data: {
          title: 'Risk Profile Register',
          subtitle: 'Risk assessment ratings and scores for personal data storage.',
          singleName: 'Risk Profile',
          primaryKey: 'riskProfileId',
          sp: SP.APPLICATION_RISK_PROFILE,
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
        }
      },
      {
        path: 'app-compliance',
        component: GenericModuleComponent,
        data: {
          title: 'Compliance framework Scope',
          subtitle: 'Audited compliance scopes applicable per application asset.',
          singleName: 'Scope Mapping',
          primaryKey: 'scopeId',
          sp: SP.APPLICATION_COMPLIANCE_SCOPE,
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'frameworkName', label: 'Compliance Standard', type: 'select', optionsFromCategory: 'Compliance Framework' },
            { key: 'applicableFlag', label: 'Is Applicable', type: 'checkbox' },
            { key: 'remarks', label: 'Scope Remarks', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Data Discovery ──────────────────────────────────────────
      {
        path: 'databases',
        component: GenericModuleComponent,
        data: {
          title: 'Data Sources Catalog',
          subtitle: 'Configure database servers and structures scanning for sensitive data.',
          singleName: 'Database Master',
          primaryKey: 'databaseId',
          sp: SP.DATABASE_MASTER,
          kpis: [
            { label: 'Total Data Sources', icon: '🗄️', color: '#1f8fd4', bgColor: '#e6f4fc', compute: { type: 'total' } },
            { label: 'Active Catalogs', icon: '✔️', color: '#16a34a', bgColor: '#e7f7ee', compute: { type: 'filter', field: 'isActive', value: true } },
            { label: 'Inactive Catalogs', icon: '⚠️', color: '#dc2626', bgColor: '#fdeaea', compute: { type: 'filter', field: 'isActive', value: false } }
          ],
          fields: [
            { key: 'databaseCode', label: 'Database Code', type: 'text', required: true },
            { key: 'databaseName', label: 'Database Name', type: 'text', required: true },
            { key: 'databaseDescription', label: 'Description', type: 'textarea' },
            { key: 'databaseType', label: 'Database Engine', type: 'select', optionsFromCategory: 'Database Type' },
            { key: 'databaseVersion', label: 'Version', type: 'text' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'db-environments',
        component: GenericModuleComponent,
        data: {
          title: 'Database Environments',
          subtitle: 'Network environment details and server details for data source items.',
          singleName: 'Database Environment',
          primaryKey: 'environmentId',
          sp: SP.DATABASE_ENVIRONMENT,
          fields: [
            { key: 'databaseId', label: 'Database ID', type: 'number', required: true },
            { key: 'environmentType', label: 'Environment Type', type: 'select', optionsFromCategory: 'Environment Type' },
            { key: 'serverName', label: 'Server Hostname', type: 'text' },
            { key: 'serverIp', label: 'IP Address', type: 'text' },
            { key: 'portNumber', label: 'Port', type: 'number' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'db-vendors',
        component: GenericModuleComponent,
        data: {
          title: 'Database Vendor Support',
          subtitle: 'Support contracts and service contacts for database installations.',
          singleName: 'Database Vendor',
          primaryKey: 'vendorId',
          sp: SP.DATABASE_VENDOR,
          fields: [
            { key: 'databaseId', label: 'Database ID', type: 'number', required: true },
            { key: 'vendorName', label: 'Vendor Partner Name', type: 'text', required: true },
            { key: 'supportEmail', label: 'Support Email', type: 'text' },
            { key: 'supportContact', label: 'Contact Phone', type: 'text' },
            { key: 'contractExpiryDate', label: 'Support Expiry', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'db-ownership',
        component: GenericModuleComponent,
        data: {
          title: 'Database Stakeholders',
          subtitle: 'Database owners, administrators, and custodians registration.',
          singleName: 'Database Owner',
          primaryKey: 'ownershipId',
          sp: SP.DATABASE_OWNERSHIP,
          fields: [
            { key: 'databaseId', label: 'Database ID', type: 'number', required: true },
            { key: 'ownerName', label: 'Owner Name', type: 'text', required: true },
            { key: 'ownerType', label: 'Owner Role (Admin, Custodian)', type: 'text' },
            { key: 'emailId', label: 'Email', type: 'text' },
            { key: 'contactNumber', label: 'Phone', type: 'text' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'data-inventory',
        component: GenericModuleComponent,
        data: {
          title: 'Data Inventory Catalog',
          subtitle: 'Discovered tables containing personal identifiers across organization databases.',
          singleName: 'Inventory Record',
          primaryKey: 'inventoryId',
          sp: SP.DATA_INVENTORY_MASTER,
          fields: [
            { key: 'databaseId', label: 'Database ID', type: 'number', required: true },
            { key: 'schemaName', label: 'Database Schema Name', type: 'text', required: true },
            { key: 'tableName', label: 'Table / View Name', type: 'text', required: true },
            { key: 'tableDescription', label: 'Table Contents Description', type: 'textarea' },
            { key: 'recordCount', label: 'Total Records Count', type: 'number' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'column-inventory',
        component: GenericModuleComponent,
        data: {
          title: 'Column-Level PII Catalog',
          subtitle: 'Audit column metadata containing personal identifiers and classifications.',
          singleName: 'Column Record',
          primaryKey: 'columnId',
          sp: SP.COLUMN_INVENTORY,
          fields: [
            { key: 'tableId', label: 'Table ID Reference', type: 'number', required: true },
            { key: 'columnName', label: 'Column Name', type: 'text', required: true },
            { key: 'dataType', label: 'SQL Data Type', type: 'text' },
            { key: 'dataLength', label: 'Maximum Length', type: 'number' },
            { key: 'nullable', label: 'Nullable Column', type: 'checkbox' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Consent Management ──────────────────────────────────────
      {
        path: 'consent-notices',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Notices',
          subtitle: 'Define personal data collections, storage purposes, and principal options notices.',
          singleName: 'Notice',
          primaryKey: 'noticeId',
          sp: SP.CONSENT_NOTICE,
          kpis: [
            { label: 'Total Notices', icon: '📜', color: '#1f8fd4', bgColor: '#e6f4fc', compute: { type: 'total' } },
            { label: 'Active Notices', icon: '✔️', color: '#16a34a', bgColor: '#e7f7ee', compute: { type: 'filter', field: 'isActive', value: true } },
            { label: 'Inactive Notices', icon: '⚠️', color: '#dc2626', bgColor: '#fdeaea', compute: { type: 'filter', field: 'isActive', value: false } }
          ],
          fields: [
            { key: 'applicationId', label: 'Application ID', type: 'number', required: true },
            { key: 'noticeCode', label: 'Notice Reference Code', type: 'text', required: true },
            { key: 'noticeName', label: 'Notice Display Name', type: 'text', required: true },
            { key: 'noticeType', label: 'Notice Type', type: 'select', optionsFromCategory: 'Notice Type' },
            { key: 'noticeStatus', label: 'Approval Status', type: 'select', optionsFromCategory: 'Notice Status' },
            { key: 'ownerName', label: 'Content Owner Name', type: 'text' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'consent-versions',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Notice Versions',
          subtitle: 'Audit legal versions history, effective parameters, and lifecycle limits.',
          singleName: 'Version Record',
          primaryKey: 'versionId',
          sp: SP.CONSENT_NOTICE_VERSION,
          fields: [
            { key: 'noticeId', label: 'Consent Notice ID', type: 'number', required: true },
            { key: 'versionNo', label: 'Version Number (e.g. 1.0)', type: 'text', required: true },
            { key: 'effectiveDate', label: 'Start Effective Date', type: 'date' },
            { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'consent-publications',
        component: GenericModuleComponent,
        data: {
          title: 'Notice Publications Log',
          subtitle: 'Publication actions mapping versions to channels (Website, App, SMS, Mail).',
          singleName: 'Publication Entry',
          primaryKey: 'publicationId',
          sp: SP.CONSENT_NOTICE_PUBLICATION,
          fields: [
            { key: 'versionId', label: 'Version ID Reference', type: 'number', required: true },
            { key: 'publicationChannel', label: 'Channel Option', type: 'select', optionsFromCategory: 'Publication Channel' },
            { key: 'publicationDate', label: 'Published On', type: 'date' },
            { key: 'publishedBy', label: 'Publisher Admin Name', type: 'text' },
            { key: 'publicationStatus', label: 'Status', type: 'select', optionsFromCategory: 'Publication Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'consent-artifacts',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Artifacts Log',
          subtitle: 'Data principal agreements, collection IPs, and expiry records catalog.',
          singleName: 'Consent Agreement',
          primaryKey: 'consentId',
          sp: SP.CONSENT_ARTIFACT,
          fields: [
            { key: 'consentReferenceNo', label: 'Receipt/Reference No', type: 'text', required: true },
            { key: 'dataPrincipalId', label: 'Data Principal ID', type: 'number', required: true },
            { key: 'noticeId', label: 'Notice ID Reference', type: 'number', required: true },
            { key: 'channelId', label: 'Consent Channel', type: 'select', optionsFromCategory: 'Consent Channel' },
            { key: 'dataFiduciaryId', label: 'Fiduciary Holder', type: 'select', optionsFromCategory: 'Data Fiduciary' },
            { key: 'consentStatus', label: 'State (Given, Expired, Withdrawn)', type: 'text' },
            { key: 'consentGivenAt', label: 'Consent Date', type: 'date' },
            { key: 'consentExpiryAt', label: 'Expiration Limit', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'consent-history',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Audits Timeline',
          subtitle: 'Lifecycle updates showing state changes, principal requests, and remarks.',
          singleName: 'Audit Entry',
          primaryKey: 'historyId',
          sp: SP.CONSENT_HISTORY,
          fields: [
            { key: 'consentId', label: 'Consent ID', type: 'number', required: true },
            { key: 'eventType', label: 'Event Name (Given, Revoked)', type: 'text' },
            { key: 'eventStatus', label: 'Status Code', type: 'text' },
            { key: 'eventAt', label: 'Event Date & Time', type: 'date' },
            { key: 'performedBy', label: 'Actor Name', type: 'text' },
            { key: 'previousValue', label: 'Old State Value', type: 'textarea' },
            { key: 'newValue', label: 'New State Value', type: 'textarea' },
            { key: 'remarks', label: 'Audit Remarks', type: 'textarea' }
          ]
        }
      },
      {
        path: 'consent-withdrawals',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Withdrawals Log',
          subtitle: 'Log and track principal requests withdrawing notice consent permissions.',
          singleName: 'Withdrawal Request',
          primaryKey: 'withdrawalId',
          sp: SP.CONSENT_WITHDRAWAL,
          fields: [
            { key: 'consentId', label: 'Consent ID Reference', type: 'number', required: true },
            { key: 'withdrawalReason', label: 'Reason for Withdrawal', type: 'textarea' },
            { key: 'requestedDate', label: 'Received On', type: 'date' },
            { key: 'processedDate', label: 'Completed On', type: 'date' },
            { key: 'processedBy', label: 'Remediator Admin', type: 'text' },
            { key: 'withdrawalStatus', label: 'Status', type: 'select', optionsFromCategory: 'Withdrawal Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'consent-purposes',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Purposes Master',
          subtitle: 'Approved list of purposes mapping why personal information is collected.',
          singleName: 'Purpose Option',
          primaryKey: 'purposeId',
          sp: SP.CONSENT_PURPOSE,
          fields: [
            { key: 'purposeCode', label: 'Purpose Code', type: 'text', required: true },
            { key: 'purposeName', label: 'Purpose Title', type: 'text', required: true },
            { key: 'purposeDescription', label: 'Purpose Detailed Description', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'consent-channels',
        component: GenericModuleComponent,
        data: {
          title: 'Consent Channels Registry',
          subtitle: 'Fiduciary consent ingestion formats (SMS, Web Interface, Call Center).',
          singleName: 'Consent Channel',
          primaryKey: 'channelId',
          sp: SP.CONSENT_CHANNEL,
          fields: [
            { key: 'channelCode', label: 'Channel Code', type: 'text', required: true },
            { key: 'channelName', label: 'Channel Display Name', type: 'text', required: true },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Breach Register ─────────────────────────────────────────
      {
        path: 'breaches',
        component: GenericModuleComponent,
        data: {
          title: 'Data Breach Register',
          subtitle: 'Security breach occurrences ledger reporting affected counts and severity details.',
          singleName: 'Breach Entry',
          primaryKey: 'breachId',
          sp: SP.BREACH_REGISTER,
          fields: [
            { key: 'breachReferenceNo', label: 'Incident ID / Ref No', type: 'text', required: true },
            { key: 'breachName', label: 'Incident Summary Title', type: 'text', required: true },
            { key: 'breachDescription', label: 'Incident Details', type: 'textarea' },
            { key: 'detectedDate', label: 'Detected On', type: 'date' },
            { key: 'reportedDate', label: 'Reported To Board On', type: 'date' },
            { key: 'breachStatus', label: 'Status (Investigating, Resolved)', type: 'select', optionsFromCategory: 'Breach Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'breach-investigations',
        component: GenericModuleComponent,
        data: {
          title: 'Breach Investigations Log',
          subtitle: 'Investigation findings, root causes audits, and timeline log.',
          singleName: 'Investigation',
          primaryKey: 'investigationId',
          sp: SP.BREACH_INVESTIGATION,
          fields: [
            { key: 'breachId', label: 'Breach ID', type: 'number', required: true },
            { key: 'investigatorName', label: 'Investigating Officer Name', type: 'text', required: true },
            { key: 'investigationStartDate', label: 'Investigation Started', type: 'date' },
            { key: 'investigationEndDate', label: 'Investigation Concluded', type: 'date' },
            { key: 'findings', label: 'Formal Findings Report', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'breach-impacts',
        component: GenericModuleComponent,
        data: {
          title: 'Breach Impact Assessments',
          subtitle: 'Fiduciary assessments rating principal counts and reputational risks.',
          singleName: 'Impact Assessment',
          primaryKey: 'assessmentId',
          sp: SP.BREACH_IMPACT_ASSESSMENT,
          fields: [
            { key: 'breachId', label: 'Breach ID', type: 'number', required: true },
            { key: 'affectedRecords', label: 'Affected Records Count', type: 'number' },
            { key: 'affectedDataPrincipals', label: 'Affected Principals Count', type: 'number' },
            { key: 'financialImpact', label: 'Estimated Loss ($)', type: 'number' },
            { key: 'reputationalImpact', label: 'Reputation Impact Level', type: 'select', optionsFromCategory: 'Impact Rating' },
            { key: 'operationalImpact', label: 'Operational Interruption Level', type: 'select', optionsFromCategory: 'Impact Rating' },
            { key: 'riskRating', label: 'Final Risk Score Rating', type: 'select', optionsFromCategory: 'Risk Rating' },
            { key: 'assessedBy', label: 'Risk Assessor Name', type: 'text' },
            { key: 'assessmentDate', label: 'Assessment Completed', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'breach-containments',
        component: GenericModuleComponent,
        data: {
          title: 'Containment Actions Log',
          subtitle: 'Urgent containment actions carried out during an active incident.',
          singleName: 'Containment Action',
          primaryKey: 'actionId',
          sp: SP.BREACH_CONTAINMENT,
          fields: [
            { key: 'breachId', label: 'Breach ID Reference', type: 'number', required: true },
            { key: 'actionDescription', label: 'Action Taken details', type: 'textarea', required: true },
            { key: 'actionOwner', label: 'Action Executor Name', type: 'text' },
            { key: 'actionDate', label: 'Executed On', type: 'date' },
            { key: 'actionStatus', label: 'Fulfillment State', type: 'select', optionsFromCategory: 'Action Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'breach-correctives',
        component: GenericModuleComponent,
        data: {
          title: 'Corrective Remediation Plan',
          subtitle: 'Audit actions designed to prevent identical system failures.',
          singleName: 'Corrective Action',
          primaryKey: 'correctiveActionId',
          sp: SP.BREACH_CORRECTIVE,
          fields: [
            { key: 'breachId', label: 'Breach ID', type: 'number', required: true },
            { key: 'actionDescription', label: 'Remediation Steps Plan', type: 'textarea', required: true },
            { key: 'assignedTo', label: 'Owner Team / Person', type: 'text' },
            { key: 'targetDate', label: 'Target Completion Date', type: 'date' },
            { key: 'completionDate', label: 'Fulfillment Date', type: 'date' },
            { key: 'actionStatus', label: 'Status', type: 'select', optionsFromCategory: 'Action Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'breach-root-causes',
        component: GenericModuleComponent,
        data: {
          title: 'Root Cause Analyses (RCA)',
          subtitle: 'Technical root causes analyses mappings for database incidents.',
          singleName: 'Root Cause Details',
          primaryKey: 'rootCauseId',
          sp: SP.BREACH_ROOT_CAUSE,
          fields: [
            { key: 'breachId', label: 'Breach ID Reference', type: 'number', required: true },
            { key: 'rootCause', label: 'RCA Detailed Findings', type: 'textarea', required: true },
            { key: 'identifiedBy', label: 'Systems Analyst', type: 'text' },
            { key: 'identifiedDate', label: 'Analysis Date', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Data Principal (DSR) ────────────────────────────────────
      {
        path: 'principals',
        component: GenericModuleComponent,
        data: {
          title: 'Data Principals Master',
          subtitle: 'Customer and employee data subject entities mapped in fiduciaries system.',
          singleName: 'Data Principal',
          primaryKey: 'principalId',
          sp: SP.DATA_PRINCIPAL,
          fields: [
            { key: 'principalCode', label: 'Principal Reference ID', type: 'text', required: true },
            { key: 'principalName', label: 'Principal Full Name', type: 'text', required: true },
            { key: 'emailId', label: 'Registered Email', type: 'text' },
            { key: 'mobileNo', label: 'Registered Mobile', type: 'text' },
            { key: 'principalType', label: 'Classification Category', type: 'select', optionsFromCategory: 'Principal Type' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'dsr-requests',
        component: GenericModuleComponent,
        data: {
          title: 'DSR Requests (Right to Access/Erasure)',
          subtitle: 'Track rights requests submitted by principals (Withdrawal, Erasure, Grievance).',
          singleName: 'DSR Request',
          primaryKey: 'requestId',
          sp: SP.DSR_REQUEST,
          kpis: [
            { label: 'Total Requests', icon: '📥', color: '#1f8fd4', bgColor: '#e6f4fc', compute: { type: 'total' } },
            { label: 'Active Requests', icon: '✔️', color: '#16a34a', bgColor: '#e7f7ee', compute: { type: 'filter', field: 'isActive', value: true } },
            { label: 'Inactive Requests', icon: '⚠️', color: '#dc2626', bgColor: '#fdeaea', compute: { type: 'filter', field: 'isActive', value: false } }
          ],
          fields: [
            { key: 'requestReferenceNo', label: 'Case ID / Reference', type: 'text', required: true },
            { key: 'dataPrincipalId', label: 'Data Principal ID', type: 'number', required: true },
            { key: 'requestType', label: 'Request Right Type', type: 'select', optionsFromCategory: 'Request Type' },
            { key: 'receivedDate', label: 'Received On', type: 'date' },
            { key: 'dueDate', label: 'SLA Limit Date', type: 'date' },
            { key: 'requestStatus', label: 'Fulfillment Status', type: 'select', optionsFromCategory: 'Request Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'dsr-fulfillments',
        component: GenericModuleComponent,
        data: {
          title: 'Requests Fulfillment Log',
          subtitle: 'Audit actions and responses compiled to satisfy data principal rights cases.',
          singleName: 'Fulfillment Entry',
          primaryKey: 'fulfillmentId',
          sp: SP.REQUEST_FULFILLMENT,
          fields: [
            { key: 'requestId', label: 'DSR Case ID', type: 'number', required: true },
            { key: 'fulfilledDate', label: 'Resolution Date', type: 'date' },
            { key: 'fulfilledBy', label: 'Fulfillment Agent Name', type: 'text' },
            { key: 'actionTaken', label: 'Action Taken Steps', type: 'textarea' },
            { key: 'remarks', label: 'Fulfillment Remarks', type: 'textarea' }
          ]
        }
      },
      {
        path: 'dsr-notifications',
        component: GenericModuleComponent,
        data: {
          title: 'Principal Notifications History',
          subtitle: 'Dispatched notification records informing principals of rights fulfillment actions.',
          singleName: 'Notification Log',
          primaryKey: 'notificationId',
          sp: SP.PRINCIPAL_NOTIFICATION,
          fields: [
            { key: 'dataPrincipalId', label: 'Data Principal ID', type: 'number', required: true },
            { key: 'notificationType', label: 'Channel Type', type: 'select', optionsFromCategory: 'Notification Type' },
            { key: 'message', label: 'Sent Message Text', type: 'textarea', required: true },
            { key: 'sentDate', label: 'Sent On Date', type: 'date' }
          ]
        }
      },

      // ── ROPA ─────────────────────────────────────────────────────
      {
        path: 'ropa-processes',
        component: GenericModuleComponent,
        data: {
          title: 'ROPA Processing Activities',
          subtitle: 'Record of Processing Activities (ROPA) log detailing departments and legal basis.',
          singleName: 'Process Activity',
          primaryKey: 'processId',
          sp: SP.ROPA_PROCESS,
          fields: [
            { key: 'processCode', label: 'Process Code', type: 'text', required: true },
            { key: 'processName', label: 'Process Activity Name', type: 'text', required: true },
            { key: 'processDescription', label: 'Description', type: 'textarea' },
            { key: 'department', label: 'Owner Department', type: 'text' },
            { key: 'legalBasis', label: 'DPDP Act Legal basis', type: 'select', optionsFromCategory: 'Legal Basis' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'ropa-categories',
        component: GenericModuleComponent,
        data: {
          title: 'Data Categories Master',
          subtitle: 'Audit categories definitions catalog (Financial, Identity, Biometric, Healthcare).',
          singleName: 'Data Category',
          primaryKey: 'categoryId',
          sp: SP.ROPA_DATA_CATEGORY,
          fields: [
            { key: 'categoryCode', label: 'Category Code', type: 'text', required: true },
            { key: 'categoryName', label: 'Category Title Name', type: 'text', required: true },
            { key: 'categoryDescription', label: 'Description', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'ropa-subjects',
        component: GenericModuleComponent,
        data: {
          title: 'Data Subjects Master',
          subtitle: 'Classes of principals whose data is processed (Employees, Shareholders, Users).',
          singleName: 'Data Subject Class',
          primaryKey: 'subjectId',
          sp: SP.ROPA_DATA_SUBJECT,
          fields: [
            { key: 'subjectCode', label: 'Subject Code', type: 'text', required: true },
            { key: 'subjectName', label: 'Subject Class Name', type: 'text', required: true },
            { key: 'subjectDescription', label: 'Subject Details', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'ropa-legal-basis',
        component: GenericModuleComponent,
        data: {
          title: 'Legal Basis Reference',
          subtitle: 'Approved statutory legal justifications categories mapping under DPDP Act.',
          singleName: 'Legal Basis',
          primaryKey: 'basisId',
          sp: SP.ROPA_LEGAL_BASIS,
          fields: [
            { key: 'basisCode', label: 'Legal Basis Code', type: 'text', required: true },
            { key: 'basisName', label: 'Statutory basis Title', type: 'text', required: true },
            { key: 'basisDescription', label: 'Statute Description text', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Fiduciary ────────────────────────────────────────────────
      {
        path: 'fiduciaries',
        component: GenericModuleComponent,
        data: {
          title: 'Data Fiduciaries Register',
          subtitle: 'Company legal entities acting as fiduciaries managing personal data catalogs.',
          singleName: 'Data Fiduciary',
          primaryKey: 'fiduciaryId',
          sp: SP.FIDUCIARY,
          kpis: [
            { label: 'Total Fiduciaries', icon: '🏢', color: '#1f8fd4', bgColor: '#e6f4fc', compute: { type: 'total' } },
            { label: 'Active Fiduciaries', icon: '✔️', color: '#16a34a', bgColor: '#e7f7ee', compute: { type: 'filter', field: 'isActive', value: true } },
            { label: 'Inactive Fiduciaries', icon: '⚠️', color: '#dc2626', bgColor: '#fdeaea', compute: { type: 'filter', field: 'isActive', value: false } }
          ],
          fields: [
            { key: 'fiduciaryCode', label: 'Fiduciary Code', type: 'text', required: true },
            { key: 'fiduciaryName', label: 'Entity Legal Name', type: 'text', required: true },
            { key: 'fiduciaryType', label: 'Entity classification type', type: 'select', optionsFromCategory: 'Fiduciary Type' },
            { key: 'industry', label: 'Vertical / Industry Name', type: 'text' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'dpos',
        component: GenericModuleComponent,
        data: {
          title: 'DPO Registry Office',
          subtitle: 'Assigned Data Protection Officers (DPO) and contact details.',
          singleName: 'DPO Officer',
          primaryKey: 'dpoId',
          sp: SP.FIDUCIARY_DPO,
          fields: [
            { key: 'fiduciaryId', label: 'Fiduciary ID', type: 'number', required: true },
            { key: 'dpoName', label: 'Officer Name', type: 'text', required: true },
            { key: 'emailId', label: 'Registered Email', type: 'text', required: true },
            { key: 'contactNo', label: 'Phone', type: 'text' },
            { key: 'appointmentDate', label: 'Effective Appointment Date', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'grievance-officers',
        component: GenericModuleComponent,
        data: {
          title: 'Grievance Officers Registry',
          subtitle: 'Assigned grievance resolution officers details mapping fiduciaries.',
          singleName: 'Grievance Officer',
          primaryKey: 'officerId',
          sp: SP.FIDUCIARY_GRIEVANCE,
          fields: [
            { key: 'fiduciaryId', label: 'Fiduciary ID', type: 'number', required: true },
            { key: 'officerName', label: 'Officer Name', type: 'text', required: true },
            { key: 'emailId', label: 'Email', type: 'text', required: true },
            { key: 'contactNo', label: 'Phone', type: 'text' },
            { key: 'officeAddress', label: 'Mailing Address details', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'fiduciary-products',
        component: GenericModuleComponent,
        data: {
          title: 'Products and Platforms catalog',
          subtitle: 'Company customer-facing digital applications registry.',
          singleName: 'Digital Product',
          primaryKey: 'productId',
          sp: SP.FIDUCIARY_PRODUCT,
          fields: [
            { key: 'fiduciaryId', label: 'Fiduciary ID Reference', type: 'number', required: true },
            { key: 'productCode', label: 'Product Code', type: 'text', required: true },
            { key: 'productName', label: 'Product Name', type: 'text', required: true },
            { key: 'productDescription', label: 'Product Description', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Gap Analysis ─────────────────────────────────────────────
      {
        path: 'gaps',
        component: GenericModuleComponent,
        data: {
          title: 'GAP Register Findings',
          subtitle: 'Remediation log tracking DPDPA compliance deficits and vulnerabilities.',
          singleName: 'GAP Audit Entry',
          primaryKey: 'gapId',
          sp: SP.GAP_REGISTER,
          fields: [
            { key: 'gapCode', label: 'GAP Reference Code', type: 'text', required: true },
            { key: 'gapTitle', label: 'Findings Summary', type: 'text', required: true },
            { key: 'gapDescription', label: 'Detailed Vulnerability Deficit', type: 'textarea' },
            { key: 'severity', label: 'Deficit Severity Level', type: 'select', optionsFromCategory: 'Severity' },
            { key: 'remediationPlan', label: 'Corrective Action Plan details', type: 'textarea' },
            { key: 'remediationStatus', label: 'Fulfillment Status', type: 'select', optionsFromCategory: 'Remediation Status' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'gap-scorecards',
        component: GenericModuleComponent,
        data: {
          title: 'GAP scorecards History',
          subtitle: 'Historical scoring audits assessing organization-wide DPDPA compliance scores.',
          singleName: 'Scorecard audit',
          primaryKey: 'scorecardId',
          sp: SP.GAP_SCORECARD,
          fields: [
            { key: 'scorecardPeriod', label: 'Evaluation Period (e.g. Q1 2026)', type: 'text', required: true },
            { key: 'score', label: 'Audit Score (0 - 100)', type: 'number', required: true },
            { key: 'evaluatorName', label: 'Evaluator name', type: 'text' },
            { key: 'evaluationDate', label: 'Evaluation date', type: 'date' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },

      // ── Masters / Lookups ────────────────────────────────────────
      {
        path: 'master-categories',
        component: GenericModuleComponent,
        data: {
          title: 'Lookup Categories Master',
          subtitle: 'Define lookup classes catalog (e.g. Fiduciary Type, Notice Status).',
          singleName: 'Lookup Class',
          primaryKey: 'id',
          sp: SP.CATEGORY_MASTER,
          fields: [
            { key: 'description', label: 'Lookup class Description', type: 'text', required: true },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'master-category-details',
        component: GenericModuleComponent,
        data: {
          title: 'Lookup Options Catalog',
          subtitle: 'Lookup codes and titles mapped within lookup categories classes.',
          singleName: 'Lookup Option',
          primaryKey: 'id',
          sp: SP.CATEGORY_DETAIL,
          fields: [
            { key: 'categoryId', label: 'Category ID Reference', type: 'number', required: true },
            { key: 'title', label: 'Option Display Name', type: 'text', required: true },
            { key: 'code', label: 'Option Code Value', type: 'number', required: true },
            { key: 'description', label: 'Option Description details', type: 'text' },
            { key: 'iconUrl', label: 'Icon URI', type: 'text' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      },
      {
        path: 'master-classifications',
        component: GenericModuleComponent,
        data: {
          title: 'Data Classification Master',
          subtitle: 'Compliance levels definitions registry (e.g. Public, Sensitive PII).',
          singleName: 'Classification Level',
          primaryKey: 'classificationId',
          sp: SP.DATA_CLASSIFICATION,
          fields: [
            { key: 'classificationCode', label: 'Classification Code', type: 'text', required: true },
            { key: 'classificationName', label: 'Classification Display Title', type: 'text', required: true },
            { key: 'description', label: 'Justification / Guidelines', type: 'textarea' },
            { key: 'isActive', label: 'Active Status', type: 'checkbox' }
          ]
        }
      }
    ]
  }
];

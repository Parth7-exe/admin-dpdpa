/**
 * SP Name Registry
 * Every stored procedure name is defined here.
 * No module contains hardcoded SP names.
 */
export const SP = {
  // ── Application Registry ────────────────────────────────────
  APPLICATION_MASTER:           { fn: 'dpdpa_fn_application_master_mgmt',           pa: 'dpdpa_pa_application_master_mgmt' },
  APPLICATION_ENVIRONMENT:      { fn: 'dpdpa_fn_application_environment_mgmt',      pa: 'dpdpa_pa_application_environment_mgmt' },
  APPLICATION_INFRASTRUCTURE:   { fn: 'dpdpa_fn_application_infrastructure_mgmt',   pa: 'dpdpa_pa_application_infrastructure_mgmt' },
  APPLICATION_OWNER:            { fn: 'dpdpa_fn_application_owner_mgmt',            pa: 'dpdpa_pa_application_owner_mgmt' },
  APPLICATION_VENDOR:           { fn: 'dpdpa_fn_application_vendor_mgmt',           pa: 'dpdpa_pa_application_vendor_mgmt' },
  APPLICATION_API_INVENTORY:    { fn: 'dpdpa_fn_application_api_inventory_mgmt',    pa: 'dpdpa_pa_application_api_inventory_mgmt' },
  APPLICATION_INTERFACE_INV:    { fn: 'dpdpa_fn_application_interface_inventory_mgmt', pa: 'dpdpa_pa_application_interface_inventory_mgmt' },
  APPLICATION_RISK_PROFILE:     { fn: 'dpdpa_fn_application_risk_profile_mgmt',     pa: 'dpdpa_pa_application_risk_profile_mgmt' },
  APPLICATION_RISK_DETAIL:      { fn: 'dpdpa_fn_application_risk_profile_detail_mgmt', pa: 'dpdpa_pa_application_risk_profile_detail_mgmt' },
  APPLICATION_COMPLIANCE_SCOPE: { fn: 'dpdpa_fn_application_compliance_scope_mgmt', pa: 'dpdpa_pa_application_compliance_scope_mgmt' },
  APPLICATION_DATA_SCOPE:       { fn: 'dpdpa_fn_application_data_scope_mgmt',       pa: 'dpdpa_pa_application_data_scope_mgmt' },
  APPLICATION_DOCUMENT:         { fn: 'dpdpa_fn_application_document_repository_mgmt', pa: 'dpdpa_pa_application_document_repository_mgmt' },
  APPLICATION_DB_MAPPING:       { fn: 'dpdpa_fn_application_database_mapping_mgmt', pa: 'dpdpa_pa_application_database_mapping_mgmt' },
  APPLICATION_COOKIES:          { fn: 'dpdpa_fn_cookies_mgmt',                      pa: 'dpdpa_pa_cookies_mgmt' },
  COOKIE_CATEGORIES:            { fn: 'dpdpa_fn_cookie_categories_mgmt',            pa: 'dpdpa_pa_cookie_categories_mgmt' },
  COOKIE_CONSENT:               { fn: 'dpdpa_fn_cookie_consents_mgmt',              pa: 'dpdpa_pa_cookie_consents_mgmt' },
  COOKIE_NOTICE_CONFIG:         { fn: 'dpdpa_fn_cookie_notice_config_mgmt',         pa: 'dpdpa_pa_cookie_notice_config_mgmt' },

  // ── Data Discovery ──────────────────────────────────────────
  DATABASE_MASTER:              { fn: 'dpdpa_fn_database_master_mgmt',              pa: 'dpdpa_pa_database_master_mgmt' },
  DATABASE_ENVIRONMENT:         { fn: 'dpdpa_fn_database_environment_mgmt',         pa: 'dpdpa_pa_database_environment_mgmt' },
  DATABASE_VENDOR:              { fn: 'dpdpa_fn_database_vendor_mgmt',              pa: 'dpdpa_pa_database_vendor_mgmt' },
  DATABASE_OWNERSHIP:           { fn: 'dpdpa_fn_database_ownership_mgmt',           pa: 'dpdpa_pa_database_ownership_mgmt' },
  DATABASE_COMPLIANCE:          { fn: 'dpdpa_fn_database_compliance_mgmt',          pa: 'dpdpa_pa_database_compliance_mgmt' },
  DATABASE_DATA_SCOPE:          { fn: 'dpdpa_fn_database_data_scope_mgmt',          pa: 'dpdpa_pa_database_data_scope_mgmt' },
  DATA_INVENTORY:               { fn: 'dpdpa_fn_data_inventory_mgmt',               pa: 'dpdpa_pa_data_inventory_mgmt' },
  DATA_INVENTORY_MASTER:        { fn: 'dpdpa_fn_data_inventory_master_mgmt',        pa: 'dpdpa_pa_data_inventory_master_mgmt' },
  COLUMN_INVENTORY:             { fn: 'dpdpa_fn_column_inventory_mgmt',             pa: 'dpdpa_pa_column_inventory_mgmt' },

  // ── Consent Management ──────────────────────────────────────
  CONSENT_NOTICE:               { fn: 'dpdpa_fn_consent_notice_master_mgmt',        pa: 'dpdpa_pa_consent_notice_master_mgmt' },
  CONSENT_NOTICE_VERSION:       { fn: 'dpdpa_fn_consent_notice_version_mgmt',       pa: 'dpdpa_pa_consent_notice_version_mgmt' },
  CONSENT_NOTICE_PUBLICATION:   { fn: 'dpdpa_fn_consent_notice_publication_mgmt',   pa: 'dpdpa_pa_consent_notice_publication_mgmt' },
  CONSENT_NOTICE_LANGUAGE:      { fn: 'dpdpa_fn_consent_notice_language_mgmt',      pa: 'dpdpa_pa_consent_notice_language_mgmt' },
  CONSENT_ARTIFACT:             { fn: 'dpdpa_fn_consent_artifact_mgmt',             pa: 'dpdpa_pa_consent_artifact_mgmt' },
  CONSENT_HISTORY:              { fn: 'dpdpa_fn_consent_history_mgmt',              pa: 'dpdpa_pa_consent_history_mgmt' },
  CONSENT_WITHDRAWAL:           { fn: 'dpdpa_fn_consent_withdrawal_mgmt',           pa: 'dpdpa_pa_consent_withdrawal_mgmt' },
  CONSENT_PURPOSE:              { fn: 'dpdpa_fn_consent_purpose_master_mgmt',       pa: 'dpdpa_pa_consent_purpose_master_mgmt' },
  CONSENT_CHANNEL:              { fn: 'dpdpa_fn_consent_channel_master_mgmt',       pa: 'dpdpa_pa_consent_channel_master_mgmt' },
  CONSENT_AUDIT_LOG:            { fn: 'dpdpa_fn_consent_audit_log_mgmt',            pa: 'dpdpa_pa_consent_audit_log_mgmt' },
  CONSENT_NOTICE_ACCEPTANCE:    { fn: 'dpdpa_fn_consent_notice_acceptance_mgmt',    pa: 'dpdpa_pa_consent_notice_acceptance_mgmt' },

  // ── Breach Register ─────────────────────────────────────────
  BREACH_REGISTER:              { fn: 'dpdpa_fn_data_breach_register_mgmt',         pa: 'dpdpa_pa_data_breach_register_mgmt' },
  BREACH_INVESTIGATION:         { fn: 'dpdpa_fn_breach_investigation_mgmt',         pa: 'dpdpa_pa_breach_investigation_mgmt' },
  BREACH_IMPACT_ASSESSMENT:     { fn: 'dpdpa_fn_breach_impact_assessment_mgmt',     pa: 'dpdpa_pa_breach_impact_assessment_mgmt' },
  BREACH_CONTAINMENT:           { fn: 'dpdpa_fn_breach_containment_action_mgmt',    pa: 'dpdpa_pa_breach_containment_action_mgmt' },
  BREACH_CORRECTIVE:            { fn: 'dpdpa_fn_breach_corrective_action_mgmt',     pa: 'dpdpa_pa_breach_corrective_action_mgmt' },
  BREACH_ROOT_CAUSE:            { fn: 'dpdpa_fn_breach_root_cause_analysis_mgmt',   pa: 'dpdpa_pa_breach_root_cause_analysis_mgmt' },
  BREACH_EVIDENCE:              { fn: 'dpdpa_fn_breach_evidence_repository_mgmt',   pa: 'dpdpa_pa_breach_evidence_repository_mgmt' },
  BREACH_CATEGORY:              { fn: 'dpdpa_fn_breach_category_master_mgmt',       pa: 'dpdpa_pa_breach_category_master_mgmt' },
  BREACH_AUDIT_LOG:             { fn: 'dpdpa_fn_breach_audit_log_mgmt',             pa: 'dpdpa_pa_breach_audit_log_mgmt' },

  // ── Data Principal / DSR ────────────────────────────────────
  DATA_PRINCIPAL:               { fn: 'dpdpa_fn_data_principal_master_mgmt',        pa: 'dpdpa_pa_data_principal_master_mgmt' },
  DSR_REQUEST:                  { fn: 'dpdpa_fn_data_principal_request_mgmt',       pa: 'dpdpa_pa_data_principal_request_mgmt' },
  REQUEST_FULFILLMENT:          { fn: 'dpdpa_fn_request_fulfillment_mgmt',          pa: 'dpdpa_pa_request_fulfillment_mgmt' },
  REQUEST_VERIFICATION:         { fn: 'dpdpa_fn_request_verification_mgmt',         pa: 'dpdpa_pa_request_verification_mgmt' },
  REQUEST_COMMUNICATION:        { fn: 'dpdpa_fn_request_communication_log_mgmt',    pa: 'dpdpa_pa_request_communication_log_mgmt' },
  PRINCIPAL_NOTIFICATION:       { fn: 'dpdpa_fn_data_principal_notification_mgmt',  pa: 'dpdpa_pa_data_principal_notification_mgmt' },

  // ── ROPA ─────────────────────────────────────────────────────
  ROPA_PROCESS:                 { fn: 'dpdpa_fn_ropa_process_master_mgmt',          pa: 'dpdpa_pa_ropa_process_master_mgmt' },
  ROPA_DATA_CATEGORY:           { fn: 'dpdpa_fn_ropa_data_category_master_mgmt',    pa: 'dpdpa_pa_ropa_data_category_master_mgmt' },
  ROPA_DATA_SUBJECT:            { fn: 'dpdpa_fn_ropa_data_subject_master_mgmt',     pa: 'dpdpa_pa_ropa_data_subject_master_mgmt' },
  ROPA_LEGAL_BASIS:             { fn: 'dpdpa_fn_ropa_legal_basis_master_mgmt',      pa: 'dpdpa_pa_ropa_legal_basis_master_mgmt' },
  ROPA_PURPOSE:                 { fn: 'dpdpa_fn_ropa_purpose_mapping_mgmt',         pa: 'dpdpa_pa_ropa_purpose_mapping_mgmt' },

  // ── Fiduciary ────────────────────────────────────────────────
  FIDUCIARY:                    { fn: 'dpdpa_fn_data_fiduciary_master_mgmt',        pa: 'dpdpa_pa_data_fiduciary_master_mgmt' },
  FIDUCIARY_DPO:                { fn: 'dpdpa_fn_fiduciary_dpo_mgmt',                pa: 'dpdpa_pa_fiduciary_dpo_mgmt' },
  FIDUCIARY_GRIEVANCE:          { fn: 'dpdpa_fn_fiduciary_grievance_officer_mgmt',  pa: 'dpdpa_pa_fiduciary_grievance_officer_mgmt' },
  FIDUCIARY_PRODUCT:            { fn: 'dpdpa_fn_fiduciary_product_master_mgmt',     pa: 'dpdpa_pa_fiduciary_product_master_mgmt' },
  FIDUCIARY_REGISTRATION:       { fn: 'dpdpa_fn_fiduciary_registration_mgmt',       pa: 'dpdpa_pa_fiduciary_registration_mgmt' },

  // ── Gap Analysis ─────────────────────────────────────────────
  GAP_REGISTER:                 { fn: 'dpdpa_fn_gap_register_mgmt',                 pa: 'dpdpa_pa_gap_register_mgmt' },
  GAP_SCORECARD:                { fn: 'dpdpa_fn_gap_analysis_scorecard_mgmt',        pa: 'dpdpa_pa_gap_analysis_scorecard_mgmt' },
  GAP_AUDIT_LOG:                { fn: 'dpdpa_fn_gap_analysis_audit_log_mgmt',        pa: 'dpdpa_pa_gap_analysis_audit_log_mgmt' },

  // ── Auth / User ──────────────────────────────────────────
  LOGIN:                        { fn: 'dpdpa_fn_validate_user',                    pa: 'dppa_pa_login_attempt' },
  USER_MASTER:                  { fn: 'dpdpa_fn_user_org_prod_wise',               pa: 'dpdpa_pa_forget_pwd' },

  // ── Masters / Lookups ────────────────────────────────────────
  MENU_MGMT:                    { fn: 'dpdpa_fn_menu_mgmt',                         pa: 'dpdpa_pa_menu_mgmt' },
  CATEGORY_MASTER:              { fn: 'dpdpa_fn_category_mst_mgmt',                 pa: 'dpdpa_pa_category_mst_mgmt' },
  CATEGORY_DETAIL:              { fn: 'dpdpa_fn_category_dtl_mgmt',                 pa: 'dpdpa_pa_category_dtl_mgmt' },
  DATA_CLASSIFICATION:          { fn: 'dpdpa_fn_data_classification_master_mgmt',   pa: 'dpdpa_pa_data_classification_master_mgmt' },
  DATA_FIDUCIARY:               { fn: 'dpdpa_fn_data_fiduciary_master_mgmt',        pa: 'dpdpa_pa_data_fiduciary_master_mgmt' },
  REQUEST_TYPE:                 { fn: 'dpdpa_fn_request_type_master_mgmt',          pa: 'dpdpa_pa_request_type_master_mgmt' },
  PII_CATEGORY:                 { fn: 'dpdpa_fn_pii_category_master_mgmt',          pa: 'dpdpa_pa_pii_category_master_mgmt' },
} as const;

/** Standard actions */
export const ACTION = {
  SEARCH: 'SEARCH',
  GETBYID: 'GETBYID',
  GETBYAPP: 'GETBYAPP',
  CREATE: 'C',
  UPDATE: 'U',
  DELETE: 'D',
  EXCELDUMP: 'EXCELDUMP',
} as const;

-- Sample SQL Script to Insert Realistic Cookies into dpdpa_cookies Table
-- Replace 15 with your actual application_id if different

-- ── 1. Necessary Cookies (Essential for site operation)
INSERT INTO public.dpdpa_cookies (
    org_id, application_id, category_id, cookie_name, provider, domain, purpose, data_collected, duration, is_third_party, is_active, created_by
) VALUES 
(1, 15, 1, 'XSRF-TOKEN', 'Self', '.axisbank.in', 'Used to prevent Cross-Site Request Forgery (CSRF) security attacks.', 'Security tokens', 'Session', false, true, 'system'),
(1, 15, 1, 'ASP.NET_SessionId', 'Self', '.axisbank.in', 'Maintains the visitor session state across page requests.', 'Session ID identifier', 'Session', false, true, 'system'),
(1, 15, 1, 'dpdpa_consent_saved_15', 'Jodetx', '.axisbank.in', 'Stores the visitor consent preference choices for the cookie banner.', 'Consent state mapping', '1 year', false, true, 'system');

-- ── 2. Functional Cookies (Preferences and personalisation)
INSERT INTO public.dpdpa_cookies (
    org_id, application_id, category_id, cookie_name, provider, domain, purpose, data_collected, duration, is_third_party, is_active, created_by
) VALUES 
(1, 15, 2, 'preferred_language', 'Self', '.axisbank.in', 'Remembers the user selected language preference (e.g. English, Hindi).', 'Language code string', '1 year', false, true, 'system'),
(1, 15, 2, 'theme_mode', 'Self', '.axisbank.in', 'Remembers the user UI theme preference (e.g. Light or Dark mode).', 'Theme style preference', '1 month', false, true, 'system');

-- ── 3. Analytics Cookies (Performance and tracking metrics)
INSERT INTO public.dpdpa_cookies (
    org_id, application_id, category_id, cookie_name, provider, domain, purpose, data_collected, duration, is_third_party, is_active, created_by
) VALUES 
(1, 15, 3, '_ga', 'Google Analytics', '.axisbank.in', 'Registers a unique ID that is used to generate statistical data on how the visitor uses the website.', 'Unique client ID, page visits', '2 years', true, true, 'system'),
(1, 15, 3, '_gid', 'Google Analytics', '.axisbank.in', 'Stores and counts pageviews for analytics reporting.', 'Pageview counts, session ID', '24 hours', true, true, 'system'),
(1, 15, 3, '_ga_YQ1DWSP7EK', 'Google Analytics', '.www.axisbank.in', 'Used by Google Analytics to maintain session state.', 'Session state tokens', '2 years', true, true, 'system');

-- ── 4. Marketing Cookies (Targeted advertising and tracking)
INSERT INTO public.dpdpa_cookies (
    org_id, application_id, category_id, cookie_name, provider, domain, purpose, data_collected, duration, is_third_party, is_active, created_by
) VALUES 
(1, 15, 4, '_fbp', 'Facebook', '.axisbank.in', 'Used by Facebook to deliver a series of advertisement products such as real-time bidding from third party advertisers.', 'User tracking ID, ad interactions', '3 months', true, true, 'system'),
(1, 15, 4, 'MR', 'Bing Ads', 'bat.bing.com', 'Used by Microsoft Advertising to track visitor interactions for marketing campaigns.', 'Ad click parameters', '6 months', true, true, 'system');

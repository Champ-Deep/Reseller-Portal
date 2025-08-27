-- Lake B2B Reseller Portal - Seed Data
-- Sample data for development and testing

-- Insert sample organization
INSERT INTO organizations (name, slug, settings) VALUES 
('Demo Organization', 'demo-org-' || FLOOR(RANDOM() * 1000000), 
 '{"timezone": "UTC", "currency": "USD", "features": ["premium", "bulk_processing"]}')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample user
INSERT INTO users (organization_id, email, name, role, status) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1), 
 'demo@lakeb2b.com', 'Demo User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample ICP filters
INSERT INTO icp_filters (organization_id, user_id, name, description, filters, estimated_count) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Enterprise Tech Decision Makers',
 'C-suite executives and VPs at technology companies with 500+ employees',
 '{"industries": ["Technology", "Software"], "company_size": "500-1000", "regions": ["United States", "Canada"], "technologies": ["Salesforce", "HubSpot"]}',
 45000),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Healthcare Procurement Managers',
 'Procurement and purchasing managers at hospitals and healthcare systems',
 '{"industries": ["Healthcare"], "company_size": "1000+", "regions": ["United States"], "technologies": ["Epic", "Cerner"]}',
 28000),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Financial Services CMOs',
 'Chief Marketing Officers and senior marketing leaders at financial institutions',
 '{"industries": ["Finance", "Banking"], "company_size": "100-500", "regions": ["United States", "United Kingdom"], "technologies": ["Salesforce", "Adobe"]}',
 12500);

-- Insert sample data segments for marketplace
INSERT INTO data_segments (organization_id, name, description, category, price_per_record, total_records, metadata, is_active) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 'Enterprise Tech Decision Makers',
 'C-suite executives and VPs at technology companies with 500+ employees',
 'Technology',
 0.12,
 45000,
 '{"verified": true, "updated": "' || NOW() || '", "quality_score": 95, "sources": ["LinkedIn", "Company Websites", "Public Filings"]}',
 true),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 'Healthcare Procurement Managers',
 'Procurement and purchasing managers at hospitals and healthcare systems',
 'Healthcare',
 0.15,
 28000,
 '{"verified": true, "updated": "' || NOW() || '", "quality_score": 92, "sources": ["Professional Networks", "Trade Publications"]}',
 true),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 'Financial Services CMOs',
 'Chief Marketing Officers and senior marketing leaders at financial institutions',
 'Finance',
 0.18,
 12500,
 '{"verified": true, "updated": "' || NOW() || '", "quality_score": 97, "sources": ["Executive Databases", "Conference Attendees"]}',
 true),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 'Manufacturing Operations Directors',
 'Operations and plant directors at manufacturing companies worldwide',
 'Manufacturing',
 0.14,
 35000,
 '{"verified": true, "updated": "' || NOW() || '", "quality_score": 89, "sources": ["Industry Directories", "Trade Shows"]}',
 true),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 'E-commerce Founders & CEOs',
 'Founders and CEOs of e-commerce and retail technology companies',
 'Retail',
 0.20,
 18750,
 '{"verified": true, "updated": "' || NOW() || '", "quality_score": 93, "sources": ["Startup Databases", "Funding Announcements"]}',
 true);

-- Insert sample campaigns
INSERT INTO campaigns (organization_id, user_id, name, description, status, target_audience, metrics, start_date, end_date) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Enterprise SaaS Prospects Q1 2024',
 'Outreach campaign targeting enterprise technology decision makers for our SaaS platform',
 'active',
 '{"industries": ["Technology", "Software"], "company_size": "500+", "roles": ["CTO", "VP Engineering", "Director IT"]}',
 '{"emails_sent": 2500, "open_rate": 24.5, "response_rate": 3.2, "meetings_booked": 45}',
 NOW() - INTERVAL '30 days',
 NOW() + INTERVAL '30 days'),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Healthcare Innovation Summit',
 'Event invitation campaign for healthcare procurement professionals',
 'completed',
 '{"industries": ["Healthcare"], "company_size": "1000+", "roles": ["Procurement Manager", "Director Purchasing"]}',
 '{"emails_sent": 1200, "open_rate": 31.2, "response_rate": 8.5, "registrations": 85}',
 NOW() - INTERVAL '60 days',
 NOW() - INTERVAL '10 days');

-- Insert sample enrichment jobs
INSERT INTO enrichment_jobs (organization_id, user_id, name, status, input_file_url, output_file_url, column_mapping, progress, total_records, processed_records) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Q1 Lead List Enrichment',
 'completed',
 'https://example.com/uploads/q1-leads.csv',
 'https://example.com/outputs/q1-leads-enriched.csv',
 '{"email": "email", "company": "company_name", "first_name": "first_name", "last_name": "last_name"}',
 100,
 2500,
 2500),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'Trade Show Attendees Enrichment',
 'processing',
 'https://example.com/uploads/trade-show-leads.csv',
 NULL,
 '{"email": "email_address", "company": "company", "name": "full_name"}',
 65,
 1800,
 1170);

-- Insert sample Lake B2B account sync records
INSERT INTO lake_b2b_accounts (organization_id, lake_b2b_account_id, account_data, sync_status, last_synced_at) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 'lakeb2b_acc_123456789',
 '{"account_name": "Demo Organization", "plan": "enterprise", "credits": 50000, "used_credits": 12500, "features": ["bulk_enrichment", "api_access", "premium_support"]}',
 'active',
 NOW() - INTERVAL '1 hour');

-- Insert sample audit logs
INSERT INTO audit_logs (organization_id, user_id, action, resource_type, resource_id, new_values, ip_address, user_agent) VALUES 
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'create_icp_filter',
 'icp_filter',
 (SELECT id FROM icp_filters WHERE name = 'Enterprise Tech Decision Makers' LIMIT 1),
 '{"name": "Enterprise Tech Decision Makers", "estimated_count": 45000}',
 '192.168.1.100',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
((SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1),
 (SELECT id FROM users WHERE email = 'demo@lakeb2b.com' LIMIT 1),
 'create_enrichment_job',
 'enrichment_job',
 (SELECT id FROM enrichment_jobs WHERE name = 'Q1 Lead List Enrichment' LIMIT 1),
 '{"name": "Q1 Lead List Enrichment", "total_records": 2500}',
 '192.168.1.100',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Base updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Repositories table
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    github_id BIGINT NOT NULL,
    full_name TEXT NOT NULL,
    default_branch TEXT NOT NULL DEFAULT 'main',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(project_id, github_id)
);

CREATE TRIGGER set_timestamp_repositories
BEFORE UPDATE ON repositories
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Providers table (LLM providers)
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    base_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    encrypted_key TEXT NOT NULL, -- In a real app, this would be encrypted securely
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(user_id, provider_id)
);

CREATE TRIGGER set_timestamp_api_keys
BEFORE UPDATE ON api_keys
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Incidents table (Grouped API errors)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'ignored')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    error_type TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_incidents_project_id ON incidents(project_id);
CREATE INDEX idx_incidents_status ON incidents(status);

CREATE TRIGGER set_timestamp_incidents
BEFORE UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- API Logs table (Raw ingestion)
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    error_message TEXT,
    stack_trace TEXT,
    headers JSONB,
    body JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_logs_project_id ON api_logs(project_id);
CREATE INDEX idx_api_logs_incident_id ON api_logs(incident_id);
CREATE INDEX idx_api_logs_timestamp ON api_logs(timestamp);

-- Investigations table
CREATE TABLE investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    root_cause TEXT,
    confidence_score NUMERIC(5,2),
    risk_analysis TEXT,
    time_estimate_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_investigations
BEFORE UPDATE ON investigations
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Analysis Runs table (Timeline of investigation steps)
CREATE TABLE analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    output TEXT,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Patches table
CREATE TABLE patches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    original_content TEXT NOT NULL,
    updated_content TEXT NOT NULL,
    unified_diff TEXT NOT NULL,
    explanation TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_patches
BEFORE UPDATE ON patches
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Pull Requests table
CREATE TABLE pull_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    github_pr_id BIGINT,
    github_pr_number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    branch_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'closed')),
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_pull_requests
BEFORE UPDATE ON pull_requests
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Row Level Security (RLS) setup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Example: Users can only see their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
-- In a real app, we'd add more complex policies for organization members, etc.

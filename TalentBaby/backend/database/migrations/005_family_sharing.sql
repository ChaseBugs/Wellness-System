-- Migration 005: Family Sharing
-- Allows multiple family members to access a baby's profile

-- Family invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
    id          SERIAL PRIMARY KEY,
    baby_id     INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    inviter_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(64) UNIQUE NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'viewer',  -- 'viewer' | 'editor'
    status      VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined' | 'expired'
    expires_at  TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family members table (accepted invitations become access records)
CREATE TABLE IF NOT EXISTS family_members (
    id          SERIAL PRIMARY KEY,
    baby_id     INTEGER NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL DEFAULT 'viewer',  -- 'viewer' | 'editor'
    invited_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(baby_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_invitations_baby    ON family_invitations(baby_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_code    ON family_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email   ON family_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_family_members_baby        ON family_members(baby_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user        ON family_members(user_id);

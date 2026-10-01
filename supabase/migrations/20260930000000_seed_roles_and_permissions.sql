-- Seed base roles, the feature-flag.manage permission, and wire admin to it.

INSERT INTO roles (name) VALUES
    ('user'),
    ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name) VALUES
    ('feature-flag.manage')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
AND p.name = 'feature-flag.manage'
ON CONFLICT (role_id, permission_id) DO NOTHING;

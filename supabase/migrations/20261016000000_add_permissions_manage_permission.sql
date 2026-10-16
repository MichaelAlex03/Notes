INSERT INTO permissions (name) VALUES
    ('permissions.manage')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
AND p.name = 'permissions.manage'
ON CONFLICT (role_id, permission_id) DO NOTHING;

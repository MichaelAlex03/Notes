ALTER TABLE user_roles DROP CONSTRAINT uq_user_role;

ALTER TABLE user_roles ADD CONSTRAINT uq_user_role UNIQUE (user_id);

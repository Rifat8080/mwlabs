CREATE DATABASE IF NOT EXISTS mwlabs_shadow;
GRANT ALL PRIVILEGES ON mwlabs_shadow.* TO 'mwlabs_app'@'%';
FLUSH PRIVILEGES;

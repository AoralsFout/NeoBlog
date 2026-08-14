-- 令牌版本号：用于登出时整体撤销用户已签发的JWT
-- 执行方式（二选一）：
--   1) mysql -u<user> -p neoblog_db < prisma/add_token_version.sql
--   2) 在 backend 目录执行: npx prisma db push
ALTER TABLE `users` ADD COLUMN `token_version` INT NOT NULL DEFAULT 0;

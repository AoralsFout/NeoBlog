# NeoBlog 架构复杂度重构规划

> 本文件是**执行契约**：按步骤顺序执行，每完成一步提交一次 commit。
> 每个步骤都必须通过验证门禁后才能提交。

## 背景

本规划源自一次架构复杂度热点审查（非代码风格审查），目标是消除**因历史演进导致的逻辑碎片化**：
本应由一个统一机制解决的问题，被分散在多个模块、层级或生命周期中。

审查依据：47 次提交的 `git log` 频率统计 + 逐文件阅读。
热点文件：`Home.vue`(21 次改动)、`Navigation.vue`(14)、`Card.vue`(12)、`backend/src/index.ts`(11)。

核心结论：项目经历过三次架构重心迁移（组件化+主题 → 路由化+布局 → 音乐播放器+评论），
每次都是**在旧结构上叠加而非替换**，导致同一条职责存在多套未拆除的实现。

## 验证门禁（每一步都必须全部通过）

```bash
# 后端类型检查（不产出 dist，避免污染）
cd backend && npx tsc --noEmit

# 前端类型检查
cd frontend && npx vue-tsc --build
```

基线（规划制定时）：两者均 exit 0。

无法用类型检查覆盖的行为变更，必须在步骤的「验证」小节列出**人工回归清单**。

## 约束

- 不改变对外 API 契约，除非该步骤明确说明。
- 不改变数据库 schema（涉及 schema 的步骤已在规划中排除，另立专项）。
- 每个步骤必须是**可独立回滚**的。
- 提交信息格式：`refactor(step-N): <摘要>`
- 若某步骤在实施中发现前置假设不成立，**暂停该步骤**，在「执行记录」中记录原因并调整后续顺序，不强行推进。

## 步骤总览

| 步骤 | 内容 | 类型 | 风险 | 状态 |
|---|---|---|---|---|
| 0 | 建立规划文档 | 文档 | 极低 | ✅ 已完成 |
| 1 | 删除死配置与聚合导出层 | 清理 | 极低 | ✅ 已完成 |
| 2 | 清理仓库死代码与构建产物 | 清理 | 极低 | ✅ 已完成 |
| 3 | 统一可选鉴权（修复授权漏洞） | 缺陷+安全 | 低 | ⬜ 待执行 |
| 4 | 收敛用户/角色/状态映射 | 机制重复 | 中 | ⬜ 待执行 |
| 5 | 引入领域错误类型，消除字符串匹配判定 | 机制重复 | 中 | ⬜ 待执行 |
| 6 | 收敛会话启动流程，拆分 isLoading | 时序耦合 | 低-中 | ⬜ 待执行 |
| 7 | 统一 Markdown 渲染与目录大纲 | 职责分散 | 低 | ⬜ 待执行 |
| 8 | 统一外观下发通道（主题/圆角） | 机制重复 | 低 | ⬜ 待执行 |
| 9 | 收敛时间段概念为纯函数 | 机制重复 | 低 | ⬜ 待执行 |
| 10 | 表格化音乐服务，删除 Prisma 回退路径 | 机制重复 | 低 | ⬜ 待执行 |
| 11 | 布局所有权移交 CSS | 分支膨胀 | 中 | ⬜ 待执行 |
| 12 | 引入文章查询协调器 | 职责分散 | 中 | ⬜ 待执行 |
| 13 | 浏览计数从 GET 副作用分离 | 职责分散 | 中 | ⬜ 待执行 |
| 14 | 提取共享格式化/标签工具 | 机制重复 | 低 | ⬜ 待执行 |
| 15 | MusicPlayer 状态收敛（阶段一：只读订阅） | 时序耦合 | 中 | ⬜ 待执行 |
| 16 | MusicPlayer 引擎化（阶段二：单一状态源） | 时序耦合 | 高 | ⬜ 待执行 |

---

## 步骤 0：建立规划文档

- **目标**：落地本文件，使后续步骤有可追溯的执行契约。
- **验证**：文件存在且结构完整。
- **状态**：✅ 已完成

---

## 步骤 1：删除死配置与聚合导出层

### 问题
后端有三组"统一导出"聚合文件，与实际导入路径脱节；配置在四处重复且**互相矛盾**，
被引用的那份与未被引用的那份取值不同，会在代码审查时给出错误默认值。

### 证据
- `backend/config/index.ts`（24 行）、`backend/services/index.ts`（23 行）、`backend/controllers/index.ts`（23 行）——`config/index` 与 `controllers/index` **零引用**。
- `config/auth.ts:7-11` 定义 `jwtConfig`，但 `utils/jwt.ts:22-25` 直接用 `env.jwtSecret`/`env.jwtExpiresIn` 并硬编码 `'HS256'`。**生效的是散落的那份。**
- `config/auth.ts:45-49` `rateLimitConfig.max = 100`，而 `src/index.ts:80-86` 实际使用 `max: 1000`。
- `config/auth.ts:38-42` `corsConfig` 未被使用，`src/index.ts:70-73` 自行配置。
- `config/auth.ts:26-35` `sessionConfig` 含 express-session 配置，但项目**未使用 express-session**（认证走 HttpOnly JWT Cookie）。
- `utils/index.ts:12-17` 双导出同一批工具，零引用。
- 对比：`config/auth.ts:14-23` 的 `oauthConfig` 是**真实使用**的 → 说明该文件部分生效、部分腐烂。
- `AUTH_COOKIE_NAME`（`config/auth.ts:4`）是唯一被多处共用的导出。

### 当前 Owner / 理想 Owner
- 当前：`config/auth.ts` 与三个 `index.ts` 聚合层共同"假装"是配置与服务出口，实际无人遵守。
- 理想：`config/env.ts` 是环境变量唯一来源；`config/auth.ts` 只保留真实共享的常量（`AUTH_COOKIE_NAME`）与 `oauthConfig`；聚合层删除。

### 复杂度根源
- Essential：集中配置本身是良好实践。
- Accidental：聚合层是"看起来整齐"的产物，无人使用后腐烂；腐烂的副本比不存在更危险。

### 具体改动
1. 删除 `backend/config/index.ts`、`backend/services/index.ts`、`backend/controllers/index.ts`。
2. 删除 `backend/utils/index.ts`。
3. `config/auth.ts`：删除 `jwtConfig`、`sessionConfig`、`corsConfig`、`rateLimitConfig`；保留 `AUTH_COOKIE_NAME`、`oauthConfig`。
4. `src/index.ts`：把 `rateLimit` 的 `max` 提取为具名常量（保持当前生效值 1000 不变，避免行为变更）。
5. 三个控制器（`auth`/`user`/`upload`）的 `from '../services'` 改为直连具体服务文件。

### 验证
- `npx tsc --noEmit` exit 0（会立即暴露任何遗漏引用）。
- 人工确认：`src/index.ts` 的限流仍为 1000、CORS 仍为 `env.frontendUrl` + `credentials: true`（**行为不变**）。

### 收益
- 删除约 90 行死代码与 4 个文件。
- 消除 3 处"两份配置不一致"隐患（JWT、限流、CORS）。
- 限流参数成为单一定义。

### 风险
**极低**。纯删除；`tsc` 是完备的安全网。唯一注意点：不要把"生效值"误改成"死配置的值"。

---

## 步骤 2：清理仓库死代码与构建产物

### 问题
仓库内存在自述已废弃的组件与被打包的编译产物。

### 证据
- `frontend/src/components/MusicBox.vue`（310 行），文件第一行自述：`<!-- 该文件已废弃，不在任何地方引用 -->`。

### 审查更正（执行时核实）
原审查报告称"`backend/dist/` 下 18 个编译产物被跟踪进仓库"。**该判断有误，已核实为不成立**：
- `git ls-files backend/dist` → 返回 0 条。
- `git check-ignore -v backend/dist/src/index.js` → 命中 `backend/.gitignore:21:dist`。
- `git ls-files '*.js'` → 全仓库 **0 个** `.js` 文件被跟踪。

结论：`backend/dist` 只是本地构建产物目录，从未进入版本控制。`.gitignore` 已正确覆盖。
因此本步**不需要**任何 `git rm --cached` 操作。规划文档在此更正，以避免后续步骤基于错误前提。

### 具体改动
1. 删除 `frontend/src/components/MusicBox.vue`（唯一确认的死代码）。
2. `backend/src/index.ts` 的静态文件服务指向 `path.join(__dirname, '..', 'public')` —— 该路径基于 `dist/src/` 布局，**保持不变**（不在本步调整）。

### 验证
- `npx vue-tsc --build` exit 0（证明无引用）。
- `git ls-files '*.js'` 仍为 0（确认无构建产物入库）。

### 状态
✅ 已完成

### 收益
- 删除约 310 行死代码。
- 消除"废弃文件被误改/误引用"的风险。

### 风险
**极低**。纯删除，且组件自述无引用、类型检查可证明。

---

## 步骤 3：统一可选鉴权（修复授权漏洞）

### 问题
评论列表接口需要"可选登录"，为此**手工重写**了整套令牌提取与验证，并且**删掉了两个关键校验**。

### 证据
- `comment.controller.ts:26-35`：`extractTokenFromHeader` + `parseCookies` + `verifyToken`，**没有查库**。
- `middleware/auth.ts:41-58`（权威实现）：除了验签，还查 `prisma.user.findUnique` 校验 `status === 'NORMAL'` 与 `user.token_version === payload.tv`。
- **后果**：用户被 BANNED/FROZEN 或**已登出（token_version 递增）**后，旧 JWT 仍能通过 `getComments` 被识别为有效登录用户，读到自己的 `user_reaction`。`auth.controller.ts:124-125` 的登出撤销机制在此接口失效。
- `bd95af2`（修复生产环境 OAuth 回调 Cookie 跨域失效）说明认证路径历史上已出过 bug —— 两套路径意味着下次修复要做两遍。

### 当前 Owner / 理想 Owner
- 当前：`middleware/auth.ts`（必需认证）+ `comment.controller.ts:26-35`（第二套可选认证）。
- 理想：`middleware/auth.ts` 同时导出 `authenticate` 与 `authenticateOptional`，共享同一个 `resolveSession(req)`。

### 复杂度根源
- Essential："可选认证"是真实需求。
- Accidental：把"必需认证"中间件复制删减成第二套，并在删减中丢失校验。

### 具体改动
1. `middleware/auth.ts`：抽出 `resolveSession(req): Promise<JwtPayload | null>`，包含"提取令牌 → 验签 → 查库校验 status 与 token_version → 返回 payload"。
2. `authenticate` 改为调用 `resolveSession`，为 `null` 时返回 401（**保持现有错误码分支**：无令牌 401 `UNAUTHORIZED`、验签失败 401 `INVALID_TOKEN`、用户异常 401 `USER_DISABLED`、版本不符 401 `TOKEN_REVOKED`）。
3. 新增 `authenticateOptional`：调用 `resolveSession`，无论结果如何都 `next()`，成功时写 `req.user`。
4. `src/index.ts:125` 评论路由加 `authenticateOptional`。
5. `comment.controller.ts`：删除令牌处理逻辑与 3 个 import，改用 `req.user?.userId`。

### 验证
- `npx tsc --noEmit` exit 0。
- **人工回归清单**：
  1. 未登录访问 `GET /api/comments` → 正常返回评论，`user_reaction` 为 `null`。
  2. 登录访问 → `user_reaction` 正确回显。
  3. 用户登出后用旧 Cookie 访问 `GET /api/comments` → `user_reaction` 必须为 `null`（**漏洞修复的核心断言**）。
  4. 被禁用用户用旧 Cookie 访问 → 同上。
  5. `POST /api/comments` 未登录 → 仍为 401。
- **注意**：`authenticate` 的错误码分支必须逐条保持，否则会改变前端行为。

### 收益
- 认证实现 2 → 1；消除 1 条无 `token_version`/`status` 校验的旁路。
- `comment.controller.ts` 减少 3 个 import 与 8 行。

### 风险
**低**。改动小、收益高（修真实授权漏洞）。风险点是错误码回归，已列入验证清单。
**额外成本提示**：`authenticate` 由"每次请求一次 DB 查询"变为不变（仍是一次），但评论路由现在**也会**产生一次用户查询 —— 这是为安全付出的必要成本，需在提交信息中说明。

---

## 步骤 4：收敛用户/角色/状态映射

### 问题
同一领域词汇在四层有四种表示，每层各做一次手工转换且方向相反，没有权威层。

### 证据
- `mapPrismaUserToUser` **存在两份完全相同实现**：`auth.service.ts:190-202` 与 `user.service.ts:215-227`。
- `updateUser` 路径发生**三轮转换**：controller 转小写（`user.controller.ts:154,164`）→ service 转大写（`user.service.ts:90-95`）→ 响应再转小写（`user.service.ts:222`）。
- `middleware/auth.ts:63` 又做一次 `.toLowerCase()`。
- 枚举字面量 `['admin','member']`、`['normal','banned','frozen']` 在 `user.controller.ts:148,158` 硬编码，前端 `User.vue:302-313` 再写一份 `getStatusText` switch。
- 标签解析：`ArticleCard.vue:43` 与 `ArticleDetail.vue:68` 逐字相同。

### 当前 Owner / 理想 Owner
- 当前：转换散落 service / controller / middleware 三处，无权威。
- 理想：后端 API 边界是唯一规范化点。DB 用原生枚举，Service **直接返回规范形式**，Controller 不碰大小写。

### 复杂度根源
- Essential：DB 枚举大写、JSON/前端小写是合理惯例差异。
- Accidental：转换方向不统一、位置分散，**没有任何一层是权威**。

### 具体改动
1. 新建 `backend/utils/mappers.ts`（或 `backend/mappers/user.ts`），导出唯一的 `toApiUser(prismaUser)` 与 `toDbEnum(value)`。
2. `auth.service.ts`、`user.service.ts` 删除各自的 private mapper，改用共享版本。
3. `user.controller.ts`：删除 role/status 的小写转换，只做**值域校验**（保留校验，删除转换）；校验值域改为从共享常量读取。
4. `user.service.ts`：`updateUser` 内保留"入参 → DB"方向的转换（在 mapper 中成对定义）。
5. `middleware/auth.ts:63` 的 `.toLowerCase()` 改由 mapper 语义承担。
6. 前端：`ArticleCard.vue` 与 `ArticleDetail.vue` 的标签解析暂不改（留给步骤 14）；`User.vue` 的 `getStatusText` 暂不改（避免本步扩散）。

### 验证
- `npx tsc --noEmit` exit 0。
- **人工回归清单**：
  1. 登录 → `/api/auth/me` 返回的 `role`/`status` 仍为小写。
  2. 管理员 `PATCH /api/users/:id` 传 `role: "admin"` 与 `role: "ADMIN"` → 都成功且返回小写。
  3. 管理员传非法 role/status → 仍返回 400 且错误码为 `VALIDATION_ERROR`。
  4. 普通用户尝试改 role → 仍被忽略（不报错、不生效）。
- **约束**：本步**只做归一化收敛，不改变对外表示形式**（前端看到的仍是小写）。若发现某接口当前返回大写，先记录、不修改。

### 收益
- 重复 mapper 2 → 1；大小写转换点 6 → 2（成对）；枚举字面量硬编码点 3 → 1。
- 消除"三轮转换"中任一轮遗漏导致的静默错值。

### 风险
**中**。`updateUser` 是权限敏感路径。必须严格遵守"不改对外契约"。

---

## 步骤 5：引入领域错误类型，消除字符串匹配判定

### 问题
HTTP 状态码由**错误消息文案**决定，业务判定建立在中文提示语上。

### 证据
- `user.controller.ts:178`：`error.message.includes('已被使用')` → 409。
- `comment.controller.ts:98,135`：`error.message.includes('不存在')` → 404。
- `upload.controller.ts:198`：`error.message.includes('非法文件路径')` → 400。
- `article.service.ts:144-163` `getTopArticles` 在错误时 `return []`（吞异常），同文件 `getArticles` 抛错 —— 错误策略不一致，导致统计卡片静默显示空。

### 当前 Owner / 理想 Owner
- 当前：每个 controller 自行用字符串匹配猜错误种类。
- 理想：Service 抛领域错误类型，Controller 只调用 `next(err)`，由统一错误处理中间件映射为 HTTP 状态。

### 复杂度根源
- Essential：不同失败原因确实需要不同 HTTP 状态。
- Accidental：用文案承载类型信息；文案一改（或国际化）判定即失效。

### 具体改动
1. 新建 `backend/utils/errors.ts`：`AppError` 基类 + `NotFoundError`(404)、`ConflictError`(409)、`ValidationError`(400)、`ForbiddenError`(403)，各带 `code` 字符串。
2. 各 service 把 `throw new Error('...不存在')` 改为对应领域错误（`comment.service.ts:98,101,147`；`user.service.ts:110`；`article.service.ts` 的 `return null` 语义保持不变，避免扩散）。
3. `src/index.ts:167-193` 的错误中间件增加领域错误分支：输出 `{ success:false, error:{ code, message } }`，状态码取 `err.status`。
4. 三个 controller 删除字符串匹配分支，改为 `next(error)`（需为函数补 `NextFunction` 参数）。

### 验证
- `npx tsc --noEmit` exit 0。
- **人工回归清单**（错误码必须逐一保持）：
  1. 创建回复不存在的评论 → 404 `CREATE_COMMENT_FAILED`（或统一后的等价 code）。
  2. 对不存在的评论点赞 → 404。
  3. 更新为已存在邮箱 → 409 `EMAIL_CONFLICT`。
  4. 删除 uploads 目录外文件 → 400 `DELETE_FILE_FAILED`。
- **注意**：错误响应的 `code` 字段是对外契约，前端 `api.ts:28` 只取 `error.message`，因此改 `code` 风险低，但**不要改 message 文案**。

### 收益
- 字符串匹配判定 4 → 0；统一错误映射入口 1 个；`getTopArticles` 的静默吞异常行为被显式化（保留但记录）。

### 风险
**中**。需逐条保持现有状态码与文案。建议本步**不改** `getTopArticles` 的吞异常行为，只加注释标记。

---

## 步骤 6：收敛会话启动流程，拆分 isLoading

### 问题
`currentUser` 的加载时机没有单一所有者，被 4 个入口分别触发，靠 Store 内一个 `initPromise` 变量兜底；同时 `isLoading` 是全局单标志，被 4 个不同操作共用，导致误显示。

### 证据
- 触发点：`App.vue:22-23`（fire-and-forget，不 await）、`Navigation.vue:98-100`（`onBeforeMount` await）、`router/index.ts:67-79`（守卫 await）、`OAuthCallback.vue:53-73`（经 `handleOAuthCallback` 绕过 `initUser`）。
- `stores/user.ts:34-36`：`if (currentUser.value) return Promise.resolve()` —— 用"结果已存在"代替"是否已加载"作为幂等条件；未登录时每个调用者都会重新发请求。
- `stores/user.ts:11` `isLoading` 被 `fetchCurrentUser`、`logout`、`updateUserProfile`、`uploadAvatar` 共用。
- **已可观测 bug**：`Navigation.vue:61,66` 在用户上传头像时显示"登出中..."。
- 路由守卫只对 `meta.requiresAdmin` 生效，其他路由不保证会话已就绪。

### 当前 Owner / 理想 Owner
- 当前：三个组件级入口 + 守卫共同"认为自己该启动"。
- 理想：**路由守卫（或 main.ts 挂载前）是唯一启动协调点**；组件只读状态、从不触发加载。

### 复杂度根源
- Essential：刷新后需知道是否登录，管理员路由必须在渲染前知道答案。
- Accidental：多个入口各自认为自己该启动；`App.vue:23` 不 await 却会写状态，与守卫的 await 形成竞态；`initPromise` 是补丁。

### 具体改动
1. `stores/user.ts`：
   - 增加显式加载态 `bootstrapped: ref(false)`；`initUser` 以 `bootstrapped` 为幂等条件，而非 `currentUser`。
   - 把单一 `isLoading` 拆为 `isBootstrapping`（会话初始化）与 `pending`（`logout` / `updateProfile` / `uploadAvatar` 各自的操作态）。
2. `App.vue`：删除 `userStore.initUser()` 调用（交给守卫）。
3. `Navigation.vue`：删除 `onBeforeMount` 中的 `initUser()` 调用；登出按钮的 loading 改用 `pending.logout`。
4. `router/index.ts`：守卫对所有路由确保会话就绪（首次进入时 await 一次），`requiresAdmin` 分支只做权限判断。
5. `OAuthCallback.vue`：保持经 `handleOAuthCallback` 刷新用户，但改为复用 `bootstrapped` 标记。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 冷启动（未登录）刷新首页 → 不重复请求 `/api/auth/me`（Network 面板确认 1 次）。
  2. 冷启动（已登录）→ 1 次 `/api/auth/me`，导航栏正确显示头像。
  3. 直接访问 `/article/new`（未登录）→ 被重定向到 `/`。
  4. 直接访问 `/article/new`（管理员）→ 正常进入编辑器。
  5. 上传头像过程中，导航栏登出按钮**不显示**"登出中..."。
  6. 登出过程中，登出按钮显示 loading。
  7. 完整 OAuth 回调流程 → 登录成功并跳转首页。

### 收益
- 消除 `initPromise` 补丁与 2 处重复初始化调用；启动请求从最多 3 次降到 1 次。
- 修复 `isLoading` 误用的可观测 bug。

### 风险
**低-中**。首屏多一个 await（可由骨架屏覆盖）。主要风险是守卫范围扩大后对 `/login`、`/auth/callback` 等公开路由的阻塞 —— 需确保这些路由在会话请求失败时仍可访问。

---

## 步骤 7：统一 Markdown 渲染与目录大纲

### 问题
目录由三个互不知情的环节协作：用**模块级可变计数器**生成 id → 用**正则解析已渲染 HTML** 反推标题 → 存进全局 store 再传回组件。同一次渲染 `renderMarkdown` 被调用两次，靠"重置计数器"这一巧合保持一致。

### 证据
- `ArticleDetail.vue:83` `markedRenderer` 是**模块级单例**，`81` `let headingIndex = 0` 同样是模块级 —— 跨文章/跨实例共享。
- `renderedContent`(76-79) 与 `loadArticle`(152) 各调用一次 `renderMarkdown`。
- `ArticleDetail.vue:110-122` `extractHeadings` 用正则 `<h([1-3])\s+id="(heading-\d+)"[^>]*>(.*?)</h\1>` 在 `DOMPurify.sanitize` **之后**的 HTML 上反解析，依赖 sanitize 保留 `id` 属性；`106` 的 `FORBID_TAGS` 一变目录可能静默失效。
- 状态经 `stores/article.ts:6` 全局存储，`Home.vue:140` 读取后作为 prop 传给 `TableOfContents.vue:35`。
- `Home.vue:192` 用 `route.name === '文章详情'`（`router/index.ts:33` 的中文字面量）做显示条件 —— 重命名路由即破坏目录。
- `TableOfContents.vue:111` 用 `document.getElementById(h.id)` 跨组件查找 DOM。
- `ArticleEditor.vue:75-80` 有一份独立的 `DOMPurify` 预览渲染，与 `ArticleDetail` 的 sanitize 配置**不同**（编辑器未设 `FORBID_TAGS`）。

### 当前 Owner / 理想 Owner
- 当前：`ArticleDetail`（id 生成 + 反解析）+ `stores/article`（全局传递）+ `Home.vue`（可见性判定）+ `TableOfContents`（消费）。
- 理想：一个 markdown 渲染服务一次调用返回 `{ html, headings }`，headings 在生成时直接收集；状态为父子关系，不入全局 store。

### 复杂度根源
- Essential：Markdown 标题需要锚点 id，目录需要跟随滚动高亮。
- Accidental：把"生成时的元数据"丢弃后从 HTML 猜回来；用全局 store 传递纯父子数据；用路由中文名做显示条件。

### 具体改动
1. 新建 `frontend/src/utils/markdown.ts`：导出 `renderArticle(content): { html: string; headings: TocHeading[] }`。renderer 的 `heading()` 在返回标签时**同时 push 到 headings**，id 用稳定序号（每次调用内部局部计数，不用模块级变量）。
2. sanitize 配置集中为一个常量（`FORBID_TAGS: ['style','form','input','iframe','object','embed']`），`ArticleDetail` 与 `ArticleEditor` 共用。
3. `ArticleDetail.vue`：删除 `headingIndex`/`markedRenderer`/`extractHeadings`，改为调用 `renderArticle` 一次并保存 `headings`；`renderedContent` 改为基于已渲染结果，避免二次渲染。
4. 目录状态传递：`ArticleDetail` 把 `headings` 提供给 `Home.vue`。由于二者跨组件树（`Home.vue` 的 `left` 栏 vs `main` 栏的 router-view），采用 `provide/inject`（`Home.vue` provide 一个 `tocSlot`，`ArticleDetail` inject 并写入）**替代**全局 store，或保留 `articleStore` 但删除 `stores/article.ts` 之外的反解析逻辑。
   - **决策点**：若 `provide/inject` 在 `<router-view>` + `<transition>` 下注入链断裂，则**保留 `articleStore`**，仅删除反解析与二次渲染。以实测为准，不要为架构纯洁性引入脆弱机制。
5. `Home.vue:192` 的 `showToc` 改为基于路由 meta（`router/index.ts` 给详情路由加 `meta: { toc: true }`）。
6. `stores/article.ts`：若采用 inject 方案则删除该文件，否则保留。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 打开任意文章 → 目录正确列出 h1~h3，层级样式正确。
  2. 点击目录项 → 平滑滚动到对应标题。
  3. 滚动正文 → 目录高亮跟随。
  4. 从文章 A 导航到文章 B → 目录**完全替换**，无 A 的残留标题。
  5. 目录项文本被截断时 hover → 自定义 tooltip 正常定位。
  6. 编辑器 Markdown 预览仍正常且**不执行脚本**（粘贴 `<script>` 或 `<img onerror>` 验证）。
  7. 非文章详情页 → 不显示目录。

### 收益
- `renderMarkdown` 调用 2 → 1；删除正则反解析（13 行）与模块级可变计数器 1 个。
- DOMPurify 配置 2 份 → 1 份（消除编辑器 sanitize 更宽松的隐患）。
- 目录失效风险从"sanitize 配置耦合"变为"无"。

### 风险
**低**。改动局部。唯一设计风险是 `provide/inject` 在嵌套 router-view + transition 下的可靠性，已在改动项 4 给出回退方案。

---

## 步骤 8：统一外观下发通道（主题/圆角）

### 问题
全局外观状态由三条互不相同的机制下发到 CSS，且圆角值有三份不一致的定义。

### 证据
1. `data-theme` 属性：`stores/theme.ts:15,24` + 5 个 CSS 文件（`dark.css:1`、`red.css:1`、`blue.css:1`、`pink.css:1`、`green.css:1`）。
2. `style.setProperty` 内联变量：`stores/radius.ts:40-42` 写 `--radius-small/medium/large`；`Navigation.vue:109` 写 `--scroll-ratio`。
3. 每帧 `getComputedStyle` 反读：`useWaveAnimation.ts:47-49`、`MusicPlayer.vue:1223`。
- **值不一致（可见 bug）**：`stores/radius.ts:5-7` 定义 `4/8/12`、`8/12/16`、`12/16/20`，而 `Settings.vue:76-78` 的预览硬编码 `4px`/`10px`/`18px` —— 用户看到"平衡 10px"但实际 `--radius-small` 是 8px。
- `stores/radius.ts:26-38` 用 `switch` 三档在 JS 中维护映射表，CSS 完全可以用属性选择器表达。
- `useWaveAnimation.ts:47` 与 `MusicPlayer.vue:1223` 每帧调用 `getComputedStyle`（强制样式重算）。

### 当前 Owner / 理想 Owner
- 当前：theme store、radius store、Navigation 组件、两个 canvas 消费者各自直接操作 DOM/读取样式。
- 理想：外观 store 只维护 `theme`/`radius`，以 `data-*` 属性写入 `<html>`；所有派生值由 CSS 表达；canvas 消费者订阅主题变更并缓存解析结果。

### 复杂度根源
- Essential：主题色与圆角确实需要从 JS 影响 CSS。
- Accidental：三种下发方式并存；JS 承担了本该属于 CSS 的映射工作；常量三处硬编码。

### 具体改动
1. `stores/radius.ts`：改为只写 `document.documentElement.setAttribute('data-radius', radius)`；删除 `radiusArray` 与 `switch`。
2. `assets/themes/root.css`：新增 `[data-radius="small"|"medium"|"large"]` 三个块，定义 `--radius-small/medium/large`。取值与 `radius.ts:5-7` **一致**（保持现状，不引入圆角视觉变化）。
3. `Settings.vue`：`radiusOptions` 的 `preview` 改为从共享常量导入，消除第三份硬编码。
4. 新建 `composables/useThemeColors.ts`：订阅 theme store，缓存 `--color-primary`/`--bg-secondary` 的 RGB 解析结果。
5. `useWaveAnimation.ts` 与 `MusicPlayer.vue` 的 `drawAudio` 改用该 composable，删除每帧 `getComputedStyle`。
   - **注意**：`MusicPlayer.vue` 的其余部分在步骤 15/16 处理，本步只替换颜色读取，避免与后续步骤冲突。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 设置页切换三种圆角 → 卡片/按钮/导航栏圆角实时变化，且**与预览图示一致**。
  2. 刷新页面 → 圆角偏好保持。
  3. 切换 5 种主题色 → 全局配色变化；首页波浪 canvas 与音乐播放器频谱**同步**变色（验证缓存失效正确）。
  4. 三个圆角档位的实际像素值在改动前后**逐一对照**（用 DevTools 检查 `--radius-small` 计算值）。
- **约束**：本步**不改变任何圆角的实际视觉取值**。

### 收益
- CSS 变量写入通道 3 → 1；删除 `radiusArray` + `switch`（约 30 行）。
- 主题/圆角常量重复 3 → 1；修复 `Settings.vue` 预览与实际值不一致的 bug。
- 每帧 `getComputedStyle` 2 → 0。

### 风险
**低**。`[data-radius]` 需要作用于 `:root`，注意 `root.css` 的加载顺序（`main.ts:9-14` 中 `root.css` 在最前，主题色文件在其后）。

---

## 步骤 9：收敛时间段概念为纯函数

### 问题
一天的分段逻辑在同一文件内写了三份，边界常量 `5/9/12/14/18/22` 重复三遍。

### 证据
- `RightSidebar.vue:216` `type Period` + `229-300` `SCENES` 配置。
- `RightSidebar.vue:302-310` `getPeriod(hour)` —— 第一份边界逻辑。
- `RightSidebar.vue:337-351` `if/else if` 链（7 分支）初始化 `timeTips` —— 第二份。
- `RightSidebar.vue:361-384` 第二份 `if/else if` 链（7 分支，含 `prev`/`cur` 跨段判断）—— 第三份。
- `RightSidebar.vue:392` `setInterval(updateTime, 1000)`，而 `updateTime`（353-385）每秒重复判断时段。
- `RightSidebar.vue:335,365-383` `lastDate` ref 的唯一作用是记录"上次提示所属时段" —— 是全部复杂度的物证。
- `RightSidebar.vue:337` 的初始化 `if` 在 `<script setup>` **顶层**执行（不在 `onMounted`），依赖 `new Date()`，与 `onMounted` 的 `setInterval` 形成隐式时序。
- 另有 `useBackgroundAnimation.ts:29` 用固定 `15000` 毫秒切换壁纸，是第三个与时间相关但互不相通的机制。

### 当前 Owner / 理想 Owner
- 当前：`RightSidebar.vue` 内部三份逻辑。
- 理想：`composables/useTimePeriod.ts` 导出 `{ period, label, tip, onPeriodChange }`，内部只有一个边界表与一个 ticker。

### 复杂度根源
- Essential：不同时段显示不同风景与问候语；问候语应在**跨段时**更新。
- Accidental：`getPeriod` 已返回权威 `Period`，`updateTime` 却用裸数字再判一遍；初始化路径与运行路径是两套写法。

### 具体改动
1. 新建 `composables/useTimePeriod.ts`：
   - 时段边界表 `[{ until: 5, period: 'deep-night' }, ...]`（单一来源）。
   - `periodOf(date): Period` 纯函数。
   - `TIP_BY_PERIOD: Record<Period, string>` 映射。
   - `useTimePeriod()` 返回 `{ time, period, tip }`，内部每 30 秒 tick（**不需要每秒判段**），仅在 `period` 变化时更新 `tip`。
2. `RightSidebar.vue`：删除 `getPeriod`、两份 `if` 链、`lastDate`、顶层初始化逻辑；时间显示字符串继续每秒刷新（保留 `time` 的秒级 tick，但时段判定改为派生）。
   - 实现方式：composable 内部 `time` 每秒更新（仅字符串），`period` 由 `time` 派生，`tip` 仅在 `period` 变化时写 —— 用 `watch(period)` 替代 `prev/cur` 比较。
3. 壁纸切换：本步**不动** `useBackgroundAnimation.ts`（其 15000ms 间隔的语义待定，不强行与时段耦合）。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 右侧栏时钟每秒跳动、格式 `HH:mm:ss`。
  2. 风景 SVG 与时段匹配（可用 DevTools 改系统时间或临时改 `Date` 验证边界）。
  3. 逐个边界核对：`04:59→05:00`、`08:59→09:00`、`11:59→12:00`、`13:59→14:00`、`17:59→18:00`、`21:59→22:00`、`23:59→00:00`，风景与问候语均在跨段时切换一次。
  4. 未跨段时问候语**不刷新**（当前行为：仅在跨段时更新）。
  5. 离开首页再返回 → 组件正常挂载，`setInterval` 无泄漏（重复进出 5 次观察计时器数量）。

### 收益
- 边界常量 3 份 → 1；7 分支 `if` 链 2 条 → 0（改查表）。
- 删除 `lastDate` ref 与顶层副作用；`updateTime` 从 33 行降至约 5 行。

### 风险
**低**。行为可逐边界对照验证。注意保持"仅跨段时更新问候语"的现有行为，不要退化为每秒重置。

---

## 步骤 10：表格化音乐服务，删除 Prisma 回退路径

### 问题
`music.service.ts` 对已存在的 Prisma 模型使用 `@ts-ignore` 并保留原始 SQL 回退，用字符串匹配判断表是否存在。

### 证据
- `Prisma schema:55-71` 明确**已定义** `Music` 模型（映射 `musics` 表）。
- `music.service.ts:22-40`：`// @ts-ignore` + `prisma.music.findMany` + `catch` 后 `$queryRaw` 回退。
- `music.service.ts:41-49`：`error.message.includes("doesn't exist")` / `includes('不存在')` 判断表缺失并 `return []`。
- `music.service.ts:58-81` `getMusicById` 复制同一结构。

### 当前 Owner / 理想 Owner
- 当前：service 内两套查询机制并存 + 字符串错误匹配。
- 理想：直接用 Prisma；错误交给统一错误处理。

### 复杂度根源
- Essential：无（模型已存在）。
- Accidental：历史遗留的猜测性防御，从未清理。

### 具体改动
1. `music.service.ts`：删除 `@ts-ignore`、`$queryRaw` 回退、字符串错误匹配。
2. `getMusicList` 改为直接 `prisma.music.findMany({ orderBy: { id: 'asc' } })`。
3. `getMusicById` 改为直接 `prisma.music.findUnique({ where: { id } })`，返回类型与现有 `MusicItem` 对齐（必要时补字段映射）。
4. 检查 `backend/controllers/music.controller.ts` 是否依赖"返回空数组"的行为 —— 若是，保留在 controller 层的空数组兜底。

### 验证
- `npx tsc --noEmit` exit 0（`@ts-ignore` 删除后类型错误会暴露真实问题）。
- **人工回归**：`GET /api/music/getMusicList` 返回与改动前**逐字段一致**（对比 `id/title/author/album/mainColor/language/isTranslate/format`）。
- 前端音乐播放器能正常加载列表（这一步只验证播放器**仍能读到数据**，不涉及播放逻辑）。

### 收益
- 删除 2 处 `@ts-ignore`、2 段重复 SQL、1 处字符串错误匹配。

### 风险
**低**。若 DB 中 `musics` 表结构与 Prisma 模型不符，本步会**暴露**该事实 —— 这本身是收益。

---

## 步骤 11：布局所有权移交 CSS

### 问题
响应式布局由 JS 与 CSS 各实现一遍，断点常量散落 5 处，且 JS 的计算结果被 CSS 丢弃；`RightSidebar` 为适配两栏/三栏被挂在两个 DOM 位置。

### 证据
- JS：`Home.vue:184-189`（`windowWidth` + resize 监听）、`195-205`（`effectiveLayout`）、`208`（`showRight`）、`211`（`showRightInLeft`）。
- CSS：`Home.vue:467-480`（`.layout-2`/`.layout-3`/`.layout-2 .right{display:none}`）、`483-556`（`@media (max-width:768px)` 覆盖 grid areas 与 `.right` 显示）。
- 模板：`Home.vue:139-151` 中 `RightSidebar` 出现**两次**（`v-if="showRightInLeft"` 与 `v-if="showRight"`）。
- `Home.vue:197-198` 注释自述："手机屏幕，CSS会强制单栏，但布局值保持用户选择（不影响）" —— 承认该分支无作用。
- 断点 `768` 在 `195`、`201`、`208`、`211` 及 CSS `483` 各出现一次。
- **副作用**：`RightSidebar` 双挂载点导致布局切换时组件卸载重建，`RightSidebar.vue:391-400` 的 `setInterval` 与 `loadSidebarData()` 重跑（重复请求）。

### 当前 Owner / 理想 Owner
- 当前：JS computed 与 CSS media query 共同决定布局。
- 理想：布局只由 CSS 拥有；JS 唯一职责是把用户偏好写成一个 `data-layout` 属性。

### 复杂度根源
- Essential：三种布局（手机单栏、平板两栏、桌面两/三栏用户可选）。
- Accidental：两套并行逻辑 + 断点常量重复；JS 输出被 CSS 覆盖。

### 具体改动
1. `Home.vue:33`：`<div class="layout" :class="`layout-${effectiveLayout}`">` 改为 `<div class="layout" :data-layout="layoutStore.layout">`。
2. 删除 `windowWidth`（184）、`updateWindowWidth`（187-189）、`effectiveLayout`（195-205）、`showRight`（208）、`showRightInLeft`（211）以及 `onMounted`/`onBeforeUnmount` 中的 resize 监听（222、228）。
3. CSS：
   - `.layout` 默认按 `data-layout="3"` 三栏；`[data-layout="2"]` 两栏。
   - `@media (max-width: 1024px)` 强制两栏；`@media (max-width: 768px)` 强制单栏。
   - 删除 `.layout-2 .right{display:none}` 这类由 JS 决策残留的规则，改为 grid area 统一布局。
4. `RightSidebar` 改为**单一挂载点**，位置由 grid area / `order` 决定。
   - **实现要求**：两栏模式下右栏内容需出现在左栏下方（当前是靠 `showRightInLeft` 挂到 `.left` 里实现的）。用 `grid-template-areas` 或 `order` 实现，**必须实测**。
5. 保留 `layout` store（用户偏好仍由它持有）。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**（三档布局 × 三档视口 = 9 组合逐一核对）：
  1. 桌面宽屏 + 偏好三栏 → 左/中/右三栏。
  2. 桌面宽屏 + 偏好两栏 → 左/中两栏，**右侧栏内容出现在左栏下方**。
  3. 视口 1024px 以下 → 强制两栏（与偏好无关）。
  4. 视口 768px 以下 → 单栏，顺序为 主内容 → 左栏 → 右栏（与当前 `grid-template-areas: "main" "left" "right"` 一致）。
  5. 拖动窗口跨过 1024 / 768 断点 → 布局实时切换，**无重复网络请求**（Network 面板确认 `RightSidebar` 未重新请求 `/api/stats`）。
  6. `RightSidebar` 的时钟与风景在布局切换后**不重置**（验证未重挂载）。
  7. 设置页切换两栏/三栏 → 立即生效并持久化。

### 收益
- 断点定义 5 处 → 2（两处 media query）；删除 5 个 computed/ref + 1 个 resize 监听。
- 消除 `RightSidebar` 重复挂载：每次布局切换省 2 个网络请求 + 1 个 interval 重建。
- `Home.vue` 从 706 行降至约 640 行（本步不拆组件）。

### 风险
**中**。改动 5 的风险最高：两栏模式下右栏内容的 DOM 位置必须实测。若 grid area 方案无法达成，则恢复"两个挂载点"但**用 `v-show` 而非 `v-if`** 以避免重挂载（退一步的收益仍成立）。

---

## 步骤 12：引入文章查询协调器

### 问题
"文章列表"语义在三个视图各自实现状态机；`Articles.vue` 已造出正确模型（路由 query 为唯一编排者）但未推广。

### 证据
- `Articles.vue:66-138`：`articles`/`pagination`/`loading`/`error`/`sort`/`page`/`tag` + `loadArticles` + `applyQuery`。
- `Articles.vue:128-138`：`onMounted(applyQuery)` **与** `watch(route.query, applyQuery)` 并存（注释自承认是"避免重复请求"的补丁）。
- `ArticleDetail.vue:59-166`：独立的 loading/error 三件套；`watch(articleId)` + `onMounted(loadArticle)` 双触发。
- `Home.vue:192`：`showToc` 用 `route.name === '文章详情'`（中文路由名）。
- 提交 `e514a1d`、`cd7be84` 同时改动这三个文件。

### 当前 Owner / 理想 Owner
- 当前：三个视图各自持有列表状态。
- 理想：`useArticleQuery()` 以路由 query 为唯一状态源，视图只绑定。

### 复杂度根源
- Essential：列表需要分页、排序、标签过滤并反映在 URL。
- Accidental：三处独立实现；重复触发路径；用中文路由名做判定。

### 具体改动
1. 新建 `frontend/src/composables/useArticleQuery.ts`：
   - 从 `route.query` 派生 `{ page, sort, tag }`。
   - 暴露 `{ articles, pagination, loading, error, sort, page, tag, setSort, setPage, setTag, reload }`。
   - 内部用单个 `watch(() => route.query, load, { immediate: true })` 触发加载（避免 `onMounted` + `watch` 双触发）。
   - 支持 `keepPreviousData`（保留旧列表并置 `refreshing` 标志，用于 `Articles.vue` 的 `dimmed` 体验）。
2. `Articles.vue`：删除本地状态与 `loadArticles`/`applyQuery`，改用协调器；保留原有模板结构（含 `dimmed` 类）。
3. `Home.vue:192` 的 `showToc` 改为 `route.meta.toc`；`router/index.ts` 给详情路由加 `meta: { toc: true }`。
4. `ArticleDetail.vue`：本步只**统一其 loading/error 命名与协调器一致**，其数据加载改造留给步骤 13（因为它还涉及浏览计数的副作用分离）。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 进入"文章"页 → 列表加载，URL 无多余 query（或规范化）。
  2. 点"最热" → URL 变为 `?sort=hot&page=1`，列表更新；点"最新"同理。
  3. 翻页 → URL `page` 更新，列表更新，页面滚到顶部。
  4. 右侧栏点标签 → 跳转到 `/articles?tag=xxx`，列表过滤，标签筛选条显示。
  5. 点标签的 ✕ → 清除过滤。
  6. 浏览器后退/前进 → 列表与 URL **同步**（这是 query 方案的核心理由）。
  7. 直接粘贴带 query 的 URL → 正确渲染。
  8. 切换排序/翻页时旧列表**保留并降透明度**（`dimmed` 行为不丢）。
  9. 加载中不产生重复请求（Network 面板每次操作 1 个 `/api/articles` 请求）。

### 收益
- 列表状态 3 套（约 18 个 ref）→ 1 套（6 个）；消除重复请求路径。
- `Articles.vue` 减少约 50 行；`Home.vue` 消除中文路由名耦合。
- 列表相关改动的修改面从 2-3 文件收敛到 1。

### 风险
**中**。关键风险是 `dimmed`（保留旧数据）体验丢失，已在改动项 1 明确要求支持。步骤 11 已完成，本步不再触碰布局。

---

## 步骤 13：浏览计数从 GET 副作用分离

### 问题
`GET /api/articles/:id` 既返回数据又递增浏览数，调用方用 `?view=false` 关闭副作用；为做存在性检查，更新/删除路径也走上这个详情接口并取回整个正文。

### 证据
- `article.service.ts:108-142`：`getArticleById(id, incrementView = true)`，`114-119` 执行写操作，`132` 手工修正返回值 `views: incrementView ? article.views + 1 : article.views`。
- `article.controller.ts:37`：`const incrementView = req.query.view !== 'false'`。
- `article.controller.ts:112`、`158`：`await articleService.getArticleById(id, false)` —— **仅为判断存在性**却取回 `content`（LongText）后丢弃。
- `updateArticle` 随后再查一次（`article.service.ts:211`），`deleteArticle` 再查一次（`244`）→ 一次删除共 5 次查询，其中 3 次可省。
- 前端 `api.ts:198-199` 也要感知该标志：`getArticleById(id, incrementView = true)`。

### 当前 Owner / 理想 Owner
- 当前：`article.service.getArticleById` 的布尔参数 + controller 的 query 标志 + 前端参数。
- 理想：读接口只读；计数是显式命令；存在性用轻量方法。

### 复杂度根源
- Essential：需要统计浏览量且编辑者预览不应计数。
- Accidental：用 HTTP 语义上"安全"的 GET 承载副作用，于是必须发明 `view=false` 这个跨前端/后端/编辑器的标志。

### 具体改动
1. `article.service.ts`：
   - `getArticleById(id)` 改为**纯读**，删除 `incrementView` 参数与写操作、删除 `132` 的手工修正。
   - 新增 `incrementViews(id): Promise<void>`。
   - 新增 `exists(id): Promise<boolean>`（只 `select: { id: true }`）。
   - `updateArticle`/`deleteArticle` 内部的 `findUnique` 改为只取必要字段（`select: { id: true }`，`updateArticle` 若需要 `author_id` 则一并 select）。
2. `article.controller.ts`：
   - `getArticleById` 删除 `incrementView` 逻辑。
   - 新增 `POST /api/articles/:id/views` 处理器（`recordArticleView`）。
   - `updateArticle`/`deleteArticle` 改用 `articleService.exists(id)`。
3. `api.ts`：
   - `getArticleById(id)` 删除 `incrementView` 参数。
   - 新增 `recordArticleView(id)`。
4. `ArticleDetail.vue`：加载成功后调用 `recordArticleView`，并把返回值用于**本地 `views + 1`**（避免为显示而重新请求详情）。
5. `ArticleEditor.vue`：删除 `getArticleById(id, false)` 的第二参数（编辑器不再需要"不计数"语义，因为它不再触发计数）。
6. 兼容期处理：`src/index.ts` 的路由注册新增 `app.post('/api/articles/:id/views', recordArticleView)`。
   - **决策点**：旧 `?view=false` 参数忽略（无行为）。若担忧缓存/CDN 预取，记录但不实现去重。

### 验证
- `npx tsc --noEmit` 与 `npx vue-tsc --build` 均 exit 0。
- **人工回归清单**：
  1. 打开文章详情 → 显示浏览量 +1，DB `views` 递增。
  2. 刷新详情页 → 再次 +1（预期行为，与改动前一致）。
  3. 打开文章**编辑器** → 浏览量**不变**。
  4. 保存编辑 → 成功；`GET` 请求中**不含正文丢失**（详情仍正常显示 content）。
  5. 删除文章 → 成功；删除前不存在性检查未取回正文（可用后端日志或 DB query log 确认）。
  6. 站点统计卡片的浏览总数正确（`stats.service` 独立聚合，应同步递增）。
- **性能对照**：删除操作的 SQL 查询数应从 5 降到 2。可用 Prisma query log（`config/database.ts:5` 在 development 已开启 `query` 日志）核对。

### 收益
- 消除 `incrementView` 布尔分支（后端 2 处 + 前端 2 处）。
- 删除/更新路径查询数 5 → 2；消除"返回值需手工 +1 修正"的易错逻辑。
- GET 恢复幂等语义（可被安全重试/预取）。

### 风险
**中**。前端需两步配合（加载后再报计数），改造期间若只改后端而前端仍传 `?view=false`，计数会**静默丢失**。因此本步必须在**同一次提交**内同时改后端与前端。

---

## 步骤 14：提取共享格式化与标签工具

### 问题
日期格式化 5 处、标签解析 2 处、加载/错误/空态模板 4 处各自实现。

### 证据
- 日期：`ArticleCard.vue:50-56` 与 `ArticleDetail.vue:137-143` **逐字相同**；另有 `CommentBox.vue:281-300`（相对时间）、`User.vue:292-299`、`Footer.vue:23-27`。
- 标签：`ArticleCard.vue:43` 与 `ArticleDetail.vue:68` 逐字相同（`split(',').map(t=>t.trim()).filter(Boolean)`）。
- 三态模板：`Articles.vue:25-37`、`ArticleDetail.vue:3-8`、`User.vue:8-13`、`ArticleEditor.vue:7-8`。
- `CommentBox.vue:268`：`document.querySelector('.comment-textarea')?.getBoundingClientRect().top! + window.scrollY` —— 跨组件 DOM 查询 + 非空断言。

### 具体改动
1. 新建 `frontend/src/utils/format.ts`：`formatDate`（YYYY-MM-DD）、`formatDateLong`（zh-CN locale，供 `User.vue`）、`formatRelativeTime`（供 `CommentBox`）。统一 `ArticleCard`/`ArticleDetail`/`User`/`CommentBox` 使用。
2. 新建 `frontend/src/utils/tags.ts`：`parseTags(raw: string | null): string[]`，替换 2 处解析。
3. `CommentBox.vue:268`：改为使用模板 ref（给 textarea 加 `ref`）并做空值保护，删除 `querySelector` 与非空断言。
4. 三态模板抽取：**本步只做前 3 项**。三态组件化涉及 4 个视图的模板改写，收益低于风险，标记为「暂缓」并在执行记录中说明理由。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 首页/文章卡片/文章详情的日期格式与改动前**逐字一致**（`YYYY-MM-DD`）。
  2. 个人中心 `created_at`/`updated_at` 仍为 `zh-CN` 长格式。
  3. 评论区时间显示"刚刚/N分钟前/N小时前/N天前/YYYY-MM-DD HH:mm"各分支正确（可临时构造时间戳验证）。
  4. 点击评论"回复" → 页面平滑滚动到输入框，位置与改动前一致；输入框不存在时**不抛错**。
  5. 带多个标签（含空格、空项，如 `"a, b, ,c"`）的文章 → 标签渲染为 3 个。

### 收益
- 日期格式化 5 → 3 个具名函数（且 `ArticleCard`/`ArticleDetail` 共用 1 个）；标签解析 2 → 1。
- 删除 1 处跨组件 DOM 查询与非空断言。

### 风险
**低**。纯提取。注意 `CommentBox` 的相对时间逻辑有 5 个分支，必须逐一对照。

---

## 步骤 15：MusicPlayer 状态收敛（阶段一：只读订阅）

### 问题
真实播放状态活在 `<audio>` DOM 元素中，代码同时维护 ref 镜像、DOM 内联样式、localStorage 快照、MediaSession 四套副本。

### 证据（阶段一相关部分）
- MediaSession 位置同步由 **5 处**分别调用：`handleTimeUpdate`(1015)、`handleLoadedMetadata`(926)、`seekFromMediaSession`(618)、`handleMediaSessionPlay/Pause`(670,675)。
- localStorage 写入点 **6 处**：`415, 711, 723, 829, 844, 1003, 1314`。
- `saveMusicState`(357-372) 每次写 7 个字段；`lastTimeSave`(995) 在 `handleTimeUpdate` 中做 5 秒节流。
- `resumeTime`(383)/`resumePaused`(384) 为恢复缓存而存在的临时旗标；`709-712` 注释自述"恢复缓存进度期间不保存状态，避免覆盖缓存中的播放时间"。
- `487-489`：恢复展开状态靠**合成调用 `toggleMusicBox()`** 而非赋值。
- `volumeTipTimer`(776) 在 `onUnmounted`(1319-1356) **未清理**（同函数清理了 `userScrollTimer`）。

### 阶段一目标（只做"写入口收敛"，不改播放控制逻辑）
1. **持久化收敛**：删除 6 处 `saveMusicState()` 调用，改为一个 `watch`（`{ deep: true }` 或对具体字段）+ 防抖，统一持久化。
2. **MediaSession 收敛**：删除 4 处手工调用，改为对 `currentTime`/`isPlaying`/`currentMusic` 的 `watch`，内部调用 `updateMediaSessionPosition`。
3. **恢复逻辑去合成化**：`487-489` 直接设置 `isMusicBoxOpen` 状态（并同步 DOM transform），不再调用 `toggleMusicBox()`。
4. **定时器与资源清理**：`onUnmounted` 补齐 `volumeTipTimer` 清理；`AudioContext` 改为懒创建（首次播放时），避免 setup 期即创建（`1162`）。
5. `currentTime` 与 `resumeTime` 的关系用注释显式化；本阶段**不删除** `resumeTime`（留待阶段二）。

### 验证
- `npx vue-tsc --build` exit 0。
- **人工回归清单**：
  1. 播放一首歌 → 系统媒体面板（Windows SMTC）显示曲名/艺术家/封面。
  2. 用系统媒体键 播放/暂停/上一首/下一首/快进/快退/拖动 → 页面同步。
  3. 拖动页面进度条 → 系统面板进度同步。
  4. 调整音量 → localStorage 中的 `volume` 更新（DevTools 查看）。
  5. 播放 30 秒后刷新页面 → 从缓存进度附近恢复，且**不从头播放**、**不被 5 秒节流覆盖为 0**。
  6. 刷新后音乐盒展开状态与刷新前一致，且**图标旋转方向正确**。
  7. 切换音量 → 3 秒后提示消失；离开页面（卸载组件）后定时器不残留（重复进入 5 次观察）。
  8. 播放模式（顺序/单曲/随机/播完即止）逐个验证，刷新后模式保持。
  9. 歌词滚动、翻译切换、频谱动画正常。

### 收益
- `saveMusicState` 调用点 6 → 1；MediaSession 同步点 5 → 1 组 watch。
- 删除 1 个合成调用；修复 2 个资源泄漏。

### 风险
**中**。`watch` 触发频率需控制（进度更新很频繁），必须配合防抖/节流，否则 localStorage 写入会显著增加。**不要在本步改动播放控制流**（`switchMusic`/`loadMusic`/`handleAudioEnded`），以隔离风险。

---

## 步骤 16：MusicPlayer 引擎化（阶段二：单一状态源）

### 问题
播放状态有 4 个并行存储且需手工双向同步，导致补丁链与复制粘贴取反的 bug。

### 证据
- **复制粘贴取反 bug**：`407` 与 `1267` 写同一个 `musicBox.style.transform` 表达式，布尔条件相反：`407` 用 `isMusicBoxOpen ? translateX(800*scale) : translateX(0)`，`1267` 用 `!isMusicBoxOpen ? translateX(800*scale) : translateX(0)`。
- **命令式 DOM 样式写入**：`progressDot.style.left`(889)、`progressBar.style.width`(893)、`musicBox.style.transform`(407,1267)。
- **语义丢失后用时间补偿**：`1114` 注释"下策：程序滚动也会触发滚动事件，所以等待滚动完设置用户正在滚动状态为false"，用 500ms 定时器区分程序滚动与用户滚动（`1115-1120`）；配套 `handleLyricsScroll`(1076-1089) 的 5 秒 `userScrollTimer`。
- **状态副本**：`currentTime`(872)、`duration`(873)、`volume`(773)、`bufferedRanges`(874)、`displayDuration`(875)、`isDraggingProgressDot`(870) 均为 `<audio>` 的镜像；`isDraggingProgressDot`(1006) 的存在是为了防止镜像互相覆盖。
- **通信机制重复**：`459`、`523` 直接 `fetch`，绕过 `utils/api.ts`（全仓 `fetch(` 共 7 处，5 处在 `api.ts`）。
- 规模：1961 行（模板 320 / 脚本 1035 / 样式 602）。

### 目标架构
抽取 `composables/usePlayerEngine.ts`（或独立 service）：
- 单一状态快照 `{ trackId, position, duration, volume, mode, isPlaying, isExpanded, isTranslated }`。
- `<audio>` 事件仅作为 **reducer 输入**（`audio → dispatch`），绝不被直接读为真源。
- MediaSession / 进度条 / localStorage / 频谱均为**订阅者**，从同一快照派生。
- 进度条与音乐盒动画改为 `:style` 绑定，删除所有命令式 `element.style` 写入。
- "展开/收起""翻译""播放模式"为状态字段的纯函数映射，消除 407/1267 的重复与取反。

### 分阶段执行（每阶段一次提交）
- **16a**：抽取引擎与状态快照，`<audio>` 事件改为 dispatch；保持现有 UI 逻辑不变（双轨运行，由引擎驱动 ref）。
- **16b**：进度条/音乐盒 transform 改为声明式绑定，删除命令式 `element.style`。
- **16c**：歌词滚动改为语义化（用滚动事件来源标记或 `scrollend`/`isTrusted` 替代 500ms/5s 定时器）。
- **16d**：`fetch` 改走 `api.ts`；`MUSIC_STATE_KEY` 的恢复改为引擎初始化。

### 验证（每阶段均需）
- `npx vue-tsc --build` exit 0。
- 复用步骤 15 的完整回归清单（1-9 项），**每阶段全部重跑**。
- 额外断言：
  1. 拖动进度条时不因 `timeupdate` 覆盖而抖动（对应 `isDraggingProgressDot` 的原始目的）。
  2. 拖动进度条后**不被** localStorage 恢复逻辑回退。
  3. 点歌词跳转 → 跳转后自动滚动**恢复**（验证 16c 未破坏该行为）。
  4. 用鼠标滚轮手动滚动歌词 → 5 秒内不被自动滚动打断。
  5. 频谱动画在播放时运行、暂停时停止（不持续耗 CPU）。
  6. 音乐盒展开/收起在**窗口 resize 前后**位置一致（对应 407/1267 取反 bug）。
- **能力差异**：Firefox/Safari 的 `mediaSession` 部分 API 不可用，`registerMediaSessionAction`(621-627) 的 try/catch 必须保留。

### 收益
- 状态副本 4 → 1；命令式 DOM 样式写入约 8 处 → 0；
- 消除 `resumeTime`/`resumePaused`/`lastTimeSave`/`isDraggingProgressDot` 4 个协调旗标中的至少 3 个；
- 消除 500ms + 5s 两个"语义补偿"定时器；
- 间接修复 407/1267 的 transform 取反 bug。
- 脚本从 1035 行预计降至约 600 行。

### 风险
**高**（全仓最高）。缓解措施：
- 严格遵守 16a→16d 分阶段，每阶段独立提交、独立回归。
- `AudioContext.createMediaElementSource` 对同一元素**只能调用一次**（`1296`），引擎化后必须确保不重复创建（否则静默无声）。
- 浏览器自动播放策略：`loadMusic`(686) 的 `play().catch(() => {})` 语义必须保留。
- **若 16a 完成后发现收益不抵风险**（例如引擎抽象未能真正减少状态副本），允许在 16a 提交后**停止**，把 16b-16d 标记为「评估后放弃」并记录原因。这是有意的止损点。

---

## 故意排除的项（不纳入执行）

以下项在审查中被识别但**明确不做**，原因记录在此以避免反复讨论：

| 项 | 原因 |
|---|---|
| `tags` 从逗号串迁移到关系表 | 需要 DB schema 迁移与数据回填，属于独立专项，风险与本次重构不同量级 |
| 删除/更新接口的错误策略统一（`getTopArticles` 吞异常） | 行为变更风险高于收益；先在步骤 5 加注释标记 |
| `vite.config.ts:79-95` 的四个恒等 `rewrite` | 无功能影响，删除会改变 proxy 配置表面；标记为已知无害冗余 |
| `ArticleEditor.vue:90-113` 的 `submitIntent` 标志 | 有效但丑陋；行为正确，改动收益低。若步骤 5 触及该文件的错误处理则一并评估 |
| 三态加载/错误模板组件化（步骤 14 第 4 项） | 涉及 4 个视图模板改写，收益低于风险 |
| `backend/dist` 的目录结构导致 `__dirname/../public` 路径耦合 | 涉及构建/部署配置，需单独验证生产部署 |

---

## 执行记录

| 步骤 | 提交 | 日期 | 备注 |
|---|---|---|---|
| 0 | `726b17e` | — | 建立规划文档（833 行） |
| 1 | `c394a7d` | — | 删除 4 个聚合/死配置文件。`auth.service.ts` 的 `require()` 动态导入 hack 一并改为静态导入（同一腐烂模式）。类型检查通过。 |
| 2 | `待填` | — | 删除 `MusicBox.vue`（310 行，自述废弃）。执行中发现审查报告关于 `backend/dist` 被跟踪的判断有误，已在文档中更正 —— 实际 `git ls-files '*.js'` 为 0。 |

> 每步完成后在此表追加一行：步骤号、commit hash、日期、实施中的偏差或发现。

<template>
  <div class="comment-box">
    <div class="comment-header">
      <span class="comment-title">评论</span>
      <div class="comment-sort">
        <Button :type="sortBy === 'time' ? 'primary' : 'outline'" @click="sortBy = 'time'; loadComments()">最新</Button>
        <Button :type="sortBy === 'hot' ? 'primary' : 'outline'" @click="sortBy = 'hot'; loadComments()">最热</Button>
      </div>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-input-area">
      <template v-if="userStore.isAuthenticated">
        <div class="input-header">
          <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" class="input-avatar" />
          <div v-else class="input-avatar placeholder">
            {{ userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <span class="input-username">{{ userStore.currentUser?.username }}</span>
        </div>
        <textarea v-model="newComment" class="comment-textarea"
          :placeholder="replyTarget ? `回复 @${replyTarget.username}：` : '写下你的评论...'" rows="3"
          maxlength="2000"></textarea>
        <div class="input-footer">
          <span class="char-count">{{ newComment.length }}/2000</span>
          <div class="input-actions">
            <button v-if="replyTarget" class="cancel-reply-btn" @click="cancelReply">取消回复</button>
            <button class="submit-btn" :disabled="!newComment.trim() || submitting" @click="submitComment">
              {{ submitting ? '提交中...' : '发布评论' }}
            </button>
          </div>
        </div>
      </template>
      <div v-else class="login-hint">
        <span>请</span>
        <router-link to="/login" class="login-link">登录</router-link>
        <span>后发表评论</span>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="comments.length === 0" class="empty">暂无评论，快来抢沙发吧~</div>
    <div v-else class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-main">
          <img v-if="comment.user.avatar" :src="comment.user.avatar" class="comment-avatar" />
          <div v-else class="comment-avatar placeholder">
            {{ comment.user.username.charAt(0).toUpperCase() }}
          </div>
          <div class="comment-body">
            <div class="comment-user">
              <span class="username">{{ comment.user.username }}</span>
              <span class="time">{{ formatTime(comment.created_at) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <button :class="['action-btn', { active: comment.user_reaction === 'like' }]"
                @click="toggleReaction(comment, 'like')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z" />
                </svg>
                <span>{{ comment.likes_count }}</span>
              </button>
              <button :class="['action-btn', 'dislike', { active: comment.user_reaction === 'dislike' }]"
                @click="toggleReaction(comment, 'dislike')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zm-7 7h3v-11H3v11z" />
                </svg>
                <span>{{ comment.dislikes_count }}</span>
              </button>
              <button v-if="userStore.isAuthenticated" class="action-btn reply-btn"
                @click="startReply(comment)">回复</button>
            </div>
          </div>
        </div>

        <!-- 回复列表 -->
        <div v-if="comment.replies && comment.replies.length > 0" class="replies">
          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
            <img v-if="reply.user.avatar" :src="reply.user.avatar" class="comment-avatar small" />
            <div v-else class="comment-avatar placeholder small">
              {{ reply.user.username.charAt(0).toUpperCase() }}
            </div>
            <div class="comment-body">
              <div class="comment-user">
                <span class="username">{{ reply.user.username }}</span>
                <span class="time">{{ formatTime(reply.created_at) }}</span>
              </div>
              <div class="comment-content">{{ reply.content }}</div>
              <div class="comment-actions">
                <button :class="['action-btn', { active: reply.user_reaction === 'like' }]"
                  @click="toggleReaction(reply, 'like')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z" />
                  </svg>
                  <span>{{ reply.likes_count }}</span>
                </button>
                <button :class="['action-btn', 'dislike', { active: reply.user_reaction === 'dislike' }]"
                  @click="toggleReaction(reply, 'dislike')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zm-7 7h3v-11H3v11z" />
                  </svg>
                  <span>{{ reply.dislikes_count }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total_pages > 1" class="pagination">
      <button :class="['page-btn', { disabled: pagination.page <= 1 }]" :disabled="pagination.page <= 1"
        @click="goToPage(pagination.page - 1)">上一页</button>
      <span class="page-info">{{ pagination.page }} / {{ pagination.total_pages }}</span>
      <button :class="['page-btn', { disabled: pagination.page >= pagination.total_pages }]"
        :disabled="pagination.page >= pagination.total_pages" @click="goToPage(pagination.page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { commentApi } from '@/utils/api';
import Button from './Button.vue';

interface CommentUser {
  id: number;
  username: string;
  avatar: string;
}

interface Comment {
  id: number;
  content: string;
  user_id: number;
  parent_id: number | null;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  updated_at: string;
  user: CommentUser;
  user_reaction: 'like' | 'dislike' | null;
  replies: Comment[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const props = defineProps<{
  sourceId: string;
  sourceType: string;
}>();

const userStore = useUserStore();

const comments = ref<Comment[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, total_pages: 0 });
const sortBy = ref<'time' | 'hot'>('time');
const loading = ref(false);
const submitting = ref(false);
const newComment = ref('');
const replyTarget = ref<{ id: number; username: string } | null>(null);

const loadComments = async () => {
  loading.value = true;
  try {
    const res = await commentApi.getComments({
      source_id: props.sourceId,
      source_type: props.sourceType,
      page: pagination.value.page,
      limit: pagination.value.limit,
      sort: sortBy.value,
    });
    if (res.success) {
      comments.value = res.comments || [];
      pagination.value = res.pagination || { page: 1, limit: 10, total: 0, total_pages: 0 };
    }
  } catch (err) {
    console.error('加载评论失败:', err);
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  const content = newComment.value.trim();
  if (!content) return;

  submitting.value = true;
  try {
    const res = await commentApi.createComment({
      content,
      source_id: props.sourceId,
      source_type: props.sourceType,
      parent_id: replyTarget.value?.id,
    });
    if (res.success) {
      newComment.value = '';
      replyTarget.value = null;
      // 回到第一页查看最新评论
      pagination.value.page = 1;
      await loadComments();
    }
  } catch (err) {
    console.error('发布评论失败:', err);
  } finally {
    submitting.value = false;
  }
};

const toggleReaction = async (comment: Comment, type: 'like' | 'dislike') => {
  if (!userStore.isAuthenticated) return;

  // 乐观更新
  const prevReaction = comment.user_reaction;
  if (comment.user_reaction === type) {
    // 取消
    comment.user_reaction = null;
    if (type === 'like') comment.likes_count--;
    else comment.dislikes_count--;
  } else {
    // 切换
    if (comment.user_reaction) {
      if (comment.user_reaction === 'like') comment.likes_count--;
      else comment.dislikes_count--;
    }
    comment.user_reaction = type;
    if (type === 'like') comment.likes_count++;
    else comment.dislikes_count++;
  }

  try {
    const res = await commentApi.toggleReaction(comment.id, type);
    if (res.success) {
      comment.likes_count = res.data.likes_count;
      comment.dislikes_count = res.data.dislikes_count;
      comment.user_reaction = res.data.user_reaction;
    }
  } catch (err) {
    // 回滚
    comment.user_reaction = prevReaction;
    if (prevReaction === 'like' || prevReaction === 'dislike') {
      await loadComments();
    }
    console.error('操作失败:', err);
  }
};

const startReply = (comment: Comment) => {
  replyTarget.value = { id: comment.id, username: comment.user.username };
  // 滚动到输入框
  window.scrollTo({ top: document.querySelector('.comment-textarea')?.getBoundingClientRect().top! + window.scrollY - 100, behavior: 'smooth' });
};

const cancelReply = () => {
  replyTarget.value = null;
};

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.total_pages) return;
  pagination.value.page = page;
  loadComments();
};

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
};

onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.comment-box {
  width: calc(100% - 2rem);
  padding: 1rem;
  border-radius: var(--radius-small);
  background-color: var(--bg-primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
}

.comment-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-primary);
}

.comment-sort {
  display: flex;
  gap: 0.25rem;
}

/* 输入框 */
.comment-input-area {
  margin-bottom: 1.5rem;
  padding: 1rem;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.input-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.input-avatar.placeholder {
  background: var(--color-primary);
  color: var(--text-on-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: bold;
  flex-shrink: 0;
}

.input-username {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  resize: vertical;
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--bg-secondary);
  background-image: url('/images/commentBg.png');
  background-repeat: no-repeat;
  background-size: 150px;
  background-position: right 0 bottom 0;
  color: var(--text-primary);
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.cancel-reply-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: var(--radius-small);
  cursor: pointer;
  font-size: 0.85rem;
}

.cancel-reply-btn:hover {
  color: var(--text-primary);
}

.submit-btn {
  padding: 0.4rem 1rem;
  border: none;
  background: var(--color-primary);
  color: var(--text-on-color);
  border-radius: var(--radius-small);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  opacity: 0.85;
}

.login-hint {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  margin: 0 0.25rem;
}

.login-link:hover {
  text-decoration: underline;
}

/* 加载 & 空状态 */
.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.comment-item {
  padding: 1rem 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  display: flex;
  gap: 0.75rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-avatar.placeholder {
  background: var(--color-primary);
  color: var(--text-on-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
}

.comment-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 0.85rem;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.time {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.comment-content {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 0.8rem;
  border-radius: var(--radius-small);
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--color-primary);
  background: var(--bg-secondary);
}

.action-btn.active {
  color: var(--color-primary);
}

.action-btn.dislike:hover,
.action-btn.dislike.active {
  color: #e74c3c;
}

.action-btn.reply-btn {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.action-btn.reply-btn:hover {
  color: var(--color-primary);
}

/* 回复列表 */
.replies {
  margin-left: 3.25rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-small);
}

.reply-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.reply-item:not(:last-child) {
  margin-bottom: 0.5rem;
  padding-bottom: 0.75rem;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
}

.page-btn {
  padding: 0.4rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-small);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.page-btn:hover:not(.disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>

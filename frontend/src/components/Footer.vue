<template>
    <footer class="site-footer">
        <div class="footer-brand">
            <span class="footer-mark" aria-hidden="true">N</span>
            <div>
                <strong>AoralsFout の小窝</strong>
                <p>在代码、音乐与日常之间持续发射信号。</p>
            </div>
        </div>
        <div class="footer-meta">
            <span>© {{ currentYear }} AoralsFout</span>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">冀ICP备2026011544号</a>
            <span class="build">BUILD {{ gitHash }} · {{ formattedDate }}</span>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const gitHash = __GIT_HASH__;
const gitDate = __GIT_DATE__;

const formattedDate = new Date(gitDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
</script>

<style scoped>
.site-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 2rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.footer-brand {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.footer-mark {
    display: grid;
    width: 34px;
    height: 34px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 9px 3px 9px 3px;
    background: var(--color-primary);
    color: var(--text-on-color);
    font-family: var(--font-display);
    font-weight: 800;
}

.footer-brand strong {
    color: var(--text-primary);
    font-family: var(--font-display);
    font-size: 0.9rem;
}

.footer-brand p {
    margin: 0.15rem 0 0;
    font-size: 0.78rem;
}

.footer-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.45rem 1rem;
    font-size: 0.75rem;
}

.footer-meta a {
    color: inherit;
    text-decoration: none;
}

.footer-meta a:hover {
    color: var(--color-primary);
}

.build {
    width: 100%;
    text-align: right;
    font-family: var(--font-display);
    font-size: 0.66rem;
    letter-spacing: 0.06em;
}

@media (max-width: 700px) {
    .site-footer {
        align-items: flex-start;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem 0.25rem 1.5rem;
    }

    .footer-meta {
        justify-content: flex-start;
    }

    .build {
        text-align: left;
    }
}
</style>

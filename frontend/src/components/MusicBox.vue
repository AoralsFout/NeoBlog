<template>
    <div class="music-container">
        <div class="music-header">音乐播放器 V3</div>
        <div class="music-cover">
            <div class="music-cover-mask"></div>
            <div class="music-cover-container">
                <img src="https://y.qq.com/music/photo_new/T002R300x300M000001tlWsZ48zl0X_1.jpg">
            </div>
            <div class="music-detail">
                <div class="music-artist">
                    <div class="music-artist-text">艺术家</div>
                    <div class="music-artist-content">暂无</div>
                </div>
                <div class="music-album">
                    <div class="music-artist-text">专辑</div>
                    <div class="music-artist-content">暂无</div>
                </div>
            </div>
        </div>
        <div class="music-title">示例歌曲</div>
        <div class="music-lyrics">
            <div class="music-lyrics-list">
                <div class="music-lyric">上一个歌词</div>
                <div class="music-lyric">上一个歌词</div>
                <div class="music-lyric active">当前歌词</div>
                <div class="music-lyric">下一个歌词</div>
                <div class="music-lyric">下一个歌词</div>
            </div>
        </div>
        <div class="music-bar">
            <!-- <canvas></canvas> -->
            <span>canvas 动态频谱</span>
        </div>
        <div class="music-controller">
            <div class="music-progress-container">
                <div class="background"></div>
                <div class="progress"></div>
                <div class="dot"></div>
            </div>
            <div class="music-controller-container">
                <div class="left">
                    <div class="btn volume">📢</div>
                </div>
                <div class="center">
                    <div class="btn prev">⏮</div>
                    <div class="btn playOrPause">▶</div>
                    <div class="btn next">⏭</div>
                </div>
                <div class="right">
                    <div class="btn translate">译</div>
                    <div class="btn playmode">🔁</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style>
.music-container {
    width: 100%;
    background-color: var(--bg-primary);
    border-radius: var(--radius-small);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    transition: border-radius 0.2s ease-in-out, background-color 0.2s ease-in-out;

    >.music-header {
        width: calc(100% - 2rem);
        padding: 1rem;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-small) var(--radius-small) 0 0;
        text-align: center;
        user-select: none;
        -webkit-user-select: none;
    }

    >.music-cover {
        position: relative;
        width: calc(100% - 4rem - 20px);
        margin: 2rem;
        border: 10px solid #525252;
        border-radius: 50%;

        /* &::after {
            content: '';
            position: absolute;
            z-index: 2;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 4px solid #525252;
            background-color: #000000a0;
        } */

        /* 渐变边框 */
        &::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            width: calc(100% + 20px);
            height: calc(100% + 20px);
            border-radius: 50%;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgb(153, 153, 153) 50%, rgba(0, 0, 0, 0) 100%);
            z-index: 1;
        }

        >.music-cover-mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            opacity: 0;
            z-index: 3;

            transition: opacity 0.2s ease-in-out;
        }

        >.music-cover-container {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;

            >img {
                width: 100%;
                height: 100%;
                object-fit: cover;

                border-radius: 50%;

                user-select: none;
                -webkit-user-select: none;
                -webkit-user-drag: none;
            }
        }

        >.music-detail {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            z-index: 4;

            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            transition: opacity 0.2s ease-in-out;

            >.music-artist,
            >.music-album {
                display: flex;
                flex-direction: row;

                >.music-artist-text,
                >.music-artist-content {
                    font-size: 1.2rem;
                    color: #ffffff;
                }

                >.music-artist-text {
                    text-align: left;
                }

                >.music-artist-content {
                    text-align: left;
                }
            }
        }

        &:hover .music-detail {
            opacity: 1;
        }

        &:hover .music-cover-mask {
            opacity: 1;
        }
    }

    >.music-title {
        font-size: 1.5rem;
    }

    >.music-lyrics {
        position: relative;
        width: calc(100% - 2rem);
        height: 80px;
        margin: 1rem;

        >.music-lyrics-list {
            height: 80px;
            overflow-y: scroll;

            >.music-lyric {
                height: 24px;
                line-height: 24px;
                text-align: center;
                font-size: 0.8rem;

                &.active {
                    background-color: var(--color-primary);
                    color: var(--text-on-color);
                    font-size: 1.2rem;
                    font-weight: bold;
                    transition: background-color 0.2s ease-in-out;
                }
            }

            &::-webkit-scrollbar {
                width: 4px;
            }
        }

        /* 渐变蒙版 */
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, var(--bg-primary) 0%, rgba(0, 0, 0, 0) 50%, var(--bg-primary) 100%);
            z-index: 1;
            pointer-events: none;
        }
    }

    >.music-controller {
        width: calc(100% - 2rem);
        padding: 1rem;
        background-color: var(--bg-secondary);
        border-radius: var(--radius-large) var(--radius-large) var(--radius-small) var(--radius-small);
        transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;

        display: flex;
        flex-direction: column;

        >.music-progress-container {
            position: relative;
            width: calc(100% - 2rem);
            margin: 1rem;

            >.background {
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background-color: var(--color-secondary);
                transition: background-color 0.2s ease-in-out;

            }

            >.progress {
                position: absolute;
                top: 0;
                left: 0;
                width: 30%;
                height: 4px;
                border-radius: 2px;
                background-color: var(--color-primary);
                transition: background-color 0.2s ease-in-out;
            }

            >.dot {
                position: absolute;
                top: -2px;
                left: 0;
                left: calc(30% - 2px);
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: var(--color-primary);
                transition: background-color 0.2s ease-in-out;
            }
        }

        >.music-controller-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            >.left,
            >.center,
            >.right {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }
        }
    }
}
</style>
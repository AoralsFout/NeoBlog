<template>
    <div v-if="currentMusic" class="music-container" ref="musicBox">
        <div class="music-box">
            <div class="music-layout">
                <div class="music-info">
                    <div class="music-tip" v-show="musicTip">{{ musicTip }}</div>
                    <div class="music-cover">
                        <img :src="currentMusic.coverUrl" alt="" class="music-cover-img" ref="musicCoverImg">
                    </div>
                    <div class="music-list-box" ref="musicListBox">
                        <div v-for="(item, index) in musicList" :key="index" class="music-list-item"
                            @click="switchMusic(index)" @mouseenter="handleMusicListItemMouseEnter(index)"
                            @mouseleave="handleMusicListItemMouseLeave"
                            :style="{ backgroundImage: 'url(' + item.coverUrl + ')', color: reverseColor(item.mainColor) }">
                            <div class="music-list-item-title">{{ item.title }} - {{ item.author }}</div>
                            <div class="music-list-item-fliter"></div>
                        </div>
                    </div>
                    <div class="music-detail" ref="musicDetail">
                        <div>
                            <div class="music-title">{{ currentMusic.title }}</div>
                            <div class="music-subtitle">
                                作者:{{ currentMusic.author }}&nbsp;&nbsp;&nbsp;&nbsp;专辑:{{ currentMusic.album }}
                            </div>
                        </div>
                        <div class="music-lyrics" v-show="!isTranslate || !currentMusic.isTranslate"
                            ref="lyricsContainer">
                            <div class="music-lyric" v-for="(item, index) in lyricsData" :key="index"
                                :ref="(el) => lyricElements[index] = el && 'classList' in el ? el : null"
                                @click="handleLyricClick(item.time)">
                                {{ item.text }}
                            </div>
                        </div>
                        <div class="music-lyrics" v-show="isTranslate && currentMusic.isTranslate"
                            ref="translatedLyricsContainer">
                            <div class="music-lyric" v-for="(item, index) in translatedLyricsData" :key="index"
                                :ref="(el) => translatedLyricElements[index] = el && 'classList' in el ? el : null"
                                @click="handleLyricClick(item.time)">
                                {{ item.text }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="music-control">
                    <div class="music-control-1">
                        <div class="music-control-item" @click="prevMusic">
                            <div class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M7 5V19M17 7.329V16.671C17 17.7367 17 18.2695 16.7815 18.5432C16.5916 18.7812 16.3035 18.9197 15.9989 18.9194C15.6487 18.919 15.2327 18.5861 14.4005 17.9204L10.1235 14.4988C9.05578 13.6446 8.52194 13.2176 8.32866 12.7016C8.1592 12.2492 8.1592 11.7508 8.32866 11.2984C8.52194 10.7824 9.05578 10.3554 10.1235 9.50122L14.4005 6.07961C15.2327 5.41387 15.6487 5.081 15.9989 5.08063C16.3035 5.0803 16.5916 5.21876 16.7815 5.45677C17 5.73045 17 6.2633 17 7.329Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div class="music-control-item" @click="playPauseMusic">
                            <div v-if="audioPause" class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z"
                                            stroke="#000000" stroke-width="2" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div v-else>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path d="M8 5V19M16 5V19" stroke="#000000" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div class="music-control-item" @click="nextMusic">
                            <div class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M17 5V19M7 7.329V16.671C7 17.7367 7 18.2695 7.21846 18.5432C7.40845 18.7812 7.69654 18.9197 8.00108 18.9194C8.35125 18.919 8.76734 18.5861 9.59951 17.9204L13.8765 14.4988C14.9442 13.6446 15.4781 13.2176 15.6713 12.7016C15.8408 12.2492 15.8408 11.7508 15.6713 11.2984C15.4781 10.7824 14.9442 10.3554 13.8765 9.50122L9.59951 6.07961C8.76734 5.41387 8.35125 5.081 8.00108 5.08063C7.69654 5.0803 7.40845 5.21876 7.21846 5.45677C7 5.73045 7 6.2633 7 7.329Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="music-control-2">
                        <div class="music-control-progress-container">
                            <div class="music-control-progress" @click="handleProgressClick">
                                <div class="music-control-progress-dot" ref="progressDot"
                                    @mousedown="handleProgressDotMouseDown" @mouseup="handleProgressDotMouseUp"></div>
                                <div class="music-control-progress-progress"></div>
                                <div class="music-control-progress-background"></div>
                            </div>
                            <div class="music-control-duration">{{ displayDuration }}</div>
                        </div>
                    </div>
                    <div class="music-control-3">
                        <div class="music-control-item" @click="toggleVolumeControl">
                            <div class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M16.0004 9.00009C16.6281 9.83575 17 10.8745 17 12.0001C17 13.1257 16.6281 14.1644 16.0004 15.0001M18 5.29177C19.8412 6.93973 21 9.33459 21 12.0001C21 14.6656 19.8412 17.0604 18 18.7084M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div class="music-control-item-volume" ref="volumeSliderContainer">
                                <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="changeVolume"
                                    class="volume-slider">
                            </div>
                        </div>
                        <div class="music-control-item" @click="toggleControlModeMenu">
                            <div v-if="playMode === 'order'" class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M18 4L21 7M21 7L18 10M21 7H7C4.79086 7 3 8.79086 3 11M6 20L3 17M3 17L6 14M3 17H17C19.2091 17 21 15.2091 21 13"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div v-else-if="playMode === 'loop'" class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M14 7H15.9992C19.3129 7 21.9992 9.68629 21.9992 13C21.9992 16.3137 19.3129 19 15.9992 19H8C4.68629 19 2 16.3137 2 13C2 9.68629 4.68629 7 8 7H10M7 4L10 7M10 7L7 10"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div v-else-if="playMode === 'random'" class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div v-else-if="playMode === 'stop'" class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                        <path
                                            d="M9 10.6C9 10.0399 9 9.75992 9.10899 9.54601C9.20487 9.35785 9.35785 9.20487 9.54601 9.10899C9.75992 9 10.0399 9 10.6 9H13.4C13.9601 9 14.2401 9 14.454 9.10899C14.6422 9.20487 14.7951 9.35785 14.891 9.54601C15 9.75992 15 10.0399 15 10.6V13.4C15 13.9601 15 14.2401 14.891 14.454C14.7951 14.6422 14.6422 14.7951 14.454 14.891C14.2401 15 13.9601 15 13.4 15H10.6C10.0399 15 9.75992 15 9.54601 14.891C9.35785 14.7951 9.20487 14.6422 9.10899 14.454C9 14.2401 9 13.9601 9 13.4V10.6Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div class="music-control-item-menu" ref="playModeMenuRef">
                                <div class="music-control-item-menu-item" :class="{ active: playMode === 'order' }"
                                    @click="switchPlayMode('order')">
                                    <div class="music-control-item-menu-item-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                            class="music-control-item-menu-item-icon-svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round"
                                                stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                <path
                                                    d="M18 4L21 7M21 7L18 10M21 7H7C4.79086 7 3 8.79086 3 11M6 20L3 17M3 17L6 14M3 17H17C19.2091 17 21 15.2091 21 13"
                                                    :stroke="playMode === 'order' ? '#ffffff' : '#000000'"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                            </g>
                                        </svg>
                                    </div>
                                    <div class="music-control-item-menu-item-title">顺序播放</div>
                                </div>
                                <div class="music-control-item-menu-item" :class="{ active: playMode === 'loop' }"
                                    @click="switchPlayMode('loop')">
                                    <div class="music-control-item-menu-item-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                            class="music-control-item-menu-item-icon-svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round"
                                                stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                <path
                                                    d="M14 7H15.9992C19.3129 7 21.9992 9.68629 21.9992 13C21.9992 16.3137 19.3129 19 15.9992 19H8C4.68629 19 2 16.3137 2 13C2 9.68629 4.68629 7 8 7H10M7 4L10 7M10 7L7 10"
                                                    :stroke="playMode === 'loop' ? '#ffffff' : '#000000'"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                            </g>
                                        </svg>
                                    </div>
                                    <div class="music-control-item-menu-item-title">单曲循环</div>
                                </div>
                                <div class="music-control-item-menu-item" :class="{ active: playMode === 'random' }"
                                    @click="switchPlayMode('random')">
                                    <div class="music-control-item-menu-item-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                            class="music-control-item-menu-item-icon-svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round"
                                                stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                <path
                                                    d="M18 4L21 7M21 7L18 10M21 7H17C16.0707 7 15.606 7 15.2196 7.07686C13.6329 7.39249 12.3925 8.63288 12.0769 10.2196C12 10.606 12 11.0707 12 12C12 12.9293 12 13.394 11.9231 13.7804C11.6075 15.3671 10.3671 16.6075 8.78036 16.9231C8.39397 17 7.92931 17 7 17H3M18 20L21 17M21 17L18 14M21 17H17C16.0707 17 15.606 17 15.2196 16.9231C15.1457 16.9084 15.0724 16.8917 15 16.873M3 7H7C7.92931 7 8.39397 7 8.78036 7.07686C8.85435 7.09158 8.92758 7.1083 9 7.12698"
                                                    :stroke="playMode === 'random' ? '#ffffff' : '#000000'"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                            </g>
                                        </svg>
                                    </div>
                                    <div class="music-control-item-menu-item-title">随机播放</div>
                                </div>
                                <div class="music-control-item-menu-item" :class="{ active: playMode === 'stop' }"
                                    @click="switchPlayMode('stop')">
                                    <div class="music-control-item-menu-item-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                            class="music-control-item-menu-item-icon-svg">
                                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round"
                                                stroke-linejoin="round"></g>
                                            <g id="SVGRepo_iconCarrier">
                                                <path
                                                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                                    :stroke="playMode === 'stop' ? '#ffffff' : '#000000'"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                                <path
                                                    d="M9 10.6C9 10.0399 9 9.75992 9.10899 9.54601C9.20487 9.35785 9.35785 9.20487 9.54601 9.10899C9.75992 9 10.0399 9 10.6 9H13.4C13.9601 9 14.2401 9 14.454 9.10899C14.6422 9.20487 14.7951 9.35785 14.891 9.54601C15 9.75992 15 10.0399 15 10.6V13.4C15 13.9601 15 14.2401 14.891 14.454C14.7951 14.6422 14.6422 14.7951 14.454 14.891C14.2401 15 13.9601 15 13.4 15H10.6C10.0399 15 9.75992 15 9.54601 14.891C9.35785 14.7951 9.20487 14.6422 9.10899 14.454C9 14.2401 9 13.9601 9 13.4V10.6Z"
                                                    :stroke="playMode === 'stop' ? '#ffffff' : '#000000'"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                </path>
                                            </g>
                                        </svg>
                                    </div>
                                    <div class="music-control-item-menu-item-title">播完即止</div>
                                </div>
                            </div>
                        </div>
                        <div class="music-control-item" @click="toggleMusicList">
                            <div class="music-control-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    class="music-control-item-icon-svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M8 6L21 6.00078M8 12L21 12.0008M8 18L21 18.0007M3 6.5H4V5.5H3V6.5ZM3 12.5H4V11.5H3V12.5ZM3 18.5H4V17.5H3V18.5Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div class="music-control-item" @click="isTranslate = !isTranslate"
                            v-show="currentMusic.isTranslate">
                            {{ isTranslate ? '原' : '译' }}
                        </div>
                    </div>
                </div>
            </div>
            <img :src="currentMusic.coverUrl" alt="" class="music-box-bg">
        </div>
        <div class="music-box-button" @click="toggleMusicBox">
            <div class="music-box-button-icon" ref="musicBoxButtonIcon">
                <svg fill="#ffffff" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                    class="music-box-button-icon-img" ref="musicBoxButtonIconImg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path
                            d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z">
                        </path>
                    </g>
                </svg>
            </div>
            <img :src="currentMusic.coverUrl" alt="" class="music-box-button-bg">
        </div>
    </div>
    <audio ref="audio" src="" nocontrols></audio>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface MusicItem {
    id: number
    title: string
    author: string
    album: string
    coverUrl: string
    mainColor: string
    language: string
    isTranslate: number
    format: string
}

interface LyricItem {
    time: number
    text: string
}

type PlayMode = 'order' | 'loop' | 'random' | 'stop'

// 音乐盒提示
// 展示在右下角
// 在修改音乐音量时会提示当前音量大小
const musicTip = ref<string>('')

/**
 * 音乐盒动画
*/

const musicBox = ref<HTMLDivElement | null>(null);               // 音乐盒
const musicBoxButtonIcon = ref<HTMLElement | null>(null);     // 音乐盒展开收起按钮图标
const isMusicBoxOpen = ref<boolean>(false);        // 音乐盒是否展开
const musicBoxButtonIconImg = ref<HTMLElement | null>(null);  // 音乐盒展开收起按钮图标图片

// 展开收起音乐盒
const toggleMusicBox = () => {
    // 动画通过 CSS transition 实现
    // JavaScript 操作 DOM 元素的 style 属性来实现动画

    // 音乐盒平移动画
    if (musicBox.value) {
        musicBox.value.style.transform = isMusicBoxOpen.value ? 'translateX(800px)' : 'translateX(0px)';
    }
    // 音乐盒展开收起按钮图标旋转动画
    if (musicBoxButtonIcon.value) {
        musicBoxButtonIcon.value.style.transform = isMusicBoxOpen.value ? 'translate(-50%, -50%) rotate(0deg)' : 'translate(-50%, -50%) rotate(180deg)';
    }
    // 更新音乐盒是否展开状态
    isMusicBoxOpen.value = !isMusicBoxOpen.value;
}

/**
 * 颜色处理
*/

// 应用颜色
// 音乐盒背景会动态变化，字体颜色需要同步更新保持视觉高对比度。
const applyColor = () => {
    if (musicBoxButtonIconImg.value && currentMusic.value) {
        musicBoxButtonIconImg.value.setAttribute('fill', reverseColor(currentMusic.value.mainColor));
        // musicDetail.value.style.color = reverseColor(currentMusic.value.mainColor);
    }
}

// 反转颜色
const reverseColor = (color: string): string => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `#${((255 - r) << 16 | (255 - g) << 8 | (255 - b)).toString(16).padStart(6, '0')}`;
}

/**
 * 初始化音乐列表
 */

const musicList = ref<MusicItem[]>([])  // 音乐列表
const currentMusic = ref<MusicItem>({
    id: 1,
    title: '暂无',
    author: '暂无',
    album: '暂无',
    coverUrl: '/musics/cover/1.jpg',
    mainColor: '#ffffff',
    language: '未知',
    isTranslate: 0,
    format: 'mp3'
})// 当前播放音乐对象

// 加载音乐列表
const loadMusicList = async () => {
    try {
        const response = await fetch(`/api/music/getMusicList`)
        const data = await response.json()

        if (data.code !== 200) {
            throw new Error('获取音乐列表失败')
        }

        musicList.value = data.data as MusicItem[]
        musicList.value.forEach(item => {
            item.coverUrl = '/musics/cover/' + item.id + '.jpg'
        })

        switchMusic(0); // 切换到第一首音乐
    } catch (error) {
        console.error('获取音乐列表失败:', error)
    }
}

/**
 * 歌词处理
 */

const isTranslate = ref<boolean>(false)        // 是否翻译歌词
const lyricsData = ref<LyricItem[]>([])            // 原始歌词数据
const translatedLyricsData = ref<LyricItem[]>([])  // 翻译歌词数据

// 获取歌词数据
const getLyricsData = async () => {
    if (currentMusic.value.language === "未知") {
        lyricsData.value = [{ time: 0.00, text: "纯音乐,请欣赏" }];
    } else {
        lyricsData.value = await fetchLyrics(currentMusic.value.id, currentMusic.value.language);
        if (currentMusic.value.isTranslate === 1) {
            translatedLyricsData.value = await fetchLyrics(currentMusic.value.id, 'cn');
        }
    }
}

// 从服务器获取歌词数据
const fetchLyrics = async (id: number, language: string): Promise<LyricItem[]> => {
    return fetch(`/musics/lrc/${id}-${language}.lrc`)
        .then((response) => response.text())
        .then((lyricsText) => {
            return parseLyrics(lyricsText);
        });
}

// 解析歌词文本
const parseLyrics = (lyricsText: string): LyricItem[] => {
    const lines = lyricsText.split("\n");
    const lyricsData: LyricItem[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d+)\]/;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] as string;
        const timeMatches = line.match(timeRegex);
        if (timeMatches) {
            const minutes = parseInt(timeMatches[1]!);
            const seconds = parseInt(timeMatches[2]!);
            const milliseconds = parseInt(timeMatches[3]!);
            const millisecondsLength = timeMatches[3]!.length;
            const time =
                minutes * 60 +
                seconds +
                milliseconds / Math.pow(10, millisecondsLength);
            const text = line.replace(timeRegex, "").trim();
            lyricsData.push({ time, text });
        }
    }
    return lyricsData;
}

/**
 * audio 控制
 * */

const audio = ref<HTMLAudioElement | null>(null)

// 加载音乐
const loadMusic = () => {
    if (!audio.value || !currentMusic.value) return
    audio.value.src = '/musics/music/' + currentMusic.value.id + '.' + currentMusic.value.format;
    audio.value.play();
    audioPause.value = false;
    audio.value.volume = volume.value;
};

// 跳转至指定音乐
const switchMusic = (index: number) => {
    if (audio.value) {
        audio.value.pause();
    }
    audioPause.value = true;
    currentMusic.value = musicList.value[index] as MusicItem;
    getLyricsData();
    nextTick(() => {
        applyColor();
        loadMusic();
    });
}

// 播放&暂停音乐
const playPauseMusic = () => {
    if (!audio.value) return
    if (audio.value.paused) {
        audio.value.play();
        audioPause.value = false;
    } else {
        audio.value.pause();
        audioPause.value = true;
    }
}

// 切换下一首音乐
const nextMusic = () => {
    switchMusic((currentMusic.value.id) % musicList.value.length);
}

// 切换上一首音乐
const prevMusic = () => {
    switchMusic((currentMusic.value.id + musicList.value.length - 2) % musicList.value.length);
}

/**
 * 音乐列表
*/

// 控制音乐列表展开收起
const musicListBox = ref<HTMLDivElement | null>(null)
const isMusicListOpen = ref<boolean>(false);
const toggleMusicList = () => {
    isMusicListOpen.value = !isMusicListOpen.value;
    if (musicListBox.value) {
        musicListBox.value.style.transform = isMusicListOpen.value ? 'translateX(0px)' : 'translateX(480px)';
    }
}

// 处理音乐列表项鼠标进入事件, 切换封面
const musicCoverImg = ref<HTMLImageElement | null>(null)
const handleMusicListItemMouseEnter = (index: number) => {
    if (musicCoverImg.value && musicList.value[index]) {
        musicCoverImg.value.src = musicList.value[index].coverUrl
    }
}
const handleMusicListItemMouseLeave = () => {
    if (musicCoverImg.value && currentMusic.value) {
        musicCoverImg.value.src = currentMusic.value.coverUrl
    }
}

/**
 * 音量控制
*/

const volume = ref<number>(0.5);                    // 音量 默认值为50%
const isVolumeControlVisible = ref<boolean>(false);  // 是否显示音量控制条
const volumeSliderContainer = ref<HTMLElement | null>(null)     // 音量控制条容器
let volumeTipTimer: number | null = null;                  // 定时器变量，用于延迟隐藏音量提示

// 切换音量控制条显示状态
const toggleVolumeControl = () => {
    // 切换音量控制条显示状态
    isVolumeControlVisible.value = !isVolumeControlVisible.value;
    // 开始音量控制条动画
    applyToggleVolumeControlAnimation();
    // 如果播放模式菜单可见，切换为隐藏状态
    if (isPlayModeVisible.value) {
        isPlayModeVisible.value = false;
        applyTogglePlayModeMenuAnimation();
    }
};

const applyToggleVolumeControlAnimation = () => {
    if (!volumeSliderContainer.value) return
    if (isVolumeControlVisible.value) {
        volumeSliderContainer.value.style.display = 'flex'
        // 0延迟显示音量控制条，避免立即显示导致的闪烁
        setTimeout(() => {
            if (volumeSliderContainer.value) {
                volumeSliderContainer.value.style.opacity = '1'
            }
        }, 0)
    } else {
        // 先设置透明度为0，CSS动画自动过渡，100ms后隐藏音量控制条，避免仍然处于可交互状态。
        volumeSliderContainer.value.style.opacity = '0'
        setTimeout(() => {
            if (volumeSliderContainer.value) {
                volumeSliderContainer.value.style.display = 'none'
            }
        }, 100)
    }
}

const audioPause = ref<boolean>(false)

// 音量控制条 @change 事件触发
// 更改音量
const changeVolume = () => {
    if (audio.value) {
        audio.value.volume = volume.value;
        musicTip.value = `音量: ${(volume.value * 100).toFixed(0)}%`

        // 清除之前的定时器
        if (volumeTipTimer) {
            clearTimeout(volumeTipTimer);
        }

        // 设置新的定时器，3秒后隐藏音量提示
        volumeTipTimer = setTimeout(() => {
            musicTip.value = '';
        }, 3000);
    }
};

/**
 * 播放模式控制
*/
// 播放模式相关逻辑
const playMode = ref<PlayMode>('order')    // order: 顺序播放, loop: 单曲循环, random: 随机播放, stop: 播完即止

// 切换播放模式
const switchPlayMode = (mode: PlayMode) => {
    playMode.value = mode;
    isVolumeControlVisible.value = false;
    applyToggleVolumeControlAnimation();
}

// 音频播放结束事件处理
const handleAudioEnded = () => {
    if (!audio.value) return
    if (playMode.value === 'loop') {
        // 单曲循环：重新播放当前歌曲
        audio.value.currentTime = 0;
        audio.value.play();
        audioPause.value = false;
    } else if (playMode.value === 'stop') {
        audio.value.pause();
        audioPause.value = true;
    } else if (playMode.value === 'order') {
        nextMusic();
    } else if (playMode.value === 'random') {
        switchMusic(Math.floor(Math.random() * musicList.value.length));
    }
}

/**
 * 进度条控制
*/

const progressDot = ref<HTMLDivElement | null>(null)                 // 进度条点
const isDraggingProgressDot = ref<boolean>(false)      // 是否正在拖动进度条点
const currentTime = ref<number>(0)                    // 当前时间
const duration = ref<number>(0)                       // 总时长
const displayDuration = ref<string>('--:-- / --:--')  // 最终显示时间,格式 mm:ss / mm:ss

// 格式化时间为 mm:ss
const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 更新进度条显示
const updateProgressBar = () => {
    if (!progressDot.value) return

    const progress = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0

    progressDot.value.style.left = `${progress}%`
    const nextSibling = progressDot.value.nextElementSibling as HTMLElement
    if (nextSibling) {
        nextSibling.style.width = `${progress}%`
    }

    // 更新显示的时间
    displayDuration.value = `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`
}

// 音频加载元数据事件
const handleLoadedMetadata = () => {
    if (!audio.value) return
    duration.value = audio.value.duration
    updateProgressBar()
}

// 处理进度条点击事件（直接跳转）
const handleProgressClick = (e: MouseEvent) => {
    if (!audio.value || !audio.value.duration) return

    const progressBar = e.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progress = Math.max(0, Math.min(1, clickX / rect.width))

    currentTime.value = progress * audio.value.duration
    audio.value.currentTime = currentTime.value
    updateProgressBar()
}

const handleProgressDotMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    isDraggingProgressDot.value = false;

    // 拖动结束后设置音频时间
    if (audio.value && duration.value > 0) {
        audio.value.currentTime = currentTime.value
    }
}

// 处理进度条拖动事件
const handleProgressDotMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    isDraggingProgressDot.value = true;

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
}

const handleProgressDotMouseMove = (e: MouseEvent) => {
    if (!isDraggingProgressDot.value || !progressDot.value) return;
    e.preventDefault();

    const progressBar = progressDot.value.parentElement as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const progress = Math.max(0, Math.min(1, mouseX / rect.width))

    currentTime.value = progress * duration.value
    updateProgressBar()
}

// 添加全局鼠标事件监听
const handleGlobalMouseMove = (e: MouseEvent) => {
    handleProgressDotMouseMove(e)
}

const handleGlobalMouseUp = (e: MouseEvent) => {
    handleProgressDotMouseUp(e)
    document.removeEventListener('mousemove', handleGlobalMouseMove)
    document.removeEventListener('mouseup', handleGlobalMouseUp)
}

/**
 * 歌词显示
 */

const lyricElements = ref<Array<Element | null>>([])           // 原始歌词元素
const translatedLyricElements = ref<Array<Element | null>>([]) // 翻译歌词元素

// 音频时间更新事件
// 同时处理进度条和歌词显示
const handleTimeUpdate = () => {
    if (!audio.value) return
    // 拖动过程中不更新时间
    if (!isDraggingProgressDot.value) {
        currentTime.value = audio.value.currentTime
        updateProgressBar()
    }

    let activeIndex = -1

    // 处理歌词active
    lyricsData.value.forEach((lyric, index) => {
        if (audio.value && (audio.value.currentTime >= lyric.time && audio.value.currentTime < lyricsData.value[index + 1]!.time)) {
            const element = lyricElements.value[index]
            if (element && !element.classList.contains('active')) {
                element.classList.add('active');
                activeIndex = index
            }
        } else {
            const element = lyricElements.value[index]
            if (element) {
                element.classList.remove('active');
            }
        }
    });

    // 处理翻译歌词
    translatedLyricsData.value.forEach((lyric, index) => {
        if (audio.value && (audio.value.currentTime >= lyric.time && audio.value.currentTime < translatedLyricsData.value[index + 1]!.time)) {
            const element = translatedLyricElements.value[index]
            if (element && !element.classList.contains('active')) {
                element.classList.add('active');
                activeIndex = index
            }
        } else {
            const element = translatedLyricElements.value[index]
            if (element) {
                element.classList.remove('active');
            }
        }
    });

    // 如果有活动歌词且用户没有手动滚动，则滚动到中心
    if (activeIndex !== -1) {
        nextTick(() => {
            scrollToActiveLyric()
        })
    }
}

// 处理歌词点击事件 （切换播放时间）
const handleLyricClick = (time: number) => {
    currentTime.value = time
    if (audio.value) {
        audio.value.currentTime = time
    }
    updateProgressBar()
}

// 歌词自动居中相关
const lyricsContainer = ref<HTMLDivElement | null>(null)
const translatedLyricsContainer = ref<HTMLDivElement | null>(null)
let userScrollTimer: number | null = null
let isUserScrolling: boolean = false

// 处理用户手动滚动事件
const handleLyricsScroll = (e: Event) => {
    // 用户滚动时，清除之前的定时器
    if (userScrollTimer) {
        clearTimeout(userScrollTimer)
    }

    // 设置用户正在滚动状态
    isUserScrolling = true

    // 5秒后恢复自动居中
    userScrollTimer = setTimeout(() => {
        isUserScrolling = false
    }, 5000)
}

// 滚动歌词到中心位置
const scrollToActiveLyric = () => {
    // 如果用户正在手动滚动，则不执行自动居中
    if (isUserScrolling) return

    const container = isTranslate.value ? translatedLyricsContainer.value : lyricsContainer.value
    if (!container) return

    const activeLyricElement = container.querySelector('.music-lyric.active') as HTMLDivElement

    if (activeLyricElement) {
        // 计算将活动歌词居中所需的位置
        const containerHeight = container.clientHeight
        const lyricHeight = activeLyricElement.offsetHeight
        const lyricTop = activeLyricElement.offsetTop
        const scrollTop = lyricTop - containerHeight / 2 + lyricHeight / 2

        // 平滑滚动到指定位置
        container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        })

        // 下策：程序滚动也会触发滚动事件，所以等待滚动完设置用户正在滚动状态为false
        setTimeout(() => {
            if (userScrollTimer) {
                clearTimeout(userScrollTimer)
            }
            isUserScrolling = false
        }, 500)
    }
}

// 控制菜单管理
const isPlayModeVisible = ref<boolean>(false)
const playModeMenuRef = ref<HTMLElement | null>(null)

const toggleControlModeMenu = () => {
    isPlayModeVisible.value = !isPlayModeVisible.value
    applyTogglePlayModeMenuAnimation();
    if (isVolumeControlVisible.value) {
        isVolumeControlVisible.value = false;
        applyToggleVolumeControlAnimation();
    }
}

const applyTogglePlayModeMenuAnimation = () => {
    if (!playModeMenuRef.value) return
    if (isPlayModeVisible.value) {
        playModeMenuRef.value.style.display = 'block'
        setTimeout(() => {
            if (playModeMenuRef.value) {
                playModeMenuRef.value.style.opacity = '1'
            }
        }, 0)
    } else {
        playModeMenuRef.value.style.opacity = '0'
        setTimeout(() => {
            if (playModeMenuRef.value) {
                playModeMenuRef.value.style.display = 'none'
            }
        }, 100)
    }
}

// 在组件挂载时添加音频事件监听
onMounted(() => {
    // 初始化播放列表
    loadMusicList()
    // 添加音频事件监听
    if (audio.value) {
        audio.value.addEventListener('timeupdate', handleTimeUpdate)
        audio.value.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.value.addEventListener('ended', handleAudioEnded)
    }
    // 添加歌词容器滚动事件监听
    nextTick(() => {
        if (lyricsContainer.value) {
            lyricsContainer.value.addEventListener('scroll', handleLyricsScroll)
        }
        if (translatedLyricsContainer.value) {
            translatedLyricsContainer.value.addEventListener('scroll', handleLyricsScroll)
        }
    })
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
    // 移除音频事件监听
    if (audio.value) {
        audio.value.removeEventListener('timeupdate', handleTimeUpdate)
        audio.value.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.value.removeEventListener('ended', handleAudioEnded)
    }
    // 移除歌词容器滚动事件监听
    if (lyricsContainer.value) {
        lyricsContainer.value.removeEventListener('scroll', handleLyricsScroll)
    }
    if (translatedLyricsContainer.value) {
        translatedLyricsContainer.value.removeEventListener('scroll', handleLyricsScroll)
    }
    // 移除全局鼠标移动事件监听
    document.removeEventListener('mousemove', handleGlobalMouseMove)
    document.removeEventListener('mouseup', handleGlobalMouseUp)
    // 清除定时器
    if (userScrollTimer) {
        clearTimeout(userScrollTimer)
    }
})
</script>

<style>
.music-container {
    width: 800px;
    position: fixed;
    display: flex;
    flex-direction: row;
    bottom: 50px;
    right: 0;
    transform: translateX(800px);
    transition: transform 0.3s ease;
    z-index: 10000;
}

.music-box {
    width: 100%;
    height: 400px;
    position: relative;
    overflow: hidden;
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); */
    border: 1px solid #ccc;
    border-radius: 0 0 0 10px;
}

.music-box-bg {
    position: absolute;
    width: 840px;
    height: 840px;
    top: 50%;
    transform: translate(-40px, -50%);
    filter: blur(10px);
    border-radius: 0 0 0 10px;
    user-select: none;
}

.music-box-button {
    position: absolute;
    top: 0;
    left: -40px;
    width: 40px;
    height: 70px;
    overflow: hidden;
    border-radius: 10px 0px 0px 10px;
    border: 1px solid #ccc;
    border-right: none;
}

.music-box-button-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    color: #fff;
    z-index: 1;
    user-select: none;
    transition: transform 0.5s ease-in-out;
}

.music-box-button-bg {
    width: 840px;
    height: 840px;
    transform: translate(0, -220px);
    filter: blur(10px);
    user-select: none;
}

.music-layout {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    z-index: 1;
}

.music-info {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.music-tip {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(1px);
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    flex-shrink: 0;
    z-index: 5;
    text-wrap: nowrap;
    user-select: none;
}

.music-cover {
    position: relative;
    flex-shrink: 0;
    width: 300px;
    height: 300px;
    border-radius: 10px;
    margin-left: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 1) 90%);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    user-select: none;
    overflow: hidden;
    transform-style: preserve-3d;
    transform-origin: center;
    transition: transform 0.4s ease-in-out;
}

.music-cover:hover {
    transform: perspective(1000px) scale(1.01) rotateX(8deg);
    z-index: 11;
}

.music-cover-img {
    width: 95%;
    height: 95%;
    object-fit: cover;
    -webkit-user-drag: none;
}

.music-cover:hover::after {
    transform: rotate(24deg) translateY(16%);
    opacity: 1;
}

.music-cover::after {
    content: "";
    position: absolute;
    top: -58%;
    left: -18%;
    width: 150%;
    height: 150%;
    background-image: linear-gradient(hsla(0, 0%, 100%, .4), hsla(0, 0%, 100%, .5) 48%, hsla(0, 0%, 100%, 0) 52%);
    transform: rotate(24deg);
    opacity: .5;
    transition: transform .5s ease, opacity .5s ease;
    pointer-events: none;
}

.music-detail {
    position: relative;
    width: 480px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.music-title {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 2rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
    text-wrap: nowrap;
}

.music-subtitle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 1rem;
    font-size: 0.7rem;
    color: #eee;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
    text-wrap: nowrap;
}

.music-lyrics {
    position: relative;
    max-height: 240px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    gap: 0.5rem;
}

.music-lyrics::-webkit-scrollbar {
    display: none;
}

.music-lyric {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-size: 1rem;
    flex-shrink: 0;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    color: #ccc;
    transition: all 0.3s ease-in-out;
}

.music-lyric:hover {
    background-color: #00000010;
    border-radius: 10px;
}

.music-lyric.active {
    color: #fff;
    transform: scale(1.1);
    font-weight: bold;
}

.music-control {
    width: 100%;
    height: 75px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
    z-index: 3;
    /* box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.1); */
}

.music-control-1,
.music-control-2,
.music-control-3 {
    height: 100%;
    display: flex;
    padding: 0 20px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.music-control-2 {
    padding: 0px;
    flex-grow: 1;
}

.music-control-item {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1rem;
    background-color: #eee;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    flex-shrink: 0;
    user-select: none;
    transition: background-color 0.1s ease-in-out;
}

.music-control-item:hover {
    background-color: #ddd;
}

.music-control-item:active {
    background-color: #ccc;
}

.music-control-item-icon {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.music-control-item-icon-svg {
    width: 28px;
    height: 28px;
}

.music-control-item-menu {
    display: none;
    position: absolute;
    bottom: 60px;
    right: 50%;
    transform: translateX(50%);
    width: 100px;
    padding: 10px 0;
    background-color: #eee;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    z-index: 5;
    opacity: 0;
    transition: transform 0.5s ease-in-out, opacity 0.1s ease-in-out;
}

/* 三角 */
.music-control-item-menu::after {
    content: "";
    position: absolute;
    top: 100%;
    right: 50%;
    transform: translateX(50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 15px solid #eee;
}

.music-control-item-menu-item {
    display: flex;
    flex-direction: row;
    gap: 5px;
    justify-content: center;
    align-items: center;
    padding: 5px;
    font-size: 1rem;
    font-weight: normal;
    text-align: center;
    cursor: pointer;
}

.music-control-item-menu-item:hover {
    background-color: #f5f5f5;
}

.music-control-item-menu-item.active {
    background-color: #1890ff;
    color: white;
}

.music-control-item-menu-item-icon {
    width: 15px;
    height: 15px;
}

.music-control-item-menu-item-icon-svg {
    width: 15px;
    height: 15px;
}

.music-control-item-menu-item-title {
    font-size: 1rem;
    font-weight: normal;
}

/* 音量控制样式 */
.music-control-item-volume {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 100px;
    background-color: #eee;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
}

.volume-slider {
    -webkit-appearance: slider-vertical;
    width: 15px;
    height: 90px;
    background: #1890ff;
    outline: none;
    border-radius: 5px;
}

.music-list-box {
    position: absolute;
    top: 0;
    right: 0;
    width: 480px;
    height: 100%;
    background-color: #ffffff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    z-index: 1;
    transform: translateX(480px);
    transition: transform 0.5s ease-in-out;
}

.music-list-item {
    position: relative;
    height: 75px;
    padding-left: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-size: 100%;
    background-position: center;
    transition: background-size 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.music-list-item:hover {
    background-size: 110%;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 1);
}

.music-list-item-title {
    font-size: 1.2rem;
    font-weight: bold;
    z-index: 1;
}

.music-list-item-fliter {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
}

.music-control-progress-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.music-control-progress {
    position: relative;
    width: 100%;
    height: 10px;
}

.music-control-duration {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    font-size: 1rem;
    line-height: 1rem;
    font-weight: bold;
    color: #000;
    user-select: none;
}

.music-control-progress-dot {
    position: absolute;
    width: 15px;
    height: 15px;
    top: 50%;
    /* left 为 progress 的百分比 */
    left: 0%;
    transform: translate(-50%, -50%);
    background-color: #1890ff;
    border-radius: 50%;
    z-index: 3;
    border: 4px solid #fff;
    box-shadow: 0 0 5px 1px #1890ff;
    transition: transform 0.1s linear;
}

.music-control-progress-dot:hover {
    transform: translate(-50%, -50%) scale(1.05);
}

.music-control-progress-progress {
    position: absolute;
    /* width 为 progress 的百分比 */
    width: 50%;
    height: 100%;
    background-color: #1890ff;
    border-radius: 10px;
    z-index: 2;
}

.music-control-progress-background {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #eee;
    border-radius: 10px;
    z-index: 1;
}
</style>
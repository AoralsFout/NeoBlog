import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

export function useBackgroundAnimation(wallpapersRef: Ref<HTMLDivElement | null>) {
    // 壁纸切换器状态
    const images = ref<HTMLImageElement[]>([])
    const activeIndex = ref(0)
    const nextIndex = ref(1)
    let intervalId: number | undefined = undefined

    // 镜头动画状态
    let angle = 0
    let animationFrameId: number | undefined = undefined

    const initWallpaperSwitcher = () => {
        if (wallpapersRef.value) {
            images.value = Array.from(wallpapersRef.value.querySelectorAll('img'))
        }

        // 设置初始图片
        if (images.value[activeIndex.value]) {
            images.value[activeIndex.value]!.classList.add('active')
        }

        // 每15秒切换一次（可根据需要调整）
        intervalId = setInterval(switchWallpaper, 15000)
    }

    const switchWallpaper = () => {
        // 预加载下一张图片
        preloadNextImage().then(() => {
            // 淡出当前图片
            if (images.value[activeIndex.value]) {
                images.value[activeIndex.value]!.classList.remove('active')
            }

            // 淡入新图片
            if (images.value[nextIndex.value]) {
                images.value[nextIndex.value]!.classList.add('active')
            }

            // 更新索引
            [activeIndex.value, nextIndex.value] = [nextIndex.value, activeIndex.value]
        })
    }

    const preloadNextImage = () => {
        return new Promise<void>((resolve) => {
            // 生成带时间戳的新URL避免缓存
            const newUrl = `https://t.alcy.cc/pc/?t=${Date.now()}`
            const img = new Image()

            img.onload = () => {
                if (images.value[nextIndex.value]) {
                    images.value[nextIndex.value]!.src = newUrl
                }
                resolve()
            }

            img.onerror = () => {
                // 失败时重试
                setTimeout(() => preloadNextImage(), 1000)
            }

            img.src = newUrl
        })
    }

    // 镜头动画更新函数，每帧调用
    const updateAnimation = () => {
        // 镜头摇晃动画
        let speed = 1
        // speed扰动
        speed = speed + Math.cos(angle) * Math.sin(angle)
        const radius = 10
        const position: [number, number] = [radius * Math.cos(angle) * speed, radius * Math.sin(angle) * speed]
        angle += 0.01
        // 壁纸动画
        if (wallpapersRef.value) {
            wallpapersRef.value.style.transform = `
                translateX(${position[0] * 1}px)
                translateY(${position[1] * 1}px)
            `
        }
    }

    const startAnimationLoop = () => {
        // 启动镜头动画循环
        const animate = () => {
            updateAnimation()
            animationFrameId = requestAnimationFrame(animate)
        }
        animationFrameId = requestAnimationFrame(animate)
    }

    const start = () => {
        initWallpaperSwitcher()
        startAnimationLoop()
    }

    const stop = () => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = undefined
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = undefined
        }
    }

    onBeforeUnmount(() => {
        stop()
    })

    return {
        start,
        stop
    }
}
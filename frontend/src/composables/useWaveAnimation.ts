import { onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

export function useWaveAnimation(waveCanvasRef: Ref<HTMLCanvasElement | null>) {
    let waveCtx: CanvasRenderingContext2D | null = null
    let waveTime = 0
    let secondaryWaveTime = 0
    const waveAmplitude = 20
    const waveFrequency = 0.005
    const waveSpeed = 0.05
    const secondaryWaveAmplitude = 40       // 后方波浪振幅
    const secondaryWaveFrequency = 0.005    // 后方波浪频率
    const secondaryWaveSpeed = 0.03         // 后方波浪速度
    const secondaryWavePhase = Math.PI / 2  // 初始相位差90度

    let animationFrameId: number | undefined = undefined

    const initWaveCanvas = () => {
        if (!waveCanvasRef.value) return
        waveCtx = waveCanvasRef.value.getContext('2d')
        resizeWaveCanvas()
        window.addEventListener('resize', resizeWaveCanvas)
    }

    const resizeWaveCanvas = () => {
        if (!waveCanvasRef.value || !waveCtx) return
        const dpr = window.devicePixelRatio || 1
        const rect = waveCanvasRef.value.getBoundingClientRect()
        waveCanvasRef.value.width = rect.width * dpr
        waveCanvasRef.value.height = rect.height * dpr
        waveCtx.setTransform(1, 0, 0, 1, 0, 0)
        waveCtx.scale(dpr, dpr)
    }

    const drawWaves = () => {
        if (!waveCanvasRef.value || !waveCtx) return
        const width = waveCanvasRef.value.clientWidth
        const height = waveCanvasRef.value.clientHeight

        // 清除画布
        waveCtx.clearRect(0, 0, width, height)

        // 获取CSS颜色变量
        const rootStyle = getComputedStyle(document.documentElement)
        const bgSecondary = rootStyle.getPropertyValue('--bg-secondary').trim()
        const colorPrimary = rootStyle.getPropertyValue('--color-primary').trim()

        // 绘制后方波浪（--color-primary）
        waveCtx.beginPath()
        waveCtx.moveTo(0, height / 2)
        for (let x = 0; x <= width; x += 1) {
            const y = height / 2 + Math.sin(x * secondaryWaveFrequency + secondaryWaveTime + secondaryWavePhase) * secondaryWaveAmplitude
            waveCtx.lineTo(x, y)
        }
        waveCtx.lineTo(width, height)
        waveCtx.lineTo(0, height)
        waveCtx.closePath()
        waveCtx.fillStyle = colorPrimary || '#333333'
        waveCtx.globalAlpha = 0.8
        waveCtx.fill()
        waveCtx.globalAlpha = 1

        // 绘制主波浪（--bg-secondary）
        waveCtx.beginPath()
        waveCtx.moveTo(0, height / 2)
        for (let x = 0; x <= width; x += 1) {
            const y = height / 2 + Math.sin(x * waveFrequency + waveTime) * waveAmplitude
            waveCtx.lineTo(x, y)
        }
        waveCtx.lineTo(width, height)
        waveCtx.lineTo(0, height)
        waveCtx.closePath()
        waveCtx.fillStyle = bgSecondary || '#f8f9fa'
        waveCtx.fill()

        waveTime += waveSpeed
        secondaryWaveTime += secondaryWaveSpeed
    }

    const startAnimationLoop = () => {
        const animate = () => {
            drawWaves()
            animationFrameId = requestAnimationFrame(animate)
        }
        animationFrameId = requestAnimationFrame(animate)
    }

    const start = () => {
        initWaveCanvas()
        startAnimationLoop()
    }

    const stop = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = undefined
        }
        window.removeEventListener('resize', resizeWaveCanvas)
    }

    onBeforeUnmount(() => {
        stop()
    })

    return {
        start,
        stop
    }
}
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import "@chinese-fonts/maple-mono-cn/dist/MapleMono-CN-Regular/result.css";

import "@/assets/themes/root.css";
import "@/assets/themes/dark.css"
import "@/assets/themes/red.css";
import "@/assets/themes/blue.css";
import "@/assets/themes/pink.css";
import "@/assets/themes/green.css";

import "@/assets/global.css";

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

import { createApp } from "vue";
import "./style.css";

import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 注释掉其他 UI 框架的引入，避免样式冲突
// import Antd from "ant-design-vue";
// import "ant-design-vue/dist/reset.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { createPinia } from "pinia";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(ElementPlus);
// app.use(Antd);
app.use(pinia);
app.use(router);

app.mount("#app");

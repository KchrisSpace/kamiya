import { createRouter, createWebHistory } from "vue-router";
import Layout from "../layout/Layout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Layout,
      children: [
        {
          path: "",
          name: "homepage",
          component: () => import("../views/homepage/homepage.vue"),
        },
        {
          path: "store",
          name: "store",
          component: () => import("../views/store/Store.vue"),
        },
        {
          path: "customize",
          name: "customize",
          component: () => import("../views/customize/customize.vue"),
        },
        {
          path: "cart",
          name: "cart",
          component: () => import("../views/cart/cart.vue"),
        },
        {
          path: "order",
          name: "order",
          component: () => import("../views/order/order.vue"),
        },
        {
          path: "contact",
          name: "contact",
          component: () => import("../views/contact/contact.vue"),
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login/login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/register/register.vue"),
    },
  ],
});

export default router;

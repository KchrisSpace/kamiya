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
        {
          path: "/product/:id",
          name: "ProductDetail",
          component: () =>
            import("../views/store/components/product-detail.vue"),
          props: true,
        },
        {
          path: "/create-order",
          name: "CreateOrder",
          component: () => import("../views/order/components/create-order.vue"),
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
    {
      path: "/admin",
      component: () => import("../layout/admin/AdminLayout.vue"),
      children: [
        {
          path: "",
          redirect: "/admin/dashboard",
        },
        {
          path: "dashboard",
          name: "adminDashboard",
          component: () => import("../views/admin/dashboard/dashboard.vue"),
        },
        {
          path: "products",
          name: "adminProducts",
          component: () => import("../views/admin/products/products.vue"),
        },
        {
          path: "orders",
          name: "adminOrders",
          component: () => import("../views/admin/orders/orders.vue"),
        },
        {
          path: "users",
          name: "adminUsers",
          component: () => import("../views/admin/users/users.vue"),
        },
        {
          path: "settings",
          name: "adminSettings",
          component: () => import("../views/admin/settings/settings.vue"),
        },
      ],
    },
  ],
});

export default router;

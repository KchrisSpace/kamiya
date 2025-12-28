import { createRouter, createWebHistory } from "vue-router";
import Layout from "../layout/front/Layout.vue";
import { useUserStore } from "../data_stores/user";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Layout,
      beforeEnter: (to, from, next) => {
        // 前台路由：确保使用普通用户登录上下文
        const userStore = useUserStore();
        userStore.initUserInfo();
        next();
      },
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
          path: "about",
          name: "about",
          component: () => import("../views/about/about.vue"),
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("../views/profile/profile.vue"),
          beforeEnter: (to, from, next) => {
            // 检查是否是管理员，如果是则重定向到管理后台
            const userId = localStorage.getItem("userId");
            if (userId === "admin") {
              next("/admin/dashboard");
            } else {
              next();
            }
          },
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
        {
          path: "/order-review/:orderId",
          name: "OrderReview",
          component: () => import("../views/order/components/order-review.vue"),
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
          path: "comments",
          name: "adminComments",
          component: () => import("../views/admin/comments/comments.vue"),
        },
        {
          path: "feedback",
          name: "adminFeedback",
          component: () => import("../views/admin/feedback/feedback.vue"),
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

// 全局路由守卫：根据路由切换登录上下文
router.beforeEach((to, from, next) => {
  const isAdminRoute = to.path.startsWith("/admin");
  const userStore = useUserStore();
  
  // 根据路由切换登录上下文
  if (isAdminRoute) {
    // 访问后台：检查admin登录状态
    const adminToken = localStorage.getItem("adminToken");
    const adminUserId = localStorage.getItem("adminUserId");
    
    if (!adminToken || adminUserId !== "admin") {
      // 未登录admin，跳转到登录页
      next("/login");
      return;
    }
    // 已登录admin，重新初始化admin用户信息
    userStore.initUserInfo();
  } else {
    // 访问前台：检查普通用户登录状态
    const userToken = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");
    
    // 如果userId是admin，说明是admin用户访问前台，不加载admin信息
    if (userId === "admin") {
      userStore.setUserInfo(null);
    } else if (userToken && userId) {
      // 普通用户已登录，重新初始化用户信息
      userStore.initUserInfo();
    }
  }
  
  next();
});

export default router;

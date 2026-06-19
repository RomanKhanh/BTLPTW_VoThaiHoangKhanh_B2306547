import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/auth/RegisterView.vue"),
    meta: { public: true },
  },
  {
    path: "/staff",
    component: () => import("../layouts/StaffLayout.vue"),
    meta: { requiresAuth: true, role: "staff" },
    children: [
      { path: "", redirect: "/staff/home" },
      {
        path: "home",
        name: "staff-home",
        component: () => import("../views/staff/HomeView.vue"),
      },
      {
        path: "books",
        name: "staff-books",
        component: () => import("../views/shared/BookListView.vue"),
      },
      {
        path: "books/:MaSach",
        name: "staff-book-detail",
        component: () => import("../views/shared/BookDetailView.vue"),
      },
      {
        path: "loans",
        name: "staff-loans",
        component: () => import("../views/staff/LoanManagementView.vue"),
      },
      {
        path: "readers",
        name: "staff-readers",
        component: () => import("../views/staff/ReaderManagementView.vue"),
      },
      {
        path: "publishers",
        name: "staff-publishers",
        component: () => import("../views/staff/PublisherManagementView.vue"),
      },
      {
        path: "staffs",
        name: "staff-staffs",
        component: () => import("../views/staff/StaffManagementView.vue"),
        meta: { adminOnly: true },
      },
      {
        path: "profile",
        name: "staff-profile",
        component: () => import("../views/staff/StaffProfileView.vue"),
      },
    ],
  },
  {
    path: "/reader",
    component: () => import("../layouts/ReaderLayout.vue"),
    meta: { requiresAuth: true, role: "reader" },
    children: [
      { path: "", redirect: "/reader/loans" },
      {
        path: "loans",
        name: "reader-loans",
        component: () => import("../views/reader/MyLoansView.vue"),
      },
      {
        path: "borrow",
        name: "reader-borrow",
        component: () => import("../views/shared/BookListView.vue"),
      },
      {
        path: "borrow/:MaSach",
        name: "reader-book-detail",
        component: () => import("../views/shared/BookDetailView.vue"),
      },
      {
        path: "profile",
        name: "reader-profile",
        component: () => import("../views/reader/ReaderProfileView.vue"),
      },
    ],
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.public) {
    // Đã đăng nhập rồi mà cố vào /login hoặc /register thì đưa về trang chính của role đó
    if (auth.isAuthenticated) {
      return auth.isStaff ? "/staff/home" : "/reader/loans";
    }
    return true;
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return "/login";
    }
    if (to.meta.role && auth.role !== to.meta.role) {
      return auth.isStaff ? "/staff/home" : "/reader/loans";
    }
  }

  if (to.meta.adminOnly && !auth.isManager) {
    return "/staff/home";
  }

  return true;
});

export default router;

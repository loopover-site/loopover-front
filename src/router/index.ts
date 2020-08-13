import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () =>
        import("../views/Login.vue")
  },
  {
    path: "/register",
    name: "Register",
    component: () =>
        import("../views/Register.vue")
  },
  {
    path: "/leaderboards",
    name: "Global Leaderboards",
    component: () =>
        import("../views/Leaderboards.vue")
  },
  {
    path: "/leaderboards/:category?/:subCategory?",
    name: "Leaderboards",
    component: () =>
        import("../views/Leaderboards.vue")
  },
  {
    path: "/submit",
    name: "Submit",
    component: () =>
        import("../views/Submit.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;

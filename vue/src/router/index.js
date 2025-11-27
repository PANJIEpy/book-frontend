import { createRouter, createWebHistory } from 'vue-router'
import Layout from "../layout/Layout";
import FrontLayout from "../layout/FrontLayout";

const routes = [
  {
    path: '/',
    name: 'Layout',
    redirect:"user",
    component: Layout,
    children:[
      {
        path:'user',
        name:'user',
        component:() => import("@/views/User")
      },
      {
        path: 'book',
        name: 'book',
        component: () => import("@/views/Book")
      },
      {
        path: 'person',
        name: 'Person',
        component: () => import("@/views/Person")
      },
      {
        path: 'password',
        name: 'Password',
        component: () => import("@/views/Password")
      },
      {
        path: 'lendrecord',
        name: 'LendRecord',
        component: () => import("@/views/LendRecord")
      },
      {
        path:'dashboard',
        name:'Dashboard',
        component:() => import("@/views/Dashboard")
      },
      {
        path: 'bookwithuser',
        name: 'BookWithUser',
        component: () => import("@/views/BookWithUser")
      },
      {
        path: 'purchase',
        name: 'Purchase',
        component: () => import("@/views/Purchase")
      },
      {
        path: 'catalog',
        name: 'Catalog',
        component: () => import("@/views/Catalog")
      },
      {
        path: 'collection',
        name: 'Collection',
        component: () => import("@/views/Collection")
      },
      {
        path: 'borrow-audit',
        name: 'BorrowAudit',
        component: () => import("@/views/BorrowAudit")
      },
      {
        path: 'return-fine',
        name: 'ReturnFine',
        component: () => import("@/views/ReturnFine")
      },
      {
        path: 'reservation',
        name: 'Reservation',
        component: () => import("@/views/Reservation")
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import("@/views/Inventory")
      },
      {
        path: 'journal',
        name: 'Journal',
        component: () => import("@/views/Journal")
      },
      {
        path: 'electronic-resource',
        name: 'ElectronicResource',
        component: () => import("@/views/ElectronicResource")
      },
      {
        path: 'announcement',
        name: 'Announcement',
        component: () => import("@/views/Announcement")
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import("@/views/Statistics")
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import("@/views/Permission")
      },
      {
        path: 'system-config',
        name: 'SystemConfig',
        component: () => import("@/views/SystemConfig")
      }
    ]
  },
  {
    path: '/front',
    name: 'FrontLayout',
    redirect: '/front/home',
    component: FrontLayout,
    children: [
      {
        path: 'home',
        name: 'FrontHome',
        component: () => import("@/views/front/Home")
      },
      {
        path: 'user-center',
        name: 'FrontUserCenter',
        component: () => import("@/views/front/UserCenter")
      },
      {
        path: 'search',
        name: 'FrontSearch',
        component: () => import("@/views/front/Search")
      },
      {
        path: 'borrow',
        name: 'FrontBorrow',
        component: () => import("@/views/front/Borrow")
      },
      {
        path: 'reservation',
        name: 'FrontReservation',
        component: () => import("@/views/front/Reservation")
      },
      {
        path: 'return-guide',
        name: 'FrontReturnGuide',
        component: () => import("@/views/front/ReturnGuide")
      },
      {
        path: 'review-collection',
        name: 'FrontReviewCollection',
        component: () => import("@/views/front/ReviewCollection")
      },
      {
        path: 'book-recommendation',
        name: 'FrontBookRecommendation',
        component: () => import("@/views/front/BookRecommendation")
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import("@/views/Login")
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import("@/views/Register")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫 - 控制未登录用户的访问权限和用户类型的页面访问权限
router.beforeEach((to, from, next) => {
  // 不需要登录的页面
  const noAuthPaths = ['/login', '/register'];
  
  // 检查是否需要认证
  if (!noAuthPaths.includes(to.path)) {
    // 获取token
    const token = sessionStorage.getItem('token');
    
    // 如果没有token，重定向到登录页面
    if (!token) {
      console.log('未检测到登录状态，重定向到登录页');
      return next('/login');
    }
    
    // 获取用户信息
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // 检查用户类型和访问路径
      if (user.userType !== 'ADMIN') {
        // 普通用户（学生/教师）只能访问前端页面
        if (to.path.startsWith('/front')) {
          // 允许访问前端页面
          next();
        } else {
          // 重定向到前端首页
          console.log('普通用户只能访问前端页面，重定向到前端首页');
          next('/front/home');
        }
      } else {
        // 管理员可以访问所有页面
        next();
      }
    } else {
      // 没有用户信息，重定向到登录页面
      next('/login');
    }
  } else {
    // 允许访问不需要登录的页面
    next();
  }
});

// 立即检查当前登录用户的类型和当前页面
// 如果普通用户当前在管理员页面，立即重定向到前端首页
const checkCurrentUserAndRedirect = () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const currentPath = window.location.pathname;
      
      if (user.userType !== 'ADMIN' && !currentPath.startsWith('/front') && currentPath !== '/login' && currentPath !== '/register') {
        console.log('检测到普通用户在管理员页面，立即重定向到前端首页');
        window.location.href = '/front/home';
      }
    }
  }
};

// 执行检查
checkCurrentUserAndRedirect();

export default router

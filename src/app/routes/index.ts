import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { CowRoutes } from '../modules/cow/cow.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { AuthRoutes } from '../modules/auth/auth.route';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/books',
    route: CowRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

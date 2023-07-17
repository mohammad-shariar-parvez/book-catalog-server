import express from 'express';
import { OrderController } from './order.controllers';
import { requestValidation } from '../../middleware/validationRequest';
import { OrderValidation } from './order.validation';
import auth from '../../middleware/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post(
  '/order-create',
  auth(ENUM_USER_ROLE.BUYER),
  requestValidation.validateRequest(OrderValidation.createOrderZodSchema),
  OrderController.createOrders
);
router.get(
  '/',
  auth(ENUM_USER_ROLE.SELLER, ENUM_USER_ROLE.BUYER, ENUM_USER_ROLE.ADMIN),
  OrderController.getAllOrders
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SELLER, ENUM_USER_ROLE.BUYER),
  OrderController.getOrder
);
export const OrderRoutes = router;

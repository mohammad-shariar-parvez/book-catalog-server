import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';
import { Request, Response } from 'express';
import { IOrder } from './order.interface';

const createOrders = catchAsync(async (req: Request, res: Response) => {
  const { ...order } = req.body;
  const result = await OrderService.createOrder(order);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order created successfully!',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const { ...requestedUser } = req.user;
  const result = await OrderService.getAllOrders(requestedUser);

  sendResponse<IOrder[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getOrder = catchAsync(async (req: Request, res: Response) => {
  const tokenUser = req.user;
  const id = req.params.id;
  const result = await OrderService.getOrder(id, tokenUser);

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully !',
    data: result,
  });
});
export const OrderController = {
  createOrders,
  getAllOrders,
  getOrder,
};

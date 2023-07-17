// import { IUser } from './../user/user.interface';
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interface/error';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import { User } from '../user/user.model';
import { Cow } from '../cow/cow.model';
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
// import { ICow } from '../cow/cow.interface';

const createOrder = async (payload: IOrder): Promise<IOrder | null> => {
  let newOrderData = null;
  const { buyer, cow } = payload;
  const budgetAmount = await User.findById(buyer).select('budget');
  const cowDetails = await Cow.findById(cow).select('price seller label');

  if (!budgetAmount || !cowDetails) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `something went wrong, buyer or cow not found !`
    );
  }
  if (cowDetails.label !== 'for sale') {
    throw new ApiError(httpStatus.NOT_FOUND, `This cow is already sold out !`);
  }
  if (budgetAmount?.budget && budgetAmount.budget < cowDetails.price) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `haven't enough money to purchase`
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const buyerUpdate = await User.findOneAndUpdate(
      { _id: buyer },
      {
        budget: budgetAmount?.budget && budgetAmount.budget - cowDetails.price,
      },
      {
        session,
      }
    );
    if (!buyerUpdate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to buyer Update');
    }
    const sellerInfo = await User.findById(cowDetails.seller).session(session);
    if (!sellerInfo) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Failed to find seller information'
      );
    }

    const SellerUpdate = await User.findOneAndUpdate(
      { _id: cowDetails.seller },
      { income: sellerInfo.income && sellerInfo.income + cowDetails.price },
      {
        session,
      }
    );
    if (!SellerUpdate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to Seller Update');
    }

    const updateCow = await Cow.findOneAndUpdate(
      { _id: cow },
      { label: 'sold out' },
      {
        session,
      }
    );
    if (!updateCow) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to update Cow');
    }

    const order = await Order.create([payload], { session: session });
    if (!order.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create order list');
    }
    newOrderData = order[0];

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  return newOrderData;
};

const getAllOrders = async (
  requestedUser: any
): Promise<IGenericResponse<IOrder[]>> => {
  const result = await Order.find()
    .sort()
    .populate({
      path: 'cow',
      populate: {
        path: 'seller',
        select: '-password',
      },
    })
    .populate({
      path: 'buyer',
      select: '-password',
    });

  const total = await Order.countDocuments();
  if (requestedUser.role === 'admin') {
    return {
      meta: {
        page: 1,
        limit: 2,
        total,
      },
      data: result,
    };
  } else if (requestedUser.role === 'buyer') {
    const specificBuyerOrder = result.filter(
      item => item.buyer?.id === requestedUser.id
    );
    const total = await specificBuyerOrder.length;
    return {
      meta: {
        page: 1,
        limit: 2,
        total,
      },
      data: specificBuyerOrder,
    };
  } else {
    const objectId = new mongoose.Types.ObjectId(requestedUser.id);

    const specificSellerForOrder = await Order.aggregate([
      {
        $lookup: {
          from: 'cows',
          localField: 'cow',
          foreignField: '_id',
          as: 'cowInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyerInfo',
        },
      },
      {
        $unwind: '$buyerInfo',
      },
      {
        $unwind: '$cowInfo',
      },
      {
        $match: { 'cowInfo.seller': objectId },
      },
      {
        $project: {
          buyerInfo: {
            password: 0,
          },
        },
      },
    ]);

    // const specificSellerForOrder = result.filter(item => {
    //   const result = item.cow as ICow;
    //   const specificOrder = result.seller.id;
    //   return specificOrder == requestedUser.id;
    // });

    const total = await specificSellerForOrder.length;
    return {
      meta: {
        page: 1,
        limit: 2,
        total,
      },
      data: specificSellerForOrder,
    };
  }
};

const getOrder = async (
  id: string,
  tokenUser: JwtPayload | null
): Promise<IOrder | null> => {
  //Rolebased response

  let result = null;

  if (tokenUser?.role == 'admin') {
    result = await Order.findById(id)
      .sort({ createdAt: -1 })
      .populate({
        path: 'cow',
        populate: {
          path: 'seller',
          select: '-password',
        },
      })
      .populate({
        path: 'buyer',
        select: '-password',
      });
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found!');
    }
  } else if (tokenUser?.role == 'seller') {
    result = await Order.findOne({ _id: id, seller: tokenUser?.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'cow',
        populate: {
          path: 'seller',
          select: '-password',
        },
      })
      .populate({
        path: 'buyer',
        select: '-password',
      });
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found!');
    }
  } else if (tokenUser?.role == 'buyer') {
    result = await Order.findOne({ _id: id, buyer: tokenUser?.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'cow',
        populate: {
          path: 'seller',
          select: '-password',
        },
      })
      .populate({
        path: 'buyer',
        select: '-password',
      });
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found!');
    }
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found!');
  }

  return result;
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrder,
};

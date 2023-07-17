import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { CowService } from './cow.service';

import pick from '../../../shared/pick';
import { CowFilterAbleFields } from './cow.constants';
import { paginationFields } from '../../constants/pagination';
import { IBook } from './cow.interface';

const addBook = catchAsync(async (req: Request, res: Response) => {
  const { ...book } = req.body;
  const result = await CowService.createBook(book);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book added successfully!',
    data: result,
  });
});

const getAllCows = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, CowFilterAbleFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await CowService.getAllBook(filters, paginationOptions);

  sendResponse<IBook[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCow = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await CowService.getSingleBook(id);

  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book retrieved successfully !',
    data: result,
  });
});

const updateCow = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log('ID UPDATE', id);

  const updatedData = req.body;
  console.log('BODY UPDATE', updatedData);
  const result = await CowService.updateBook(id, updatedData);

  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book updated successfully !',
    data: result,
  });
});

const deleteCow = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await CowService.deleteBook(id);

  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cow deleted successfully !',
    data: result,
  });
});

export const CowController = {
  addBook,
  getAllCows,
  getSingleCow,
  updateCow,
  deleteCow,
};

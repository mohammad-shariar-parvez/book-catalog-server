import { IBook, IBookFilters } from './cow.interface';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';

import { IGenericResponse } from '../../../interface/error';
import { IPaginationOptions } from '../../../interface/pagination';
import { CowSearchAbleFields } from './cow.constants';
import { paginationHelper } from '../../../helpers/paginationHelpers';
import { SortOrder } from 'mongoose';

import { Book } from './cow.model';

const createBook = async (payload: IBook): Promise<IBook | null> => {
  const result = await Book.create(payload);
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to add Book');
  }
  return result;
};

const getAllBook = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const { searchTerm, publicationDate, ...filtersData } = filters;
  console.log('FILTERS DATA', publicationDate);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: CowSearchAbleFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }
  if (publicationDate) {
    andConditions.push({
      $or: [
        {
          publicationDate: {
            $regex: publicationDate,
            $options: 'i',
          },
        },
      ],
      // $or: CowSearchAbleFields.map(field => ({
      //   [field]: {
      //     $regex: searchTerm,
      //     $options: 'i',
      //   },
      // })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const { page, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const sortCondition: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortCondition[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Book.find(whereConditions).sort(sortCondition);

  const total = await Book.countDocuments(whereConditions);
  return {
    meta: {
      page,
      total,
    },
    data: result,
  };
};

const getSingleBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found!');
  }
  return result;
};

const updateBook = async (
  id: string,
  payload: Partial<IBook>
): Promise<IBook | null> => {
  const isExist = await Book.findById(id);

  console.log('EXIST ', isExist);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found!');
  }
  if (payload.reviews) {
    const rev = payload.reviews;
    const res = await Book.updateOne({ _id: id }, { $push: { reviews: rev } });
    return res;
    // const result = await Book.findByIdAndUpdate(
    //   { _id: id },
    //   { $push: { reviews: payload.reviews } },
    //   { new: true }
    // );
    // return result;
  } else {
    const result = await Book.findByIdAndUpdate(id, payload, {
      new: true, // return new document of the DB
    });
    return result;
  }
};

const deleteBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to delete Book');
  }

  return result;
};

export const CowService = {
  createBook,
  getAllBook,
  getSingleBook,
  updateBook,
  deleteBook,
};

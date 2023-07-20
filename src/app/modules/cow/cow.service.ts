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

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found!');
  }
  if (payload.reviews) {
    const result = await Book.findByIdAndUpdate(
      id,
      { $push: { reviews: payload.reviews } },
      { new: true }
    );
    return result;
  } else {
    const result = await Book.findByIdAndUpdate(id, payload, {
      new: true, // return new document of the DB
    });
    return result;
  }

  //ANOTHER SOLUTION
  // const { reviews, ...payload } = req.body;
  //  let updateObject: any = {};

  //  // Check if 'reviews' field is present in the payload
  //  if (reviews) {
  //    updateObject.$push = { reviews }; // Use the reviews directly to update the reviews field
  //  }

  //  // Include other fields in the updateObject
  //  if (Object.keys(payload).length > 0) {
  //    updateObject = { ...updateObject, ...payload };
  //  }

  //  const updatedBook = await Book.findByIdAndUpdate(id, updateObject, {
  //    new: true,
  //  });
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

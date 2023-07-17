import { Model, Types } from 'mongoose';

export type IBook = {
  title: string;
  author: string;
  genre: string;
  publicationDate: string;
  reviews: [];
  image: string;
  userId: Types.ObjectId;
};

export type BookModel = Model<IBook, Record<string, unknown>>;

export type IBookFilters = {
  searchTerm?: string;
  genre?: string;
  publicationDate?: string;
};

export type ITokenUser = {
  id: string;
  role: string;
  iat: number;
  exp: number;
};

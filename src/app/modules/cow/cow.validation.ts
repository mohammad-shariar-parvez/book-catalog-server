import { z } from 'zod';

const addBookZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'title is required',
    }),
    author: z.string({
      required_error: 'author is required',
    }),
    genre: z.string({
      required_error: ' genre is required',
    }),
    publicationDate: z.string({
      required_error: 'publicationDate is required',
    }),
    reviews: z.array(z.string()).optional(),
    image: z.string({
      required_error: 'image is required',
    }),
    userId: z.string({
      required_error: ' userId is required',
    }),
  }),
});

const updateCowZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    genre: z.string().optional(),
    publicationDate: z.string().optional(),
    reviews: z.string().optional(),
    image: z.string().optional(),
    userId: z.string().optional(),
  }),
});
export const BookValidation = {
  addBookZodSchema,
  updateCowZodSchema,
};

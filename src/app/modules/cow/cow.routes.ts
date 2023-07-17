import express from 'express';
import { CowController } from './cow.controllers';
import { BookValidation } from './cow.validation';
import { requestValidation } from '../../middleware/validationRequest';

const router = express.Router();

router.post(
  '/add-book',
  requestValidation.validateRequest(BookValidation.addBookZodSchema),
  CowController.addBook
);

router.get('/', CowController.getAllCows);

router.get('/:id', CowController.getSingleCow);
router.delete('/:id', CowController.deleteCow);
router.patch(
  '/:id',
  requestValidation.validateRequest(BookValidation.updateCowZodSchema),
  CowController.updateCow
);

export const CowRoutes = router;

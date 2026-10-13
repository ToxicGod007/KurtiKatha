import express from 'express';
import { getProducts, getProductBySlugOrId, getFeaturedCollections } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedCollections);
router.get('/:identifier', getProductBySlugOrId);

export default router;

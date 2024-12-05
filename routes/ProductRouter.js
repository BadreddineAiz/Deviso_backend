import { Router } from 'express';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
} from '../controller/productController.js';

import { protect } from '../controller/authController.js';
import featuresCheck from '../middlewares/featuresCheck.js';
import {
    PRODUCT_CREATE,
    PRODUCT_READ,
    PRODUCT_UPDATE,
    PRODUCT_DELETE,
} from '../data/FeaturesList.js';

const router = Router();

router.use(protect);

router
    .route('/')
    .get(featuresCheck(PRODUCT_READ), getProducts)
    .post(featuresCheck(PRODUCT_CREATE), createProduct);

router
    .route('/:documentID')
    .get(featuresCheck(PRODUCT_READ), getProduct)
    .patch(featuresCheck(PRODUCT_UPDATE), updateProduct)
    .delete(featuresCheck(PRODUCT_DELETE), deleteProduct);

export default router;

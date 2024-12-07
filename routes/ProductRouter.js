import { Router } from 'express';
import {
    createProduct,
    deleteProduct,
    getApproProducts,
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
import {
    resizeProductImage,
    uploadProductImage,
} from '../middlewares/productImageMiddleware.js';

const router = Router();

router.use(protect);

router
    .route('/')
    .get(featuresCheck(PRODUCT_READ), getProducts)
    .post(
        featuresCheck(PRODUCT_CREATE),
        uploadProductImage,
        resizeProductImage,
        createProduct
    );

router.get('/appro', featuresCheck(PRODUCT_READ), getApproProducts);

router
    .route('/:documentID')
    .get(featuresCheck(PRODUCT_READ), getProduct)
    .patch(
        featuresCheck(PRODUCT_UPDATE),
        uploadProductImage,
        resizeProductImage,
        updateProduct
    )
    .delete(featuresCheck(PRODUCT_DELETE), deleteProduct);

export default router;

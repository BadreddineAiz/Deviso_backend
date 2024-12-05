import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from './handlerFactory.js';

import Product from '../model/ProductModel.js';
import { generateNumericBarcode } from '../utils/helpers.js';

export const getProduct = getDocument(Product, null);
export const getProducts = getDocuments(Product, null);
export const createProduct = createDocument(Product, (req) => {
    const barCode = req.body.barCode ?? generateNumericBarcode();

    return {
        user: req.user.id,
        barCode,
    };
});
export const updateProduct = updateDocument(Product, null);
export const deleteProduct = deleteDocument(Product, null);

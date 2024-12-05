import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from './handlerFactory.js';

import Product from '../model/ProductModel.js';

export const getProduct = getDocument(Product);
export const getProducts = getDocuments(Product);
export const createProduct = createDocument(Product);
export const updateProduct = updateDocument(Product);
export const deleteProduct = deleteDocument(Product);

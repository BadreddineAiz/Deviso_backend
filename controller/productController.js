import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from './handlerFactory.js';

import Product from '../model/ProductModel.js';
import { generateNumericBarcode } from '../utils/helpers.js';
import { UserFilter } from '../data/FeaturesList.js';

export const getProduct = getDocument(Product, UserFilter);
export const getProducts = getDocuments(Product, UserFilter);
export const createProduct = createDocument(Product, (req) => {
    const barCode = req.body.barCode?.trim().length
        ? req.body.barCode
        : generateNumericBarcode();
    const AdditionalData = { user: req.user.id, barCode };
    if (req.file) AdditionalData.image = req.file.filePath;

    return AdditionalData;
});
export const updateProduct = updateDocument(
    Product,
    UserFilter,
    null,
    null,
    null,
    (req) => {
        if (req.file) req.body.image = req.file.filePath;
        return {};
    }
);
export const deleteProduct = deleteDocument(Product, UserFilter);

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

const ApproFilter = (req) => {
    return {
        user: req.user.id,
        $expr: { $lte: ['$quantity', '$minimalQuantity'] },
    };
};

export const getProduct = getDocument(Product, UserFilter);
export const getProducts = getDocuments(Product, UserFilter);
export const getApproProducts = getDocuments(Product, ApproFilter);
export const createProduct = createDocument(Product, (req) => {
    const barcode = req.body.barcode?.trim().length
        ? req.body.barcode
        : generateNumericBarcode();
    const AdditionalData = { user: req.user.id, barcode };
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

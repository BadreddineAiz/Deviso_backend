import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from './handlerFactory.js';

import Client from '../model/clientModel.js';
import { UserFilter } from '../data/FeaturesList.js';

export const getClient = getDocument(Client, UserFilter);
export const getClients = getDocuments(Client, UserFilter);
export const createClient = createDocument(Client, (req) => ({
    user: req.user.id,
}));
export const updateClient = updateDocument(Client, UserFilter);
export const deleteClient = deleteDocument(Client, UserFilter);

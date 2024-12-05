import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from './handlerFactory.js';

import Client from '../model/clientModel.js';

export const getClient = getDocument(Client, null);
export const getClients = getDocuments(Client, null);
export const createClient = createDocument(Client, (req) => ({
    user: req.user.id,
}));
export const updateClient = updateDocument(Client, null);
export const deleteClient = deleteDocument(Client, null);

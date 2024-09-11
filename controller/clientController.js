import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "./handlerFactory.js";

import Client from "../model/clientModel.js";

export const getClient = getDocument(Client);
export const getClients = getDocuments(Client);
export const createClient = createDocument(Client);
export const updateClient = updateDocument(Client);
export const deleteClient = deleteDocument(Client);

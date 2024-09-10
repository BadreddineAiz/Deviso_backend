const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} = require("./handlerFactory");

const Client = require("../model/clientModel");

exports.getClient = getDocument(Client);
exports.getClients = getDocuments(Client);
exports.createClient = createDocument(Client);
exports.updateClient = updateDocument(Client);
exports.deleteClient = deleteDocument(Client);

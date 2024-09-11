export const DEVIS_CREATE = "DEVIS/CREATE";
export const DEVIS_READ = "DEVIS/READ";
export const DEVIS_UPDATE = "DEVIS/UPDATE";
export const DEVIS_DELETE = "DEVIS/DELETE";

export const FACTURE_CREATE = "FACTURE/CREATE";
export const FACTURE_READ = "FACTURE/READ";
export const FACTURE_DELETE = "FACTURE/DELETE";

export const CLIENT_CREATE = "CLIENT/CREATE";
export const CLIENT_READ = "CLIENT/READ";
export const CLIENT_UPDATE = "CLIENT/UPDATE";
export const CLIENT_DELETE = "CLIENT/DELETE";

export const DefaultFeatures = [
  //DEVIS
  DEVIS_CREATE,
  DEVIS_READ,
  DEVIS_UPDATE,
  DEVIS_DELETE,
  //FACTURES
  FACTURE_CREATE,
  FACTURE_READ,
  FACTURE_DELETE,
  //CLIENTS
  CLIENT_CREATE,
  CLIENT_READ,
  CLIENT_UPDATE,
  CLIENT_DELETE,
];

const AllFeatures = [...DefaultFeatures];

export default {
  //DEVIS
  DEVIS_CREATE,
  DEVIS_READ,
  DEVIS_UPDATE,
  DEVIS_DELETE,
  //FACTURES
  FACTURE_CREATE,
  FACTURE_READ,
  FACTURE_DELETE,
  //CLIENTS
  CLIENT_CREATE,
  CLIENT_READ,
  CLIENT_UPDATE,
  CLIENT_DELETE,
  AllFeatures,
};

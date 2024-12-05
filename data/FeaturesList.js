export const DEVIS_CREATE = 'DEVIS/CREATE';
export const DEVIS_READ = 'DEVIS/READ';
export const DEVIS_UPDATE = 'DEVIS/UPDATE';
export const DEVIS_DELETE = 'DEVIS/DELETE';

export const FACTURE_CREATE = 'FACTURE/CREATE';
export const FACTURE_READ = 'FACTURE/READ';
export const FACTURE_UPDATE = 'FACTURE/UPDATE';
export const FACTURE_DELETE = 'FACTURE/DELETE';
export const FACTURE_AVOIR_CREATE = 'FACTURE_AVOIR/CREATE';
export const BONLIVRAISON_READ = 'BONLIVRAISON/READ';

export const CLIENT_CREATE = 'CLIENT/CREATE';
export const CLIENT_READ = 'CLIENT/READ';
export const CLIENT_UPDATE = 'CLIENT/UPDATE';
export const CLIENT_DELETE = 'CLIENT/DELETE';

export const PRODUCT_CREATE = 'PRODUCT/CREATE';
export const PRODUCT_READ = 'PRODUCT/READ';
export const PRODUCT_UPDATE = 'PRODUCT/UPDATE';
export const PRODUCT_DELETE = 'PRODUCT/DELETE';

export const DefaultFeatures = [
    //DEVIS
    DEVIS_CREATE,
    DEVIS_READ,
    DEVIS_UPDATE,
    DEVIS_DELETE,
    //FACTURES
    FACTURE_CREATE,
    FACTURE_READ,
    FACTURE_UPDATE,
    FACTURE_DELETE,
    BONLIVRAISON_READ,
    FACTURE_AVOIR_CREATE,
    //CLIENTS
    CLIENT_CREATE,
    CLIENT_READ,
    CLIENT_UPDATE,
    CLIENT_DELETE,
    //PRODUCTS
    PRODUCT_CREATE,
    PRODUCT_READ,
    PRODUCT_UPDATE,
    PRODUCT_DELETE,
];

export const UserFilter = (req) => {
    return { user: req.user.id };
};

export const AllFeatures = [...DefaultFeatures];

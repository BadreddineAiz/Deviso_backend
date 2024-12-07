import expressAsyncHandler from 'express-async-handler';
import Client from '../model/clientModel.js';
import Facture from '../model/factureModel.js';
import Devis from '../model/devisModel.js';
import mongoose from 'mongoose';
import Product from '../model/ProductModel.js';

export const getDashboardStats = expressAsyncHandler(async (req, res) => {
    const years = parseInt(req.query.years) || 0;

    const startDate = new Date(new Date().getFullYear() - years, 0, 1);

    const endDate = new Date(startDate.getFullYear(), 12, 1);

    const filter = { user: req.user.id, active: true };

    const totalClients = await Client.countDocuments(filter);

    const numberProducts = await Product.countDocuments(filter);

    const numberApproProducts = await Product.countDocuments({
        ...filter,
        $expr: { $lte: ['$quantity', '$minimalQuantity'] },
    });

    const unpaidFactures = await Facture.countDocuments({
        ...filter,
        payer: false,
    });

    const deadlineFactures = await Facture.countDocuments({
        ...filter,
        payer: false,
        limitPaymentDate: { $lt: new Date() },
    });

    const totalFactures = await Facture.countDocuments({
        ...filter,
        createdAt: { $gte: startDate, $lte: endDate },
    });

    const paidFactures = totalFactures - unpaidFactures;

    const totalDevis = await Devis.countDocuments({
        ...filter,
        createdAt: { $gte: startDate, $lte: endDate },
    });

    const revenueByMonth = await Facture.aggregate([
        {
            $match: {
                active: true,
                user: new mongoose.Types.ObjectId(req.user.id),
                payer: true,
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                total: { $sum: '$totalAmount' },
            },
        },
        {
            $project: {
                _id: 0, // Exclude _id
                month: '$_id', // Rename _id to month
                total: 1, // Include total in the result
            },
        },
        {
            $sort: {
                '_id.month': 1, // Sort by month
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            totalClients,
            totalDevis,
            totalFactures,
            numberProducts,
            numberApproProducts,
            paidFactures,
            unpaidFactures,
            deadlineFactures,
            revenueByMonth,
        },
    });
});

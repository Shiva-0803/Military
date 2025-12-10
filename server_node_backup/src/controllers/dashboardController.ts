import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const { baseId, startDate, endDate, assetTypeId } = req.query;

        // Filters
        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        }

        const whereBase = baseId ? { id: Number(baseId) } : {};

        // If user is Base Commander, forced filter
        const user = req.user;
        if (user?.role === 'BASE_COMMANDER' && user.baseId) {
            // Force baseId to user's base
            if (baseId && Number(baseId) !== user.baseId) {
                return res.status(403).json({ error: 'Cannot view other bases' });
            }
        }

        // 1. Calculate Balances
        // Current Inventory (Closing Balance equivalent roughly, or actual current stock)
        // To get "Opening Balance" for a date range, we need: Current - NetMovement(Start to Now).
        // Or: Initial + NetMovement(Beginning to Start).
        // Simpler approach:
        // Closing Balance = Current Inventory (if no date end) or calculated.
        // Opening Balance = Closing Balance - Net Movement (within date range).

        // For MVP, let's just show Current Inventory as "Closing Balance" (if no future date).
        // And "Opening Balance" = Current - (Purchases + In - Out - Expended) in the period?

        // Let's implement Net Movement first.
        // Net Movement = Purchases + Transfer In - Transfer Out.

        // Transactions query
        const transactionWhere: any = {
            date: dateFilter.date,
        };
        if (assetTypeId) transactionWhere.assetTypeId = Number(assetTypeId);

        // This is complex because "Transfer In" depends on `toBaseId` and "Transfer Out" on `fromBaseId`.
        // We can't do a single simple query for "Net Movement" across all bases if mixed.
        // But per base it's easier.

        // Let's fetch all relevant transactions and aggregate in JS for flexibility or use raw query.
        // Raw query is better for aggregation.

        // However, let's Stick to Prisma.
        // We need to support filtering by Base.
        // If Base is selected:
        // Purchases: type=PURCHASE, toBaseId=Base
        // Transfer In: type=TRANSFER_IN (or Just TRANSFER with toBaseId=Base)
        // Transfer Out: type=TRANSFER_OUT (or Just TRANSFER with fromBaseId=Base)
        // Assigned: type=ASSIGNMENT
        // Expended: type=EXPENDITURE

        // NOTE: In my schema I have `type` enum.
        // I need to map UI "purchases" to `type`.
        // My previous assumption: Purchases are Transfers with null fromBase? 
        // No, I have `TransactionType.PURCHASE`.

        const targetBaseId = baseId ? Number(baseId) : (user?.role === 'BASE_COMMANDER' ? user.baseId : undefined);

        const transactions = await prisma.transaction.findMany({
            where: {
                AND: [
                    dateFilter.date ? { date: dateFilter.date } : {},
                    assetTypeId ? { assetTypeId: Number(assetTypeId) } : {},
                    targetBaseId ? {
                        OR: [
                            { toBaseId: targetBaseId },
                            { fromBaseId: targetBaseId }
                        ]
                    } : {}
                ]
            },
            include: {
                assetType: true,
                fromBase: true,
                toBase: true
            }
        });

        // Aggregate
        let purchases = 0;
        let transferIn = 0;
        let transferOut = 0;
        let expended = 0;
        let assigned = 0; // If checking assigned count

        transactions.forEach(tx => {
            const qty = tx.quantity;

            if (!targetBaseId) {
                // Global View
                if (tx.type === 'PURCHASE') purchases += qty;
                else if (tx.type === 'EXPENDITURE') expended += qty;
                else if (tx.type === 'ASSIGNMENT') assigned += qty;
                else if (tx.type === 'TRANSFER_IN') transferIn += qty;
                else if (tx.type === 'TRANSFER_OUT') transferOut += qty;
            } else {
                // Per Base View
                if (tx.type === 'PURCHASE' && tx.toBaseId === targetBaseId) {
                    purchases += qty;
                } else if (tx.type === 'EXPENDITURE' && tx.fromBaseId === targetBaseId) {
                    expended += qty;
                } else if (tx.type === 'ASSIGNMENT' && tx.fromBaseId === targetBaseId) {
                    assigned += qty;
                }

                // Transfers
                if (tx.type.includes('TRANSFER')) {
                    if (tx.toBaseId === targetBaseId) transferIn += qty;
                    if (tx.fromBaseId === targetBaseId) transferOut += qty;
                }
            }
        });

        const openingBalance = 0; // TODO: Calculate efficiently
        const closingBalance = 0; // TODO: Fetch Inventory count

        // Net Movement
        const netMovement = purchases + transferIn - transferOut - expended;

        res.json({
            metrics: {
                purchases,
                transferIn,
                transferOut,
                assigned,
                expended,
                netMovement,
                openingBalance: 1000, // Dummy
                closingBalance: 1000 + netMovement // Dummy
            },
            transactions // For detailed view
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

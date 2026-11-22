import { createPaperAccount as createPaperAccountRecord, findPaperAccount, listPaperAccounts, setPaperAccountStatus } from "@trafind/database";
import { PaperAccountStatus } from "@trafind/database";
import { createPaperAccountSchema, paperAccountIdSchema, paperAccountStatusSchema } from "../schemas/paper-trading.schema.js";
function serializeAccount(account) {
    const result = {
        id: account.id,
        name: account.name,
        symbol: account.symbol,
        marketType: account.marketType === "SPOT" ? "spot" : "usdm",
        interval: "1h",
        strategyName: account.strategyName,
        status: account.status.toLowerCase(),
        marginMode: account.marginMode?.toLowerCase() ?? null,
        leverage: account.leverage,
        initialCapital: Number(account.initialCapital),
        cash: Number(account.cash),
        assetQuantity: Number(account.assetQuantity),
        averageEntryPrice: account.averageEntryPrice === null
            ? null
            : Number(account.averageEntryPrice),
        stopLossPrice: account.stopLossPrice === null
            ? null
            : Number(account.stopLossPrice),
        isolatedMargin: Number(account.isolatedMargin),
        realizedPnl: Number(account.realizedPnl),
        equity: Number(account.equity),
        lastMarkPrice: account.lastMarkPrice === null
            ? null
            : Number(account.lastMarkPrice),
        lastProcessedOpenTime: account.lastProcessedOpenTime?.toISOString() ?? null,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString()
    };
    if ("trades" in account) {
        return {
            ...result,
            trades: account.trades.map((trade) => ({
                id: trade.id,
                candleOpenTime: trade.candleOpenTime.toISOString(),
                action: trade.action.toLowerCase(),
                executionPrice: Number(trade.executionPrice),
                quantity: Number(trade.quantity),
                fee: Number(trade.fee),
                fundingAmount: Number(trade.fundingAmount),
                realizedPnl: Number(trade.realizedPnl),
                reason: trade.reason,
                createdAt: trade.createdAt.toISOString()
            }))
        };
    }
    return result;
}
function isUniqueConstraintError(error) {
    return typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002";
}
function getId(requestId) {
    const id = Array.isArray(requestId) ? requestId[0] : requestId;
    return paperAccountIdSchema.safeParse(id);
}
export const createPaperAccount = async (req, res, next) => {
    const parsed = createPaperAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            error: {
                message: "Invalid paper account request",
                details: parsed.error.issues
            }
        });
        return;
    }
    try {
        const account = await createPaperAccountRecord({
            ...parsed.data,
            marketType: parsed.data.marketType === "spot" ? "SPOT" : "USD_M_FUTURES"
        });
        res.status(201).json({
            success: true,
            data: {
                ...serializeAccount(account),
                executionMode: "paper",
                shortSellingEnabled: false
            }
        });
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            res.status(409).json({
                success: false,
                error: { message: "A paper account with this name already exists" }
            });
            return;
        }
        next(error);
    }
};
export const getPaperAccounts = async (_req, res, next) => {
    try {
        const accounts = await listPaperAccounts();
        res.status(200).json({
            success: true,
            data: accounts.map((account) => ({
                ...serializeAccount(account),
                executionMode: "paper",
                shortSellingEnabled: false
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
export const getPaperAccount = async (req, res, next) => {
    const parsedId = getId(req.params.id);
    if (!parsedId.success) {
        res.status(400).json({
            success: false,
            error: { message: "Invalid paper account ID" }
        });
        return;
    }
    try {
        const account = await findPaperAccount(parsedId.data);
        if (!account) {
            res.status(404).json({
                success: false,
                error: { message: "Paper account not found" }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...serializeAccount(account),
                executionMode: "paper",
                shortSellingEnabled: false
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const updatePaperAccountStatus = async (req, res, next) => {
    const parsedId = getId(req.params.id);
    const parsedStatus = paperAccountStatusSchema.safeParse(req.body);
    if (!parsedId.success || !parsedStatus.success) {
        res.status(400).json({
            success: false,
            error: {
                message: "Invalid paper account status request",
                details: parsedStatus.success ? undefined : parsedStatus.error.issues
            }
        });
        return;
    }
    try {
        const status = parsedStatus.data.status === "active"
            ? PaperAccountStatus.ACTIVE
            : PaperAccountStatus.PAUSED;
        const updated = await setPaperAccountStatus(parsedId.data, status);
        if (!updated) {
            res.status(404).json({
                success: false,
                error: { message: "Paper account not found" }
            });
            return;
        }
        const account = await findPaperAccount(parsedId.data);
        if (!account) {
            res.status(404).json({
                success: false,
                error: { message: "Paper account not found" }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                ...serializeAccount(account),
                executionMode: "paper",
                shortSellingEnabled: false
            }
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=paper-trading.controller.js.map
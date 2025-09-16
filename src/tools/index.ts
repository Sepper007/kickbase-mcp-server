import { z } from "zod";
import type { KickbaseService } from '../services/kickbase.service.js';
import { ToolResponseBuilder } from '../utils/response-builder.js';

export function createGetPlayerInfoTool(kickbaseService: KickbaseService) {
    return {
        name: 'get-kickbase-player-information',
        config: {
            title: 'Get information about a kickbase player based on their id',
            description: 'Get information, such as performance and market value data about a player based on playerId',
            inputSchema: {
                playerId: z.string()
            }
        },
        handler: async ({ playerId }: { playerId: string }) => {
            const text = await kickbaseService.getPlayerInformation(playerId);
            return ToolResponseBuilder.createTextResponse(text);
        }
    };
}

export function createListMarketTool(kickbaseService: KickbaseService) {
    return {
        name: "list-kickbase-market",
        config: {
            title: "List players that are currently on the kickbase market",
            description: "Returns players that are currently listed on the kickbase market and can be bought",
            inputSchema: {}
        },
        handler: async () => {
            const playersFound = await kickbaseService.getMarketPlayers();
            return ToolResponseBuilder.createTextResponse(playersFound);
        }
    };
}

export function createMakeOfferTool(kickbaseService: KickbaseService) {
    return {
        name: "make-kickbase-offer-for-player",
        config: {
            title: "Make an offer in kickbase for a given player",
            description: "Makes an offer with a provided value, for a given player",
            inputSchema: {
                playerId: z.string(),
                price: z.number()
            }
        },
        handler: async ({ playerId, price }: { playerId: string; price: number }) => {
            await kickbaseService.makeOffer(playerId, price);
            return ToolResponseBuilder.createTextResponse('Offer made successfully');
        }
    };
}
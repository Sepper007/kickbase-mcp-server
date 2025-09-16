import { CONFIG } from '../config/constants.js';
import type { KickbaseApiClient } from '../api/kickbase-client.js';
import type { MarketValueData, MarketValueTrends } from '../types/kickbase.types.js';

export class KickbaseService {
    constructor(private apiClient: KickbaseApiClient) {}

    async getMarketPlayers(limit: number = CONFIG.DEFAULT_MARKET_LIMIT): Promise<string> {
        const data = await this.apiClient.getMarketPlayers();
        
        const sortedPlayers = [...data.it].sort((a, b) => a.exs - b.exs);
        
        const playersText = sortedPlayers
            .slice(0, limit)
            .map(player => 
                `${player.fn}, ${player.n} (market value: ${player.mv}, playerId: ${player.i}, expires in ${Math.round(player.exs / 60)} minutes)`
            )
            .join('\n');
        
        return playersText;
    }

    async getPlayerInformation(playerId: string): Promise<string> {
        const [playerData, marketValueData] = await Promise.all([
            this.apiClient.getPlayerData(playerId),
            this.apiClient.getPlayerMarketValue(playerId)
        ]);

        const pointsLastThreeGames = playerData.ph
            .slice(0, 3)
            .map(d => d.p)
            .join(',');

        const { oneDayTrend, sevenDayTrend } = this.calculateMarketValueTrends(marketValueData);

        return `name: ${playerData.fn} ${playerData.ln}, team: ${playerData.tn}, market value: ${playerData.mv}, total points: ${playerData.tp}, average points: ${playerData.ap}, points last 3 games: [${pointsLastThreeGames}], 1-day market value trend: ${oneDayTrend}, 7-days market value trend: ${sevenDayTrend}`;
    }

    private calculateMarketValueTrends(marketValueData: MarketValueData): MarketValueTrends {
        const entries = marketValueData.it.slice(-7);
        
        if (entries.length < 2) {
            return { oneDayTrend: 0, sevenDayTrend: 0 };
        }

        const oneDayTrend = entries.length >= 2 
            ? entries[entries.length - 1].mv - entries[entries.length - 2].mv 
            : 0;
        
        const sevenDayTrend = entries[entries.length - 1].mv - entries[0].mv;

        return { oneDayTrend, sevenDayTrend };
    }

    async makeOffer(playerId: string, price: number): Promise<void> {
        await this.apiClient.makeOffer(playerId, price);
    }
}
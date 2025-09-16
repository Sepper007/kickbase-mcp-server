import { CONFIG } from '../config/constants.js';
import type { PlayerMarketItem, PlayerData, MarketValueData } from '../types/kickbase.types.js';

export class KickbaseApiClient {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor() {
        this.baseUrl = `${CONFIG.KICKBASE_API_BASE}/leagues/${CONFIG.LEAGUE_ID}`;
        this.headers = {
            // @ts-ignore
            'Cookie': process.env.KB_COOKIE,
            'Content-Type': 'application/json',
        };
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Kickbase API error! Status: ${response.status}, Endpoint: ${endpoint}`);
        }

        return response.json();
    }

    async getMarketPlayers(): Promise<{ it: PlayerMarketItem[] }> {
        console.error('Fetching market data...');
        const data = await this.makeRequest<{ it: PlayerMarketItem[] }>('/market');
        console.error(`Resolved market data: ${JSON.stringify(data)}`);
        return data;
    }

    async getPlayerData(playerId: string): Promise<PlayerData> {
        console.error(`Making player data request for player with id ${playerId}`);
        const data = await this.makeRequest<PlayerData>(`/players/${playerId}`);
        console.error(`Player data: ${JSON.stringify(data)}`);
        return data;
    }

    async getPlayerMarketValue(playerId: string, timeframe: number = CONFIG.DEFAULT_MV_TIMEFRAME): Promise<MarketValueData> {
        console.error(`Fetching market value data for player ${playerId}`);
        const data = await this.makeRequest<MarketValueData>(`/players/${playerId}/marketvalue/${timeframe}`);
        console.error(`Player market value data: ${JSON.stringify(data)}`);
        return data;
    }

    async makeOffer(playerId: string, price: number): Promise<void> {
        await this.makeRequest(`/market/${playerId}/offers`, {
            method: 'POST',
            body: JSON.stringify({ price }),
        });
    }
}
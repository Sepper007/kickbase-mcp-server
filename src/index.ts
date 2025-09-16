import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Configuration constants
const CONFIG = {
    // TODO: Dynamically resolve this
    KB_COOKIE: process.env.KB_COOKIE,
    LEAGUE_ID: '5826036',
    KICKBASE_API_BASE: 'https://api.kickbase.com/v4',
} as const;

// Types
interface PlayerMarketItem {
    fn: string;
    n: string;
    mv: number;
    i: string;
    exs: number;
}

interface PlayerData {
    fn: string;
    ln: string;
    tn: string;
    mv: number;
    tp: number;
    ap: number;
    ph: Array<{ p: number }>;
}

interface MarketValueEntry {
    mv: number;
}

interface MarketValueData {
    it: MarketValueEntry[];
}

// Utility class for Kickbase API interactions
class KickbaseApiClient {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor() {
        this.baseUrl = `${CONFIG.KICKBASE_API_BASE}/leagues/${CONFIG.LEAGUE_ID}`;
        this.headers = {
            'Cookie': CONFIG.KB_COOKIE,
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

    async getPlayerMarketValue(playerId: string, timeframe: number = 92): Promise<MarketValueData> {
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

// Business logic class
class KickbaseService {
    constructor(private apiClient: KickbaseApiClient) {}

    async getMarketPlayers(limit: number = 20): Promise<string> {
        const data = await this.apiClient.getMarketPlayers();
        
        // Sort by expiration ascending
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

    private calculateMarketValueTrends(marketValueData: MarketValueData): { oneDayTrend: number; sevenDayTrend: number } {
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

// Tool response helper
class ToolResponseBuilder {
    static createTextResponse(text: string) {
        return {
            content: [{
                type: "text" as const,
                text
            }]
        };
    }
}

// Server setup class
class KickbaseMcpServer {
    private server: McpServer;
    private kickbaseService: KickbaseService;

    constructor() {
        this.server = new McpServer({
            name: "kickbase-mcp",
            version: "1.0.0",
            capabilities: {
                resources: {},
                tools: {},
            },
        });

        const apiClient = new KickbaseApiClient();
        this.kickbaseService = new KickbaseService(apiClient);
        
        this.registerTools();
    }

    private registerTools(): void {
        this.registerGetPlayerInformationTool();
        this.registerListMarketTool();
        this.registerMakeOfferTool();
    }

    private registerGetPlayerInformationTool(): void {
        this.server.registerTool(
            'get-kickbase-player-information',
            {
                title: 'Get information about a kickbase player based on their id',
                description: 'Get information, such as performance and market value data about a player based on playerId',
                inputSchema: {
                    playerId: z.string()
                }
            },
            async ({ playerId }) => {
                const text = await this.kickbaseService.getPlayerInformation(playerId as string);
                return ToolResponseBuilder.createTextResponse(text);
            }
        );
    }

    private registerListMarketTool(): void {
        this.server.registerTool(
            "list-kickbase-market",
            {
                title: "List players that are currently on the kickbase market",
                description: "Returns players that are currently listed on the kickbase market and can be bought",
                inputSchema: {}
            },
            async () => {
                const playersFound = await this.kickbaseService.getMarketPlayers();
                return ToolResponseBuilder.createTextResponse(playersFound);
            }
        );
    }

    private registerMakeOfferTool(): void {
        this.server.registerTool(
            "make-kickbase-offer-for-player",
            {
                title: "Make an offer in kickbase for a given player",
                description: "Makes an offer with a provided value, for a given player",
                inputSchema: {
                    playerId: z.string(),
                    price: z.number()
                }
            },
            async ({ playerId, price }) => {
                await this.kickbaseService.makeOffer(playerId as string, price as number);
                return ToolResponseBuilder.createTextResponse('Offer made successfully');
            }
        );
    }

    async start(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Kickbase MCP Server running on stdio");
    }
}

// Application entry point
async function main(): Promise<void> {
    const mcpServer = new KickbaseMcpServer();
    await mcpServer.start();
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
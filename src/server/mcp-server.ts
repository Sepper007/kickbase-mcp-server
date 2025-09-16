import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { KickbaseApiClient } from '../api/kickbase-client.js';
import { KickbaseService } from '../services/kickbase.service.js';
import { 
    createGetPlayerInfoTool, 
    createListMarketTool, 
    createMakeOfferTool 
} from '../tools/index.js';

export class KickbaseMcpServer {
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
        const tools = [
            createGetPlayerInfoTool(this.kickbaseService),
            createListMarketTool(this.kickbaseService),
            createMakeOfferTool(this.kickbaseService),
        ];

        tools.forEach(tool => {
            // @ts-ignore
            this.server.registerTool(tool.name, tool.config, tool.handler);
        });
    }

    async start(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Kickbase MCP Server running on stdio");
    }
}
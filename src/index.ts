import { KickbaseMcpServer } from './server/mcp-server.js';

async function main(): Promise<void> {
    const mcpServer = new KickbaseMcpServer();
    await mcpServer.start();
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
# Kickbase MCP Server

A Model Context Protocol (MCP) server that provides integration with the Kickbase fantasy football platform. This server enables Claude to interact with Kickbase through a set of tools for player information, market data, and offer management.

## Features

- 🔍 **Player Information**: Get detailed player stats, performance data, and market value trends
- 📈 **Market Monitoring**: List and track players currently available on the transfer market  
- 💰 **Offer Management**: Make transfer offers for players in your league

## Architecture

```
src/
├── index.ts                    # Application entry point
├── config/
│   └── constants.ts           # Configuration and environment variables
├── types/
│   └── kickbase.types.ts      # TypeScript interfaces and types
├── api/
│   └── kickbase-client.ts     # Kickbase API client
├── services/
│   └── kickbase.service.ts    # Business logic and data processing
├── tools/
│   ├── index.ts               # Contains tools that are exposed to LLMs
├── utils/
│   └── response-builder.ts    # Response formatting utilities
└── server/
    └── mcp-server.ts          # MCP server setup and configuration
```

## Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd kickbase-mcp-server
   ```

2. **Install dependencies**
   ```
   npm install
   ```
3. **Build the project**
   ```bash
   npm run build
   ```

4. **Set up the Claude MCP configuration and environment variables**
   - Get your kickbase session cookie, as described here: https://github.com/kevinskyba/kickbase-api-doc. Execute the Login request. 
     Copy the Set-Cookie header that is returned by the request, it should follow this format: "kkstrauth=eyXxX"
   - Create an MCP configuration for Claude, see https://modelcontextprotocol.io/docs/develop/connect-local-servers#installing-the-filesystem-server
   - Copy the following config in the 'claude_desktop_config.json' config file:
   ```
    {
    "mcpServers": {
        "seb-kickbase-mcp": {
            "command": "node",
            "args": ["<project-directory>/kickbase_mcp_server/build/index.js"],
            "env": {
                "KB_COOKIE": "kkstrauth=eyXxX"
            }
        }
    }
}
   ```


#### Example Conversations with Claude

- *"What players are currently listed on the Kickbase market ?"*
- *"Can you tell me more about player XZY"*
- *"Make an offer of 3.5 million for player XYZ"*
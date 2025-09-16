export class ToolResponseBuilder {
    static createTextResponse(text: string) {
        return {
            content: [{
                type: "text" as const,
                text
            }]
        };
    }
}
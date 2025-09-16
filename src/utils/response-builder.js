export class ToolResponseBuilder {
    static createTextResponse(text) {
        return {
            content: [{
                    type: "text",
                    text
                }]
        };
    }
}

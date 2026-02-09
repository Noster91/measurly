export interface MCPToolResult {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

export interface MCPToolInput {
  [key: string]: unknown
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required?: string[]
  }
  handler(input: MCPToolInput): Promise<MCPToolResult>
}

/**
 * Creates an MCP server with the provided tools.
 * This implements the MCP protocol for tool communication.
 */
export function createMCPServer(registeredTools: MCPTool[]) {
  const toolMap = new Map(registeredTools.map((t) => [t.name, t]))

  function listTools() {
    return registeredTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }))
  }

  async function callTool(name: string, input: MCPToolInput): Promise<MCPToolResult> {
    const tool = toolMap.get(name)
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true,
      }
    }

    try {
      return await tool.handler(input)
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      }
    }
  }

  return { listTools, callTool }
}

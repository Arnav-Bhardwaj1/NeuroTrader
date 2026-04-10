/**
 * NeuroLogic.ts
 * Core logic engine for the Visual Strategy Builder.
 * Defines node types and the evaluation engine.
 */

export type NodeType = 'MARKET_DATA' | 'INDICATOR' | 'CONDITION' | 'LOGIC_GATE' | 'SIGNAL';

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface VisualGraph {
  nodes: Node[];
  connections: Connection[];
}

export class NeuroLogicEngine {
  /**
   * Compiles the visual graph into a usable strategy function.
   * For the purpose of this simulation, we'll evaluate the graph step-by-step.
   */
  static evaluateGraph(graph: VisualGraph, candleData: any[], currentIndex: number): 'BUY' | 'SELL' | 'NONE' {
    const signalNodes = graph.nodes.filter(n => n.type === 'SIGNAL');
    if (signalNodes.length === 0) return 'NONE';

    // We start from signal nodes and work backwards (recursive evaluation)
    for (const signalNode of signalNodes) {
      const evaluation = this.evaluateNode(signalNode, graph, candleData, currentIndex);
      if (evaluation === 'BUY' || evaluation === 'SELL') {
        return evaluation;
      }
    }

    return 'NONE';
  }

  private static evaluateNode(node: Node, graph: VisualGraph, candleData: any[], currentIndex: number): any {
    const incomingConnections = graph.connections.filter(c => c.targetId === node.id);
    const sourceNodes = incomingConnections.map(c => graph.nodes.find(n => n.id === c.sourceId)).filter(Boolean) as Node[];

    switch (node.type) {
      case 'MARKET_DATA':
        const field = node.data.field || 'close';
        return candleData[currentIndex][field];

      case 'INDICATOR':
        // Simplified: return an indicator value like RSI or SMA
        // In a real app, this would use a TA-Lib implementation
        return this.mockCalculateIndicator(node.data.indicator, node.data.period, candleData, currentIndex);

      case 'CONDITION':
        const [val1, val2] = sourceNodes.map(n => this.evaluateNode(n, graph, candleData, currentIndex));
        const operator = node.data.operator;
        if (operator === '>') return val1 > val2;
        if (operator === '<') return val1 < val2;
        if (operator === 'CROSSES_ABOVE') {
          const prevVal1 = sourceNodes[0] ? this.evaluateNode(sourceNodes[0], graph, candleData, currentIndex - 1) : 0;
          const prevVal2 = sourceNodes[1] ? this.evaluateNode(sourceNodes[1], graph, candleData, currentIndex - 1) : 0;
          return prevVal1 <= prevVal2 && val1 > val2;
        }
        return false;

      case 'LOGIC_GATE':
        const inputs = sourceNodes.map(n => this.evaluateNode(n, graph, candleData, currentIndex));
        if (node.data.gate === 'AND') return inputs.every(Boolean);
        if (node.data.gate === 'OR') return inputs.some(Boolean);
        return false;

      case 'SIGNAL':
        const hasTrigger = this.evaluateNode(sourceNodes[0], graph, candleData, currentIndex);
        return hasTrigger ? node.data.action : 'NONE';

      default:
        return null;
    }
  }

  /**
   * Mock calculation for common indicators.
   */
  private static mockCalculateIndicator(name: string, period: number = 14, data: any[], index: number): number {
    if (index < period) return data[index].close;
    
    if (name === 'SMA') {
      let sum = 0;
      for (let i = 0; i < period; i++) {
        sum += data[index - i].close;
      }
      return sum / period;
    }

    if (name === 'RSI') {
      // Very simplified RSI mock for logic demonstration
      return 50 + (Math.random() * 20 - 10);
    }

    return data[index].close;
  }
}

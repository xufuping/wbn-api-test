import { Strategy } from './strategy'
import { random } from 'lodash'

export const BlindStrategy = {
  name: 'blind_strategy',
  select<SwapNode> (nodes: SwapNode[]): SwapNode { return nodes[random(0, nodes.length)] }
} as Strategy

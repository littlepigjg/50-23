import type { ProgramBlock } from '../../types';
import type { ExecutionContext } from '../types';
import type { InstructionHandler } from '../InstructionHandler';

export class LoopHandler implements InstructionHandler {
  canHandle(block: ProgramBlock): boolean {
    return block.type === 'loop';
  }

  handle(
    block: ProgramBlock,
    ctx: ExecutionContext,
    executeChildren: (
      children: ProgramBlock[],
      ctx: ExecutionContext,
      depth: number
    ) => boolean,
    depth: number
  ): boolean {
    const count = block.repeatCount || 2;
    for (let i = 0; i < count; i++) {
      if (block.children) {
        if (!executeChildren(block.children, ctx, depth + 1)) {
          return false;
        }
      }
    }
    return true;
  }
}

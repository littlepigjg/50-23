import type { ProgramBlock } from '../../types';
import type { ExecutionContext } from '../types';
import type { InstructionHandler } from '../InstructionHandler';

export class CallFunctionHandler implements InstructionHandler {
  canHandle(block: ProgramBlock): boolean {
    return block.type === 'callFunction';
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
    const funcBlocks = ctx.functions[block.functionId || 'func1'];
    if (funcBlocks) {
      return executeChildren(funcBlocks, ctx, depth + 1);
    }
    return true;
  }
}

import type { ProgramBlock } from '../types';
import type { ExecutionContext } from './types';

export interface InstructionHandler {
  canHandle(block: ProgramBlock): boolean;
  handle(
    block: ProgramBlock,
    ctx: ExecutionContext,
    executeChildren: (
      children: ProgramBlock[],
      ctx: ExecutionContext,
      depth: number
    ) => boolean,
    depth: number
  ): boolean;
}

export class InstructionDispatcher {
  private handlers: InstructionHandler[] = [];

  register(handler: InstructionHandler): void {
    this.handlers.push(handler);
  }

  dispatch(
    block: ProgramBlock,
    ctx: ExecutionContext,
    executeChildren: (
      children: ProgramBlock[],
      ctx: ExecutionContext,
      depth: number
    ) => boolean,
    depth: number
  ): boolean {
    const handler = this.handlers.find((h) => h.canHandle(block));
    if (!handler) {
      return true;
    }
    return handler.handle(block, ctx, executeChildren, depth);
  }
}

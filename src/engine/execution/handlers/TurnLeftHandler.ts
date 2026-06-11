import type { ProgramBlock } from '../../types';
import { turnLeft } from '../../GameEngine';
import type { ExecutionContext } from '../types';
import type { InstructionHandler } from '../InstructionHandler';

export class TurnLeftHandler implements InstructionHandler {
  canHandle(block: ProgramBlock): boolean {
    return block.type === 'turnLeft';
  }

  handle(
    _block: ProgramBlock,
    ctx: ExecutionContext,
    _executeChildren: (
      children: ProgramBlock[],
      ctx: ExecutionContext,
      depth: number
    ) => boolean,
    _depth: number
  ): boolean {
    ctx.state.robot.direction = turnLeft(ctx.state.robot.direction);
    ctx.state.currentStep++;
    return true;
  }
}

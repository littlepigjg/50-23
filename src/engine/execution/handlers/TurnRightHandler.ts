import type { ProgramBlock } from '../../types';
import { turnRight } from '../../GameEngine';
import type { ExecutionContext } from '../types';
import type { InstructionHandler } from '../InstructionHandler';

export class TurnRightHandler implements InstructionHandler {
  canHandle(block: ProgramBlock): boolean {
    return block.type === 'turnRight';
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
    ctx.state.robot.direction = turnRight(ctx.state.robot.direction);
    ctx.state.currentStep++;
    return true;
  }
}

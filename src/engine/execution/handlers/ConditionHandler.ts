import type { ProgramBlock, RobotState } from '../../types';
import { getForwardPosition, isWalkable, positionEquals } from '../../GameEngine';
import type { ExecutionContext } from '../types';
import type { InstructionHandler } from '../InstructionHandler';

export class ConditionHandler implements InstructionHandler {
  canHandle(block: ProgramBlock): boolean {
    return (
      block.type === 'ifWall' ||
      block.type === 'ifStar' ||
      block.type === 'ifEmpty'
    );
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
    if (this.evaluateCondition(block, ctx.state.robot, ctx)) {
      if (block.children) {
        return executeChildren(block.children, ctx, depth + 1);
      }
    }
    return true;
  }

  private evaluateCondition(
    block: ProgramBlock,
    robot: RobotState,
    ctx: ExecutionContext
  ): boolean {
    const forward = getForwardPosition(robot);
    switch (block.type) {
      case 'ifWall':
        return !isWalkable(ctx.level, forward);
      case 'ifStar': {
        const hasUncollected = ctx.state.robot.stars.some((s) =>
          positionEquals(s, forward)
        );
        return hasUncollected;
      }
      case 'ifEmpty':
        return isWalkable(ctx.level, forward);
      default:
        return false;
    }
  }
}

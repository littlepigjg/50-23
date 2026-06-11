import type { ProgramBlock } from '../../types';
import { getCellAt, getForwardPosition, isWalkable, positionEquals } from '../../GameEngine';
import type { ExecutionContext } from '../types';
import { isFailed, setFailed, snapshotState } from '../types';
import type { InstructionHandler } from '../InstructionHandler';

export class MoveHandler implements InstructionHandler {
  canHandle(block: ProgramBlock): boolean {
    return block.type === 'move';
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
    const nextPos = getForwardPosition(ctx.state.robot);
    if (!isWalkable(ctx.level, nextPos)) {
      setFailed(ctx, '机器人撞到了障碍物！');
      return false;
    }
    ctx.state.robot.position = nextPos;
    ctx.state.currentStep++;

    const starIndex = ctx.state.robot.stars.findIndex((s) =>
      positionEquals(s, nextPos)
    );
    if (starIndex !== -1) {
      const [collected] = ctx.state.robot.stars.splice(starIndex, 1);
      ctx.state.collectedStars.push(collected);
    }

    const cell = getCellAt(ctx.level, nextPos);
    if (cell === 'pit') {
      setFailed(ctx, '机器人掉进了陷阱！');
      snapshotState(ctx);
      return false;
    }
    return !isFailed(ctx);
  }
}

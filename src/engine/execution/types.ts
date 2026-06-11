import type {
  ExecutionState,
  Level,
  ProgramBlock,
} from '../types';
import { cloneRobotState } from '../GameEngine';

export interface ExecutionContext {
  level: Level;
  state: ExecutionState;
  steps: { state: ExecutionState; blockId?: string }[];
  functions: Record<string, ProgramBlock[]>;
}

export function snapshotState(ctx: ExecutionContext, blockId?: string): void {
  ctx.steps.push({
    state: {
      ...ctx.state,
      robot: cloneRobotState(ctx.state.robot),
    },
    blockId,
  });
}

export function setFailed(ctx: ExecutionContext, error: string): void {
  ctx.state.status = 'failed';
  ctx.state.error = error;
}

export function isFailed(ctx: ExecutionContext): boolean {
  return ctx.state.status === 'failed';
}

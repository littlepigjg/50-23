import type {
  Level,
  Program,
  ProgramBlock,
} from '../types';
import type { ExecutionStep } from '../GameEngine';
import {
  cloneRobotState,
  createInitialExecutionState,
  estimateTotalSteps,
  positionEquals,
} from '../GameEngine';
import { InstructionDispatcher } from './InstructionHandler';
import {
  CallFunctionHandler,
  ConditionHandler,
  LoopHandler,
  MoveHandler,
  TurnLeftHandler,
  TurnRightHandler,
} from './handlers';
import type { ExecutionContext } from './types';
import { isFailed, setFailed, snapshotState } from './types';

const MAX_DEPTH = 100;

export class ProgramExecutor {
  private dispatcher: InstructionDispatcher;

  constructor() {
    this.dispatcher = new InstructionDispatcher();
    this.dispatcher.register(new MoveHandler());
    this.dispatcher.register(new TurnLeftHandler());
    this.dispatcher.register(new TurnRightHandler());
    this.dispatcher.register(new LoopHandler());
    this.dispatcher.register(new ConditionHandler());
    this.dispatcher.register(new CallFunctionHandler());
  }

  execute(level: Level, program: Program): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const state = createInitialExecutionState(level);
    state.totalSteps = estimateTotalSteps(program);

    const functions = this.extractFunctions(program);

    const ctx: ExecutionContext = {
      level,
      state,
      steps,
      functions,
    };

    snapshotState(ctx);

    const mainBlocks = program.main.filter((b) => b.type !== 'function');

    for (const block of mainBlocks) {
      if (!this.executeBlock(block, ctx, 0)) break;
    }

    this.finalize(ctx);

    return steps;
  }

  private extractFunctions(
    program: Program
  ): Record<string, ProgramBlock[]> {
    const functions: Record<string, ProgramBlock[]> = {};
    for (const block of program.main) {
      if (block.type === 'function') {
        functions[block.functionId || 'func1'] = block.children || [];
      }
    }
    return functions;
  }

  private executeBlock(
    block: ProgramBlock,
    ctx: ExecutionContext,
    depth: number
  ): boolean {
    if (depth > MAX_DEPTH) {
      setFailed(ctx, '嵌套层数过深，可能存在无限循环');
      return false;
    }

    ctx.state.highlightedBlockId = block.id;
    snapshotState(ctx, block.id);

    const success = this.dispatcher.dispatch(
      block,
      ctx,
      this.executeChildren.bind(this),
      depth
    );

    if (!isFailed(ctx)) {
      snapshotState(ctx);
    }

    return success;
  }

  private executeChildren(
    children: ProgramBlock[],
    ctx: ExecutionContext,
    depth: number
  ): boolean {
    for (const child of children) {
      if (!this.executeBlock(child, ctx, depth)) {
        return false;
      }
    }
    return true;
  }

  private finalize(ctx: ExecutionContext): void {
    if (ctx.state.status !== 'failed') {
      if (positionEquals(ctx.state.robot.position, ctx.level.goal)) {
        if (ctx.state.robot.stars.length === 0) {
          ctx.state.status = 'success';
        } else {
          ctx.state.status = 'failed';
          ctx.state.error = `还有 ${ctx.state.robot.stars.length} 颗星星没有收集！`;
        }
      } else {
        ctx.state.status = 'failed';
        ctx.state.error = '机器人没有到达终点！';
      }
    }

    ctx.steps.push({
      state: {
        ...ctx.state,
        robot: cloneRobotState(ctx.state.robot),
        highlightedBlockId: undefined,
      },
    });
  }
}

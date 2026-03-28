import { exerciseLibrary, inferExpressBucket } from './exercise-library';
import type { Drill, WarmupBlock, WarmupInput, WarmupPlan } from './types';

function copyDrills(drills: Drill[]): Drill[] {
  return drills.map((drill) => ({ ...drill }));
}

function pickAccessDrills(input: WarmupInput): Drill[] {
  const picks: Drill[] = [];
  const c = input.constraints ?? {};

  if (input.sessionFocus === 'squat' || input.sessionFocus === 'squat_bench' || c.ankleRestriction) {
    picks.push(...copyDrills(exerciseLibrary.access.ankle.slice(0, 1)));
  }

  if (
    input.sessionFocus === 'squat' ||
    input.sessionFocus === 'hinge' ||
    input.sessionFocus === 'lunge' ||
    input.sessionFocus === 'squat_bench' ||
    c.hipRestriction
  ) {
    picks.push(...copyDrills(exerciseLibrary.access.hip.slice(0, 1)));
  }

  if (
    input.sessionFocus === 'bench' ||
    input.sessionFocus === 'push' ||
    input.sessionFocus === 'pull' ||
    input.sessionFocus === 'squat_bench' ||
    c.tSpineRestriction
  ) {
    picks.push(...copyDrills(exerciseLibrary.access.tSpine.slice(0, 1)));
  }

  if (
    input.sessionFocus === 'bench' ||
    input.sessionFocus === 'push' ||
    input.sessionFocus === 'squat_bench' ||
    c.shoulderRestriction
  ) {
    picks.push(...copyDrills(exerciseLibrary.access.shoulder.slice(0, 1)));
  }

  if (picks.length === 0) {
    picks.push(...copyDrills([exerciseLibrary.access.hip[1], exerciseLibrary.access.tSpine[0]]));
  }

  return picks.slice(0, input.timeAvailable <= 10 ? 2 : 3);
}

function pickIntegrateDrills(input: WarmupInput): Drill[] {
  const drills: Drill[] = [];

  switch (input.sessionFocus) {
    case 'squat':
      drills.push(...copyDrills(exerciseLibrary.integrate.squat.slice(0, 2)));
      break;
    case 'bench':
      drills.push(...copyDrills(exerciseLibrary.integrate.bench.slice(0, 3)));
      break;
    case 'squat_bench':
      drills.push(
        ...copyDrills([
          exerciseLibrary.integrate.squat[1],
          exerciseLibrary.integrate.bench[0],
          exerciseLibrary.integrate.bench[2]
        ])
      );
      break;
    case 'hinge':
      drills.push(...copyDrills(exerciseLibrary.integrate.hinge));
      break;
    case 'push':
      drills.push(...copyDrills(exerciseLibrary.integrate.push));
      break;
    case 'pull':
      drills.push(...copyDrills(exerciseLibrary.integrate.pull));
      break;
    case 'lunge':
      drills.push(...copyDrills(exerciseLibrary.integrate.lunge));
      break;
    default:
      drills.push(...copyDrills(exerciseLibrary.integrate.full_body));
      break;
  }

  if (input.constraints?.trunkStabilityNeeds) {
    drills.unshift(...copyDrills(exerciseLibrary.position.general.slice(1, 2)));
  }

  return drills.slice(0, input.timeAvailable <= 10 ? 3 : 4);
}

function createBlock(layer: WarmupBlock['layer'], goal: string, why: string, drills: Drill[]): WarmupBlock {
  return {
    layer,
    goal,
    why,
    drills: copyDrills(drills)
  };
}

export function generateWarmupPlan(input: WarmupInput): WarmupPlan {
  const blocks: WarmupBlock[] = [];
  const decisionLog: string[] = [];

  const prepareDrills =
    input.timeAvailable <= 5
      ? copyDrills(exerciseLibrary.prepare.general.slice(0, 1))
      : copyDrills([exerciseLibrary.prepare.general[0], exerciseLibrary.prepare.general[2]]);

  blocks.push(
    createBlock(
      'Prepare',
      'Move from passive to training-ready with minimal fatigue.',
      'This layer raises temperature and basic arousal so later mobility, positioning, and pattern work land better.',
      prepareDrills
    )
  );

  decisionLog.push(`Time available (${input.timeAvailable} min) set the overall complexity and drill count.`);

  const positionDrills =
    input.timeAvailable <= 5
      ? copyDrills(exerciseLibrary.position.general.slice(1, 2))
      : copyDrills(exerciseLibrary.position.general);

  blocks.push(
    createBlock(
      'Position',
      'Organise ribcage, pelvis, and trunk before you ask for more range or force.',
      'Position gives the body a reference point. Warm tissue without orientation can still leak force or borrow motion from the wrong place.',
      positionDrills
    )
  );

  blocks.push(
    createBlock(
      'Access',
      'Open the minimum range needed for today’s session.',
      'Access is not about chasing flexibility. It creates usable space for the task so you do not compensate later under load.',
      pickAccessDrills(input)
    )
  );

  blocks.push(
    createBlock(
      'Integrate',
      'Own the available range in a movement pattern that looks like the session.',
      'This is the bridge from isolated prep to coordinated function. It links mobility and stability to the actual lifting pattern.',
      pickIntegrateDrills(input)
    )
  );

  const includeExpress = input.timeAvailable >= 10 && input.pain !== 'moderate';

  if (includeExpress) {
    const expressKey = inferExpressBucket(input.goal, input.sessionFocus);

    blocks.push(
      createBlock(
        'Express',
        'Prime high-quality output without creating fatigue.',
        'This layer prepares the nervous system for intent, speed, and crisp execution so early work sets do not feel like the real warm-up.',
        copyDrills(exerciseLibrary.express[expressKey])
      )
    );
  } else {
    decisionLog.push(
      'Express was reduced or removed because either time was very short or pain level called for a lower-threat entry into the session.'
    );
  }

  if (input.pain !== 'none') {
    decisionLog.push(
      `Pain level was set to ${input.pain}, so the plan biases cleaner movement and lower-impact choices over aggressive potentiation.`
    );
  }

  if (input.readiness === 'low') {
    decisionLog.push('Readiness was low, so the plan leans on simple drills and avoids unnecessary complexity.');
  }

  if (input.goal === 'powerlifting') {
    decisionLog.push('Powerlifting selected: pattern rehearsal and bar-specific intent matter more than large mobility circuits.');
  }

  return {
    title: `${input.trainingType} warm-up (${input.timeAvailable} min)`,
    summary:
      'This warm-up follows the Coach-X layered model: Prepare → Position → Access → Integrate → Express. The app explains not just what to do, but why each layer exists and how it connects to the next.',
    decisionLog,
    blocks,
    notes: [
      'Use the first loaded set as a live audit. If first-rep quality is poor, regress, reduce range, or repeat the integration block.',
      'For advanced lifters with no pain and good balance, the app should trend toward specificity and minimalism rather than corrective overload.',
      'When time is short, never sacrifice Position and Integrate just to squeeze in extra drills.'
    ]
  };
}

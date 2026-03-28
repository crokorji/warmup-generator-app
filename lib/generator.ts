import { exerciseLibrary, inferExpressBucket } from './exercise-library';
import { WarmupBlock, WarmupInput, WarmupPlan } from './types';

function pickAccessDrills(input: WarmupInput) {
  const picks = [] as WarmupBlock['drills'];
  const c = input.constraints || {};

  if (input.sessionFocus === 'squat' || input.sessionFocus === 'squat_bench' || c.ankleRestriction) {
    picks.push(exerciseLibrary.access.ankle[0]);
  }
  if (input.sessionFocus === 'squat' || input.sessionFocus === 'hinge' || input.sessionFocus === 'lunge' || input.sessionFocus === 'squat_bench' || c.hipRestriction) {
    picks.push(exerciseLibrary.access.hip[0]);
  }
  if (input.sessionFocus === 'bench' || input.sessionFocus === 'push' || input.sessionFocus === 'pull' || input.sessionFocus === 'squat_bench' || c.tSpineRestriction) {
    picks.push(exerciseLibrary.access.tSpine[0]);
  }
  if (input.sessionFocus === 'bench' || input.sessionFocus === 'push' || input.sessionFocus === 'squat_bench' || c.shoulderRestriction) {
    picks.push(exerciseLibrary.access.shoulder[0]);
  }

  if (picks.length === 0) {
    picks.push(exerciseLibrary.access.hip[1], exerciseLibrary.access.tSpine[0]);
  }

  return picks.slice(0, input.timeAvailable <= 10 ? 2 : 3);
}

function pickIntegrateDrills(input: WarmupInput) {
  const drills = [] as WarmupBlock['drills'];
  switch (input.sessionFocus) {
    case 'squat':
      drills.push(...exerciseLibrary.integrate.squat.slice(0, 2));
      break;
    case 'bench':
      drills.push(...exerciseLibrary.integrate.bench.slice(0, 3));
      break;
    case 'squat_bench':
      drills.push(exerciseLibrary.integrate.squat[1], exerciseLibrary.integrate.bench[0], exerciseLibrary.integrate.bench[2]);
      break;
    case 'hinge':
      drills.push(...exerciseLibrary.integrate.hinge);
      break;
    case 'push':
      drills.push(...exerciseLibrary.integrate.push);
      break;
    case 'pull':
      drills.push(...exerciseLibrary.integrate.pull);
      break;
    case 'lunge':
      drills.push(...exerciseLibrary.integrate.lunge);
      break;
    default:
      drills.push(...exerciseLibrary.integrate.full_body);
      break;
  }

  if (input.constraints?.trunkStabilityNeeds) {
    drills.unshift(exerciseLibrary.position.general[1]);
  }

  return drills.slice(0, input.timeAvailable <= 10 ? 3 : 4);
}

export function generateWarmupPlan(input: WarmupInput): WarmupPlan {
  const blocks: WarmupBlock[] = [];
  const decisionLog: string[] = [];

  blocks.push({
    layer: 'Prepare',
    goal: 'Move from passive to training-ready with minimal fatigue.',
    why: 'This layer raises temperature and basic arousal so later mobility, positioning, and pattern work land better.',
    drills: input.timeAvailable <= 5 ? [exerciseLibrary.prepare.general[0]] : [exerciseLibrary.prepare.general[0], exerciseLibrary.prepare.general[2]]
  });
  decisionLog.push(`Time available (${input.timeAvailable} min) set the overall complexity and drill count.`);

  blocks.push({
    layer: 'Position',
    goal: 'Organise ribcage, pelvis, and trunk before you ask for more range or force.',
    why: 'Position gives the body a reference point. Warm tissue without orientation can still leak force or borrow motion from the wrong place.',
    drills: input.timeAvailable <= 5 ? [exerciseLibrary.position.general[1]] : exerciseLibrary.position.general
  });

  blocks.push({
    layer: 'Access',
    goal: 'Open the minimum range needed for today’s session.',
    why: 'Access is not about chasing flexibility. It creates usable space for the task so you do not compensate later under load.',
    drills: pickAccessDrills(input)
  });

  blocks.push({
    layer: 'Integrate',
    goal: 'Own the available range in a movement pattern that looks like the session.',
    why: 'This is the bridge from isolated prep to coordinated function. It links mobility and stability to the actual lifting pattern.',
    drills: pickIntegrateDrills(input)
  });

  const includeExpress = input.timeAvailable >= 10 && input.pain !== 'moderate';
  if (includeExpress) {
    const expressKey = inferExpressBucket(input.goal, input.sessionFocus);
    blocks.push({
      layer: 'Express',
      goal: 'Prime high-quality output without creating fatigue.',
      why: 'This layer prepares the nervous system for intent, speed, and crisp execution so early work sets do not feel like the real warm-up.',
      drills: exerciseLibrary.express[expressKey]
    });
  } else {
    decisionLog.push('Express was reduced or removed because either time was very short or pain level called for a lower-threat entry into the session.');
  }

  if (input.pain !== 'none') {
    decisionLog.push(`Pain level was set to ${input.pain}, so the plan biases cleaner movement and lower-impact choices over aggressive potentiation.`);
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
      'Use the first loaded set as a live audit. If the first rep quality is poor, regress, reduce range, or repeat the integration block.',
      'For advanced lifters with no pain and good balance, the app should trend toward specificity and minimalism rather than corrective overload.',
      'When time is short, never sacrifice Position and Integrate just to squeeze in extra drills.'
    ]
  };
}

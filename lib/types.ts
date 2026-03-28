export type Goal =
  | 'strength'
  | 'powerlifting'
  | 'hypertrophy'
  | 'fat_loss'
  | 'power'
  | 'endurance'
  | 'sport_specific';

export type SessionFocus =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'push'
  | 'pull'
  | 'bench'
  | 'squat_bench'
  | 'full_body';

export type Readiness = 'low' | 'moderate' | 'high';
export type Pain = 'none' | 'mild' | 'moderate';
export type Experience = 'beginner' | 'intermediate' | 'advanced';

export interface WarmupInput {
  timeAvailable: 5 | 10 | 15 | 20;
  goal: Goal;
  sessionFocus: SessionFocus;
  trainingType: string;
  readiness: Readiness;
  pain: Pain;
  experience: Experience;
  notes?: string;
  constraints?: {
    ankleRestriction?: boolean;
    hipRestriction?: boolean;
    tSpineRestriction?: boolean;
    trunkStabilityNeeds?: boolean;
    shoulderRestriction?: boolean;
  };
}

export interface WarmupBlock {
  layer: 'Prepare' | 'Position' | 'Access' | 'Integrate' | 'Express';
  goal: string;
  why: string;
  drills: Array<{
    name: string;
    dosage: string;
    coachingCue?: string;
  }>;
}

export interface WarmupPlan {
  title: string;
  summary: string;
  decisionLog: string[];
  blocks: WarmupBlock[];
  notes: string[];
}

import { SessionFocus, Goal } from './types';

export const exerciseLibrary = {
  prepare: {
    general: [
      { name: 'Bike or rower', dosage: '60-90 sec', coachingCue: 'Build temperature, not fatigue.' },
      { name: 'Brisk treadmill walk', dosage: '60-90 sec', coachingCue: 'Smooth rhythm, nasal breathing if comfortable.' },
      { name: 'Light sled march or drag', dosage: '2 x 15-20 m', coachingCue: 'Tall posture, crisp steps.' }
    ]
  },
  position: {
    general: [
      { name: '90/90 breathing', dosage: '3-5 breaths', coachingCue: 'Exhale fully and feel ribs come down.' },
      { name: 'Dead bug', dosage: '4-6 reps/side', coachingCue: 'Keep trunk quiet while limbs move.' }
    ]
  },
  access: {
    ankle: [
      { name: 'Ankle dorsiflexion rocks', dosage: '6-10 reps/side', coachingCue: 'Drive knee over toes without heel lifting.' }
    ],
    hip: [
      { name: 'Adductor rockback', dosage: '6-8 reps/side', coachingCue: 'Keep spine long, move from the hip.' },
      { name: '90/90 hip transitions', dosage: '4-6 reps/side', coachingCue: 'Own the turn, do not rush.' }
    ],
    tSpine: [
      { name: 'Quadruped T-spine rotation', dosage: '5-6 reps/side', coachingCue: 'Rotate through upper back, not low back.' }
    ],
    shoulder: [
      { name: 'Dynamic pec stretch', dosage: '6-8 reps/side', coachingCue: 'Smooth range, no yanking.' },
      { name: 'Lat prayer stretch rocks', dosage: '6-8 reps', coachingCue: 'Keep ribs stacked as you reach.' }
    ]
  },
  integrate: {
    squat: [
      { name: 'Glute bridge', dosage: '8-10 reps', coachingCue: 'Finish with glutes, not low back.' },
      { name: 'Bodyweight squat with pause', dosage: '5-6 reps', coachingCue: 'Own the bottom position and pressure through whole foot.' },
      { name: 'Goblet squat', dosage: '3-5 reps', coachingCue: 'Brace first, descend under control.' }
    ],
    bench: [
      { name: 'Band pull-apart', dosage: '10-15 reps', coachingCue: 'Move from shoulder blades, not lower back.' },
      { name: 'Scap push-up', dosage: '8-10 reps', coachingCue: 'Protract and retract smoothly.' },
      { name: 'Empty bar bench setup drill', dosage: '2 x 5 reps', coachingCue: 'Set upper back, feet, and bar path before pressing.' }
    ],
    hinge: [
      { name: 'Bodyweight RDL', dosage: '8 reps', coachingCue: 'Reach hips back and keep ribs stacked.' },
      { name: 'KB RDL', dosage: '5 reps', coachingCue: 'Feel hamstrings load without losing brace.' }
    ],
    push: [
      { name: 'Incline push-up', dosage: '5-8 reps', coachingCue: 'Move as one piece.' }
    ],
    pull: [
      { name: 'Suspension row', dosage: '5-8 reps', coachingCue: 'Own the top position.' }
    ],
    lunge: [
      { name: 'Reverse lunge with reach', dosage: '4-6 reps/side', coachingCue: 'Stay balanced and control pelvis.' }
    ],
    full_body: [
      { name: 'Bear crawl', dosage: '2 x 10 m', coachingCue: 'Quiet trunk, opposite hand and foot.' },
      { name: 'Farmer carry', dosage: '2 x 15-20 m', coachingCue: 'Tall posture, steady ribcage.' }
    ]
  },
  express: {
    power: [
      { name: 'Vertical jump', dosage: '2-3 reps', coachingCue: 'High intent, full reset between reps.' },
      { name: 'Medicine ball chest throw', dosage: '2-3 reps', coachingCue: 'Fast and crisp, stop well before fatigue.' }
    ],
    strength: [
      { name: 'Fast empty-bar squat', dosage: '1 x 5 reps', coachingCue: 'Controlled down, violent but clean up.' },
      { name: 'Fast empty-bar bench press', dosage: '1 x 5 reps', coachingCue: 'Press with speed while holding position.' }
    ],
    fatigueFriendly: [
      { name: 'Low-amplitude pogo or quick feet', dosage: '10-15 sec', coachingCue: 'Stay springy, not sloppy.' }
    ]
  }
} as const;

export function inferExpressBucket(goal: Goal, focus: SessionFocus) {
  if (goal === 'power' || goal === 'sport_specific') return 'power';
  if (goal === 'strength' || goal === 'powerlifting' || focus === 'bench' || focus === 'squat_bench' || focus === 'squat') return 'strength';
  return 'fatigueFriendly';
}

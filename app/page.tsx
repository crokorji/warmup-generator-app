'use client';

import { useState } from 'react';
import { Flowchart } from './components/Flowchart';
import type { WarmupInput, WarmupPlan } from '@/lib/types';

const defaultPayload: WarmupInput = {
  timeAvailable: 10,
  goal: 'powerlifting',
  sessionFocus: 'squat_bench',
  trainingType: 'Powerlifting session',
  readiness: 'moderate',
  pain: 'none',
  experience: 'advanced',
  notes: 'Advanced powerlifter, squat and bench day, no pain, fairly balanced.',
  constraints: {
    ankleRestriction: false,
    hipRestriction: false,
    tSpineRestriction: false,
    trunkStabilityNeeds: false,
    shoulderRestriction: false
  }
};

export default function HomePage() {
  const [payload, setPayload] = useState<WarmupInput>(defaultPayload);
  const [result, setResult] = useState<WarmupPlan | null>(null);
  const [aiNarrative, setAiNarrative] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Generation failed');
      }

      const data = await res.json();
      setResult(data.plan);
      setAiNarrative(data.aiNarrative || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function toggleConstraint(key: keyof NonNullable<WarmupInput['constraints']>) {
    setPayload((current) => ({
      ...current,
      constraints: {
        ...current.constraints,
        [key]: !current.constraints?.[key]
      }
    }));
  }

  return (
    <main className="page">
      <section className="hero">
        <span className="badge">Coach-X Warm-Up Generator</span>
        <h1>Build context-driven warm-ups and show the logic behind every choice.</h1>
        <p className="lead">
          This app combines the layered model discussed in this chat—Prepare, Position, Access, Integrate, Express—with a coach-facing decision tree. Users choose time, training type, focus, readiness, and constraints; the server then returns a structured warm-up plus an AI explanation of why the routine was built that way.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="row-2">
              <div className="field">
                <label htmlFor="timeAvailable">Warm-up time</label>
                <select id="timeAvailable" value={payload.timeAvailable} onChange={(e) => setPayload({ ...payload, timeAvailable: Number(e.target.value) as WarmupInput['timeAvailable'] })}>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="goal">Goal</label>
                <select id="goal" value={payload.goal} onChange={(e) => setPayload({ ...payload, goal: e.target.value as WarmupInput['goal'] })}>
                  <option value="strength">Strength</option>
                  <option value="powerlifting">Powerlifting</option>
                  <option value="hypertrophy">Hypertrophy</option>
                  <option value="fat_loss">Fat loss</option>
                  <option value="power">Power</option>
                  <option value="endurance">Endurance</option>
                  <option value="sport_specific">Sport specific</option>
                </select>
              </div>
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="sessionFocus">Session focus</label>
                <select id="sessionFocus" value={payload.sessionFocus} onChange={(e) => setPayload({ ...payload, sessionFocus: e.target.value as WarmupInput['sessionFocus'] })}>
                  <option value="squat">Squat</option>
                  <option value="bench">Bench</option>
                  <option value="squat_bench">Squat + Bench</option>
                  <option value="hinge">Hinge</option>
                  <option value="lunge">Lunge</option>
                  <option value="push">Push</option>
                  <option value="pull">Pull</option>
                  <option value="full_body">Full body</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="trainingType">Training type</label>
                <input id="trainingType" value={payload.trainingType} onChange={(e) => setPayload({ ...payload, trainingType: e.target.value })} />
              </div>
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="readiness">Readiness</label>
                <select id="readiness" value={payload.readiness} onChange={(e) => setPayload({ ...payload, readiness: e.target.value as WarmupInput['readiness'] })}>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="pain">Pain / threat</label>
                <select id="pain" value={payload.pain} onChange={(e) => setPayload({ ...payload, pain: e.target.value as WarmupInput['pain'] })}>
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="experience">Training experience</label>
              <select id="experience" value={payload.experience} onChange={(e) => setPayload({ ...payload, experience: e.target.value as WarmupInput['experience'] })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="field">
              <label>Constraints</label>
              <div className="checkbox-grid">
                {[
                  ['ankleRestriction', 'Ankle restriction'],
                  ['hipRestriction', 'Hip restriction'],
                  ['tSpineRestriction', 'T-spine restriction'],
                  ['shoulderRestriction', 'Shoulder restriction'],
                  ['trunkStabilityNeeds', 'Trunk stability needs']
                ].map(([key, label]) => (
                  <label key={key} className="checkbox">
                    <input type="checkbox" checked={Boolean(payload.constraints?.[key as keyof NonNullable<WarmupInput['constraints']>])} onChange={() => toggleConstraint(key as keyof NonNullable<WarmupInput['constraints']>)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="notes">Context notes</label>
              <textarea id="notes" value={payload.notes || ''} onChange={(e) => setPayload({ ...payload, notes: e.target.value })} />
            </div>

            <button type="submit" disabled={loading}>{loading ? 'Generating…' : 'Generate warm-up'}</button>
            {error ? <p className="muted">{error}</p> : null}
          </form>
        </div>

        <div className="result-shell">
          <div className="card">
            <h2>Coach decision tree</h2>
            <p className="muted">The app follows this sequence before choosing drills. The output is a warm-up plus the reasoning trail that led there.</p>
            <Flowchart />
          </div>

          <div className="card">
            <h2>Generated warm-up</h2>
            {!result ? (
              <p className="muted">Use the form to generate a plan.</p>
            ) : (
              <>
                <h3>{result.title}</h3>
                <p className="muted">{result.summary}</p>
                <div className="pill-list">
                  {result.decisionLog.map((item) => (
                    <span key={item} className="pill">{item}</span>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                  {result.blocks.map((block) => (
                    <article className="layer-card" key={block.layer}>
                      <div className="layer-meta">{block.layer}</div>
                      <h3>{block.goal}</h3>
                      <p className="muted">{block.why}</p>
                      <ul>
                        {block.drills.map((drill) => (
                          <li key={`${block.layer}-${drill.name}`}>
                            <strong>{drill.name}</strong> — {drill.dosage}
                            {drill.coachingCue ? <><br /><span className="muted">Cue: {drill.coachingCue}</span></> : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>

                <div className="layer-card" style={{ marginTop: 16 }}>
                  <div className="layer-meta">AI rationale</div>
                  <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{aiNarrative || 'No API key set: the app used local logic only.'}</p>
                </div>
              </>
            )}
          </div>

          <div className="card">
            <h2>How the app thinks</h2>
            <p className="muted">This JSON is the shape being sent to the API route.</p>
            <div className="codebox">
              <pre>{JSON.stringify(payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

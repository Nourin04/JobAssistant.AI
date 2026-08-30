import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Upload, FileText, Target, Send, CheckCircle2,
  Loader2, Download, Copy, RefreshCcw, Briefcase,
  Award, ChevronRight, AlertCircle, X, Check, Sparkles,
  Zap, FileCheck, Info
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Job' },
  { id: 3, label: 'Match' },
  { id: 4, label: 'Letter' },
];

// Session-based rate limit: 4 AI requests per browser session
const SESSION_LIMIT = 4;
const SESSION_KEY = 'ja_api_calls';

function getSessionCalls() {
  return parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
}

function incrementSessionCalls() {
  const next = getSessionCalls() + 1;
  sessionStorage.setItem(SESSION_KEY, String(next));
  return next;
}

function getRemainingCalls() {
  return Math.max(0, SESSION_LIMIT - getSessionCalls());
}

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [remainingCalls, setRemainingCalls] = useState(getRemainingCalls);
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connecting' | 'ready' | 'slow'

  // Ping /health on load to wake the backend (handles Render free-tier cold start)
  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setBackendStatus('slow'), 8000);

    axios.get(`${API_BASE}/health`, { signal: controller.signal, timeout: 90000 })
      .then(() => {
        clearTimeout(slowTimer);
        setBackendStatus('ready');
      })
      .catch(() => {
        clearTimeout(slowTimer);
        setBackendStatus('slow');
      });

    return () => {
      controller.abort();
      clearTimeout(slowTimer);
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (getRemainingCalls() <= 0) {
      setError('Session limit reached (4 AI calls). Refresh the page to start a new session.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setLoadingLabel('Analyzing your resume...');
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/analyze`, formData);
      incrementSessionCalls();
      setRemainingCalls(getRemainingCalls());
      setResumeData(resp.data);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed. Ensure the backend is running and the PDF is valid.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.');
      return;
    }
    if (getRemainingCalls() <= 0) {
      setError('Session limit reached (4 AI calls). Refresh the page to start a new session.');
      return;
    }
    setLoading(true);
    setLoadingLabel('Evaluating job compatibility...');
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/match`, {
        resume: resumeData,
        job_description: jobDescription,
      });
      incrementSessionCalls();
      setRemainingCalls(getRemainingCalls());
      setMatchResult(resp.data.result);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Job matching failed. Check your connection.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (getRemainingCalls() <= 0) {
      setError('Session limit reached (4 AI calls). Refresh the page to start a new session.');
      return;
    }
    setLoading(true);
    setLoadingLabel('Crafting your cover letter...');
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/cover-letter`, {
        resume: resumeData,
        job_description: jobDescription,
      });
      incrementSessionCalls();
      setRemainingCalls(getRemainingCalls());
      setCoverLetter(resp.data.cover_letter);
      setStep(4);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Cover letter generation failed.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const el = document.createElement('a');
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    el.href = URL.createObjectURL(blob);
    el.download = `${resumeData?.name?.replace(/\s+/g, '_') || 'Candidate'}_Cover_Letter.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {STEPS.map((s, i) => {
        const isDone = step > s.id;
        const isActive = step === s.id;
        return (
          <div key={s.id} className="step-item">
            <div className="step-node">
              <div className={`step-circle ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                {isDone ? <Check size={14} /> : s.id}
              </div>
              <span className={`step-label ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${isDone ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner-lg" />
          <span className="loading-label">{loadingLabel}</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="toast-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <X size={16} style={{ cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }} onClick={() => setError(null)} />
        </div>
      )}

      {/* Copy Toast */}
      {copySuccess && (
        <div className="copy-toast">
          <Check size={15} />
          <span>Copied to clipboard!</span>
        </div>
      )}

      {/* Backend Wake-up Banner */}
      {backendStatus !== 'ready' && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1rem',
            padding: '0.55rem 1.25rem',
            borderRadius: '0.75rem',
            border: `1px solid ${backendStatus === 'slow' ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.06)'}`,
            background: backendStatus === 'slow' ? 'rgba(234,179,8,0.04)' : 'rgba(255,255,255,0.02)',
            fontSize: '0.8rem',
            color: backendStatus === 'slow' ? '#fde68a' : 'var(--text-dim)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: backendStatus === 'slow' ? '#f59e0b' : 'var(--text-dim)',
            animation: 'pulse-glow 1.5s ease-in-out infinite',
            flexShrink: 0,
          }} />
          {backendStatus === 'slow'
            ? 'AI engine is waking up — this may take up to 60 seconds on the first visit.'
            : 'Connecting to AI engine...'}
        </div>
      )}

      {/* Rate Limit Banner */}
      {remainingCalls <= SESSION_LIMIT && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '0.75rem',
            border: `1px solid ${remainingCalls === 0 ? 'rgba(239,68,68,0.3)' : remainingCalls === 1 ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.07)'}`,
            background: remainingCalls === 0 ? 'rgba(239,68,68,0.06)' : remainingCalls === 1 ? 'rgba(234,179,8,0.05)' : 'rgba(255,255,255,0.02)',
            fontSize: '0.82rem',
            color: remainingCalls === 0 ? '#fca5a5' : remainingCalls === 1 ? '#fde68a' : 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {remainingCalls === 0
            ? 'Session limit reached. Refresh the page to start a new session.'
            : `${remainingCalls} AI ${remainingCalls === 1 ? 'request' : 'requests'} remaining this session.`}
        </div>
      )}

      {/* Header */}
      <header className="header-container animate-slide-up">
        <div className="badge-tag">
          <span className="badge-dot" />
          AI-Powered Career Suite
        </div>
        <h1 className="title-gradient main-title">
          JobAssistant<span className="title-ai">.ai</span>
        </h1>
        <p className="header-subtitle">
          Resume analysis, job compatibility scoring, and tailored cover letters — all in one pipeline.
        </p>
      </header>

      {renderStepIndicator()}

      <main>
        {/* ── Step 1: Upload ────────────────────────────────── */}
        {step === 1 && (
          <div className="premium-card upload-card animate-slide-up">
            <div className="upload-zone" onClick={() => document.getElementById('file-input').click()}>
              <div className="upload-icon-wrapper">
                <Upload size={30} color="var(--primary)" />
              </div>
              <h2 className="upload-title">Drop your resume here</h2>
              <p className="upload-subtitle">Upload a PDF to start the AI analysis pipeline.</p>

              <input type="file" id="file-input" hidden onChange={handleUpload} accept=".pdf" />
              <button className="btn-action" style={{ margin: '0 auto' }} id="upload-btn">
                <FileText size={18} />
                Choose PDF Resume
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-val">~30s</div>
                <div className="stat-label">Full Pipeline Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">3-Step</div>
                <div className="stat-label">AI Agent Pipeline</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Job Description ───────────────────────── */}
        {step === 2 && (
          <div className="dashboard-grid animate-slide-up">
            {/* Sidebar */}
            <aside className="premium-card aside-card">
              <div className="status-badge">
                <div className="status-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3>Profile Loaded</h3>
                  <p>Resume parsed successfully</p>
                </div>
              </div>

              <div className="info-group">
                <span className="info-label">Candidate</span>
                <div className="info-value">{resumeData?.name}</div>
              </div>

              <div className="info-group">
                <span className="info-label">Skills Detected</span>
                <div className="tags-container">
                  {resumeData?.skills?.slice(0, 12).map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                  {resumeData?.skills?.length > 12 && (
                    <span className="skill-tag">+{resumeData.skills.length - 12} more</span>
                  )}
                </div>
              </div>

              <button
                className="btn-secondary"
                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                onClick={() => setStep(1)}
                id="replace-resume-btn"
              >
                <RefreshCcw size={14} />
                Replace Resume
              </button>
            </aside>

            {/* Main */}
            <section className="premium-card">
              <div className="job-card-header">
                <Target size={22} color="var(--primary)" />
                <h2>Paste Job Description</h2>
              </div>
              <p className="job-card-desc">
                Our AI will compare your profile against the role requirements and score your compatibility.
              </p>

              <textarea
                className="textarea-premium"
                style={{ height: '260px', marginBottom: '1.75rem' }}
                placeholder="Paste the full job description — title, responsibilities, requirements..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                id="job-description-input"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-action" onClick={handleMatch} disabled={loading} id="evaluate-btn">
                  <Zap size={18} />
                  Evaluate My Fit
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Step 3: Match Report ──────────────────────────── */}
        {step === 3 && (
          <div className="premium-card animate-slide-up">
            <div className="report-header">
              <div>
                <h2>Match Intelligence Report</h2>
                <div className="report-subtitle">
                  <Briefcase size={14} />
                  AI evaluation against provided job description
                </div>
              </div>
              <button className="btn-secondary" onClick={() => setStep(2)} id="adjust-desc-btn">
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                Edit Description
              </button>
            </div>

            <div className="report-body">
              {typeof matchResult === 'object' && matchResult !== null ? (
                <>
                  {/* Score Gauge */}
                  <div className="gauge-row">
                    <div
                      className="radial-gauge"
                      style={{
                        background: `conic-gradient(var(--accent) ${matchResult.match_score}%, rgba(255,255,255,0.05) 0)`
                      }}
                    >
                      <div className="radial-gauge-inner">
                        <span className="gauge-val">{matchResult.match_score}%</span>
                        <span className="gauge-unit">match</span>
                      </div>
                    </div>
                    <div className="gauge-info">
                      <h3>Overall Compatibility</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Based on skills, experience,<br />and job requirements.
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="skills-split-grid">
                    <div className="skills-column match">
                      <h4><CheckCircle2 size={13} /> Matched Skills</h4>
                      <div className="tags-container">
                        {matchResult.matching_skills?.map(s => (
                          <span key={s} className="badge-green">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="skills-column missing">
                      <h4><X size={13} /> Skill Gaps</h4>
                      <div className="tags-container">
                        {matchResult.missing_skills?.map(s => (
                          <span key={s} className="badge-red">{s}</span>
                        ))}
                        {(!matchResult.missing_skills || matchResult.missing_skills.length === 0) && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None identified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="evaluation-box">
                    <h4>AI Evaluation Summary</h4>
                    <p className="evaluation-text">{matchResult.summary}</p>
                  </div>
                </>
              ) : (
                <p className="evaluation-text" style={{ whiteSpace: 'pre-wrap' }}>{matchResult}</p>
              )}
            </div>

            <div className="report-footer">
              <button
                className="btn-action"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 10px 20px -4px var(--accent-glow)' }}
                onClick={handleGenerateCoverLetter}
                disabled={loading}
                id="generate-letter-btn"
              >
                <Send size={18} />
                Generate Cover Letter
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Cover Letter ──────────────────────────── */}
        {step === 4 && (
          <div className="premium-card animate-slide-up">
            <div className="cover-letter-header">
              <h2 className="cover-letter-title">
                <Award size={22} color="var(--primary)" />
                Tailored Cover Letter
              </h2>
              <div className="cover-letter-actions">
                <button className="btn-secondary" onClick={handleCopy} id="copy-letter-btn">
                  <Copy size={14} />
                  Copy
                </button>
                <button className="btn-secondary" onClick={handleDownload} id="download-letter-btn">
                  <Download size={14} />
                  Download .txt
                </button>
                <button
                  className="btn-action"
                  style={{ padding: '0.65rem 1.25rem' }}
                  onClick={() => { setStep(1); setResumeData(null); setMatchResult(null); setCoverLetter(''); setJobDescription(''); }}
                  id="new-session-btn"
                >
                  <Sparkles size={15} />
                  New Session
                </button>
              </div>
            </div>

            <div className="paper-sheet" id="cover-letter-output">
              {coverLetter}
            </div>

            <p className="note-text">
              <Info size={13} />
              Generated from your resume and tailored to match the job description.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <div className="page-footer-inner">
          <span>CrewAI</span>
          <span className="footer-dot" />
          <span>FastAPI</span>
          <span className="footer-dot" />
          <span>React 18</span>
          <span className="footer-dot" />
          <span>Groq LLM</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

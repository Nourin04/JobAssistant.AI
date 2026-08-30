import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, Target, Send, CheckCircle2, 
  Loader2, Download, Copy, RefreshCcw, Briefcase, 
  Award, ChevronRight, AlertCircle, X, Check
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-clear error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/analyze`, formData);
      setResumeData(resp.data);
      setStep(2);
    } catch (err) {
      setError("Analysis failed. Ensure the backend is running and the PDF is valid.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!jobDescription) {
      setError("Please provide a job description first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/match`, {
        resume: resumeData,
        job_description: jobDescription
      });
      setMatchResult(resp.data.result);
      setStep(3);
    } catch (err) {
      setError("Job matching failed. Check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/cover-letter`, {
        resume: resumeData,
        job_description: jobDescription
      });
      setCoverLetter(resp.data.cover_letter);
      setStep(4);
    } catch (err) {
      setError("Cover letter generation failed.");
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
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData?.name?.replace(/\s+/g, '_') || "Candidate"}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(s => (
        <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} />
      ))}
    </div>
  );

  return (
    <div className="max-w-container">
      {/* Notifications */}
      {error && (
        <div className="toast-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <X size={18} style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => setError(null)} />
        </div>
      )}

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="copy-toast">
          <Check size={18} />
          <span>Copied to Clipboard!</span>
        </div>
      )}

      {/* Header */}
      <header className="header-container animate-slide-up">
        <div className="badge-tag">
          Next-Gen AI Career Suite
        </div>
        <h1 className="title-gradient main-title">
          JobAssistant<span style={{ color: 'var(--primary)' }}>.ai</span>
        </h1>
        <p className="header-subtitle">
          High-performance resume analysis and job matching powered by CrewAI and advanced LLMs.
        </p>
      </header>

      {renderStepIndicator()}

      <main className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="premium-card upload-card">
            <div className="upload-zone" onClick={() => document.getElementById('file-input').click()}>
              <div className="upload-icon-wrapper">
                <Upload size={32} color="var(--primary)" />
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Drop your experience here</h2>
              <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Upload your PDF resume to start the AI analysis.</p>
              
              <input type="file" id="file-input" hidden onChange={handleUpload} accept=".pdf" />
              <button className="btn-action" style={{ margin: '0 auto' }}>
                {loading ? <Loader2 className="loading-spinner" /> : <FileText size={20} />}
                {loading ? 'Analyzing Profile...' : 'Upload Resume'}
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-val">3.5s</div>
                <div className="stat-label">Avg. Analysis</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">98%</div>
                <div className="stat-label">Extraction Accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analysis Display & Job Input */}
        {step === 2 && (
          <div className="dashboard-grid">
            <aside className="premium-card aside-card">
              <div className="status-badge">
                <div className="status-icon">
                  <CheckCircle2 size={20} />
                </div>
                <h3>Profile Sync'd</h3>
              </div>

              <div className="info-group">
                <span className="info-label">Candidate</span>
                <div className="info-value">{resumeData?.name}</div>
              </div>

              <div className="info-group">
                <span className="info-label">Expertise Highlights</span>
                <div className="tags-container">
                  {resumeData?.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>

              <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setStep(1)}>
                <RefreshCcw size={16} style={{ marginRight: '8px', display: 'inline' }} /> Replace Resume
              </button>
            </aside>

            <section className="premium-card">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Target size={24} color="var(--primary)" /> Find Your Match
              </h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>Paste the job description below. Our AI will simulate a hiring panel to evaluate your fit.</p>
              
              <textarea 
                className="textarea-premium" 
                style={{ height: '240px', marginBottom: '2rem' }}
                placeholder="Job title, responsibilities, and requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-action" onClick={handleMatch} disabled={loading}>
                  {loading ? <Loader2 className="loading-spinner" /> : <ChevronRight size={20} />}
                  {loading ? 'Evaluating Match...' : 'Start Evaluation'}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Step 3: Match Result */}
        {step === 3 && (
          <div className="premium-card animate-slide-up">
            <header className="report-header">
              <div>
                <h2>Match Intelligence Report</h2>
                <div className="report-subtitle">
                  <Briefcase size={16} /> Evaluation against provided Job Description
                </div>
              </div>
              <button className="btn-secondary" onClick={() => setStep(2)}>Adjust Description</button>
            </header>

            <div className="report-body">
              {typeof matchResult === 'object' && matchResult !== null ? (
                <div>
                  <div className="gauge-row">
                    <div className="radial-gauge" style={{ background: `conic-gradient(var(--accent) ${matchResult.match_score}%, rgba(255,255,255,0.1) 0)` }}>
                      <div className="radial-gauge-inner">
                         <span className="gauge-val">{matchResult.match_score}%</span>
                      </div>
                    </div>
                    <div className="gauge-info">
                      <h3>Overall Compatibility</h3>
                      <p className="text-muted">Based on skills, experience, and requirements.</p>
                    </div>
                  </div>

                  <div className="skills-split-grid">
                    <div className="skills-column match">
                      <h4>
                        <CheckCircle2 size={18} /> Matching Skills
                      </h4>
                      <div className="tags-container">
                        {matchResult.matching_skills?.map(s => <span key={s} className="badge-green">{s}</span>)}
                      </div>
                    </div>
                    <div className="skills-column missing">
                      <h4>
                        <X size={18} /> Missing Skills
                      </h4>
                      <div className="tags-container">
                        {matchResult.missing_skills?.map(s => <span key={s} className="badge-red">{s}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="evaluation-box">
                    <h4>AI Evaluation Summary</h4>
                    <p className="evaluation-text">{matchResult.summary}</p>
                  </div>
                </div>
              ) : (
                <div className="evaluation-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {matchResult}
                </div>
              )}
            </div>

            <footer className="report-footer">
              <button className="btn-action" style={{ background: 'var(--accent)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }} onClick={handleGenerateCoverLetter} disabled={loading}>
                {loading ? <Loader2 className="loading-spinner" /> : <Send size={20} />}
                {loading ? 'Assembling Letter...' : 'Generate AI Cover Letter'}
              </button>
            </footer>
          </div>
        )}

        {/* Step 4: Cover Letter */}
        {step === 4 && (
          <div className="premium-card animate-slide-up">
            <header className="report-header" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={24} color="var(--primary)" /> Tailored Cover Letter
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleCopy}>
                  <Copy size={16} /> Copy Letter
                </button>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleDownload}>
                  <Download size={16} /> Download
                </button>
                <button className="btn-action" onClick={() => setStep(1)}>New Session</button>
              </div>
            </header>

            <div className="paper-sheet">
              {coverLetter}
            </div>
            
            <p className="note-text">
              Note: This letter was generated based on your resume and specifically matched to the job requirements.
            </p>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '6rem', textAlign: 'center', paddingBottom: '3rem', opacity: 0.5 }}>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <span>Powered by CrewAI</span>
          <span style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }} />
          <span>FastAPI</span>
          <span style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }} />
          <span>React 18</span>
        </p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, Target, Send, CheckCircle2, 
  Loader2, Download, Copy, RefreshCcw, Briefcase, 
  Cpu, Award, ChevronRight, AlertCircle, X 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);

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

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} />
      ))}
    </div>
  );

  return (
    <div className="max-w-container">
      {/* Notifications */}
      {error && (
        <div style={{ position: 'fixed', top: '2rem', right: '2rem', background: '#ef4444', color: 'white', padding: '1rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1000, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease-out' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <X size={18} style={{ cursor: 'pointer', marginLeft: '1rem' }} onClick={() => setError(null)} />
        </div>
      )}

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '5rem' }} className="animate-slide-up">
        <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '2rem', color: 'var(--primary)', fontStyle: '0.75rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          Next-Gen AI Career Suite
        </div>
        <h1 className="title-gradient" style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>
          JobAssistant<span style={{ color: 'var(--primary)' }}>.ai</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          High-performance resume analysis and job matching powered by CrewAI and advanced LLMs.
        </p>
      </header>

      {renderStepIndicator()}

      <main className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="premium-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="upload-zone" onClick={() => document.getElementById('file-input').click()}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifySelf: 'center', margin: '0 auto 2rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <Upload size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Drop your experience here</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Upload your PDF resume to start the AI analysis.</p>
              
              <input type="file" id="file-input" hidden onChange={handleUpload} accept=".pdf" />
              <button className="btn-action" style={{ margin: '0 auto' }}>
                {loading ? <Loader2 className="loading-spinner" /> : <FileText size={20} />}
                {loading ? 'Analyzing Profile...' : 'Upload Resume'}
              </button>
            </div>
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>3.5s</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Avg. Analysis</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>98%</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Extraction Accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analysis Display & Job Input */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
            <aside className="premium-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} color="white" />
                </div>
                <h3>Profile Sync'd</h3>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate</label>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{resumeData?.name}</div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Expertise Highlights</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {resumeData?.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>

              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setStep(1)}>
                <RefreshCcw size={16} style={{ marginRight: '10px' }} /> Replace Resume
              </button>
            </aside>

            <section className="premium-card">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Target size={24} color="var(--primary)" /> Find Your Match
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Paste the job description below. Our AI will simulate a hiring panel to evaluate your fit.</p>
              
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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>Match Intelligence Report</h2>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={16} /> Evaluation against provided Job Description
                </div>
              </div>
              <button className="btn-secondary" onClick={() => setStep(2)}>Adjust Description</button>
            </header>

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#e2e8f0', background: 'rgba(0,0,0,0.2)', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', fontFamily: 'Inter, sans-serif' }}>
              {matchResult}
            </div>

            <footer style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
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
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={24} color="var(--primary)" /> Tailored Cover Letter
              </h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={() => {
                  navigator.clipboard.writeText(coverLetter);
                  alert("Copied to clipboard!");
                }}>
                  <Copy size={16} style={{ marginRight: '8px' }} /> Copy
                </button>
                <button className="btn-action" onClick={() => setStep(1)}>New Session</button>
              </div>
            </header>

            <div style={{ whiteSpace: 'pre-wrap', background: 'white', padding: '4rem', borderRadius: '1rem', fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', lineHeight: '1.7', color: '#334155', boxShadow: 'inset 0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              {coverLetter}
            </div>
            
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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

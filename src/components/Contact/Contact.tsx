import React, { useState } from 'react';
import './Contact.scss';

const INTENTS = [
  {
    id: 'project',
    label: 'New Project / Build',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'hire',
    label: 'Full-time / Contract Role',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'agency',
    label: 'Agency Collaboration',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Quick Chat / Advisory',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
] as const;

const CAPABILITY_TAGS = [
  'Creative Frontend (React / GSAP)',
  'Shopify / Liquid Architecture',
  'Webflow / Custom CMS',
  'Figma to Production Code',
  'Design Systems & UI/UX',
  'Full-Stack & Web Apps',
  'Performance & Motion Audit',
  'Full-time Engineering Hire',
];

const BUDGET_OPTIONS = [
  '< $2,000',
  '$2,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'Salary / Comp Spec',
];

const TIMELINE_OPTIONS = [
  'Immediate (< 2 wks)',
  '1 – 2 Months',
  'Q3 / Q4 Roadmap',
  'Flexible',
];

export default function Contact() {
  const [intent, setIntent] = useState<string>('project');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    'Creative Frontend (React / GSAP)',
  ]);
  const [budget, setBudget] = useState('$2,000 – $5,000');
  const [timeline, setTimeline] = useState('1 – 2 Months');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCapability = (tag: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('nityavariya045@gmail.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } catch {
      window.location.href = 'mailto:nityavariya045@gmail.com';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Please enter your name or studio.';
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!message.trim()) {
      newErrors.message = 'Please provide a short message or project overview.';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';

    try {
      if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: accessKey,
            name,
            email,
            subject: `New Portfolio Inquiry [${intent.toUpperCase()}] from ${name}`,
            intent: intent.toUpperCase(),
            services: selectedCapabilities.join(', '),
            budget,
            timeline,
            link: projectLink || 'None provided',
            message,
            from_name: `${name} (via Portfolio)`,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setIsSubmitted(true);
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } else {
        // Fallback simulation if key has not been configured yet
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSubmitted(true);
      }
    } catch {
      // Fallback direct transmission
      const subject = encodeURIComponent(`[Inquiry: ${intent.toUpperCase()}] from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name} (${email})\nLooking for: ${intent}\nServices: ${selectedCapabilities.join(
          ', '
        )}\nBudget: ${budget}\nTimeline: ${timeline}\nLink: ${projectLink}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:nityavariya045@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setProjectLink('');
    setMessage('');
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <section className="contact_section" id="contact" aria-label="Contact and Inquiries">
      <div className="contact_container">

        {/* ── Left Column: Clean Narrative & Direct Links ────────────── */}
        <div className="contact_narrative_col">
          <div className="contact_chapter_tag">
            <span className="contact_tag_dot" />
            <span className="contact_tag_text">CONTACT</span>
          </div>

          <h2 className="contact_headline">
            Let's build something that leaves an <em>imprint.</em>
          </h2>

          <p className="contact_subtext">
            Have a project in mind, need a dedicated creative frontend engineer for your team, or want to discuss a new collaboration? Fill in the form or reach out directly.
          </p>

          {/* Direct Actions */}
          <div className="contact_actions_hub">
            <button
              type="button"
              className={`contact_copy_btn ${copiedEmail ? 'is-copied' : ''}`}
              onClick={handleCopyEmail}
              aria-label="Copy email address to clipboard"
            >
              <svg className="contact_btn_icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copiedEmail ? 'Email Copied to Clipboard' : 'nityavariya045@gmail.com'}</span>
            </button>

            <div className="contact_direct_links">
              <a
                href="https://www.linkedin.com/in/nitya-web-designer/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_direct_link"
                aria-label="LinkedIn profile"
              >
                <span>LinkedIn</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <span className="contact_link_divider">/</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_direct_link"
                aria-label="GitHub profile"
              >
                <span>GitHub</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <span className="contact_link_divider">/</span>
              <a
                href="mailto:nityavariya045@gmail.com"
                className="contact_direct_link"
                aria-label="Direct email client"
              >
                <span>Email</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── Right Column: Clean Minimal Form ───────────────────────── */}
        <div className="contact_form_col">
          <div className="contact_form_card">
            {isSubmitted ? (
              <div className="contact_success_state" role="alert">
                <div className="success_badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="success_title">Message Sent</h3>
                <p className="success_desc">
                  Thank you, <strong>{name}</strong>. Your inquiry has been sent successfully. I will review your details and get back to you at <strong>{email}</strong> shortly.
                </p>
                <div className="success_metadata">
                  <div className="success_meta_item">
                    <span>TYPE:</span> {intent.toUpperCase()}
                  </div>
                  <div className="success_meta_item">
                    <span>TIMELINE:</span> {timeline}
                  </div>
                </div>
                <button
                  type="button"
                  className="contact_reset_btn"
                  onClick={handleReset}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <form className="contact_form" onSubmit={handleSubmit} noValidate>

                {/* Section: Intent */}
                <div className="form_group">
                  <label className="form_label">I'm interested in...</label>
                  <div className="intent_pills_grid" role="radiogroup" aria-label="Inquiry Type">
                    {INTENTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`intent_pill ${intent === item.id ? 'is-active' : ''}`}
                        onClick={() => setIntent(item.id)}
                        role="radio"
                        aria-checked={intent === item.id}
                      >
                        <span className="intent_pill_icon">{item.icon}</span>
                        <span className="intent_pill_label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Identity */}
                <div className="form_group">
                  <label className="form_label">Your Details</label>
                  <div className="form_inputs_row">
                    <div className="input_wrapper">
                      <input
                        type="text"
                        className={`form_input ${errors.name ? 'has-error' : ''}`}
                        placeholder="Your Name or Studio *"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        aria-required="true"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <span className="field_error">{errors.name}</span>}
                    </div>

                    <div className="input_wrapper">
                      <input
                        type="email"
                        className={`form_input ${errors.email ? 'has-error' : ''}`}
                        placeholder="Email Address *"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <span className="field_error">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="input_wrapper input_wrapper--full">
                    <input
                      type="url"
                      className="form_input"
                      placeholder="Website, Figma Link, or Job Post URL (Optional)"
                      value={projectLink}
                      onChange={(e) => setProjectLink(e.target.value)}
                    />
                  </div>
                </div>

                {/* Section: Services & Capabilities */}
                <div className="form_group">
                  <label className="form_label">Services & Scope</label>
                  <div className="tags_cloud">
                    {CAPABILITY_TAGS.map((tag) => {
                      const isSelected = selectedCapabilities.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={`tag_pill ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => toggleCapability(tag)}
                          aria-pressed={isSelected}
                        >
                          <span className="tag_indicator">
                            {isSelected ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            )}
                          </span>
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Budget & Timeline */}
                <div className="form_group">
                  <div className="parameters_grid">
                    <div className="param_col">
                      <label className="form_sublabel">Estimated Budget</label>
                      <div className="param_pills">
                        {BUDGET_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`param_pill ${budget === opt ? 'is-active' : ''}`}
                            onClick={() => setBudget(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="param_col">
                      <label className="form_sublabel">Target Timeline</label>
                      <div className="param_pills">
                        {TIMELINE_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`param_pill ${timeline === opt ? 'is-active' : ''}`}
                            onClick={() => setTimeline(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Message */}
                <div className="form_group">
                  <div className="form_label_row">
                    <label className="form_label" htmlFor="contact-brief">
                      Project Overview / Message
                    </label>
                    <span className="char_counter">{message.length} / 1000</span>
                  </div>
                  <div className="input_wrapper">
                    <textarea
                      id="contact-brief"
                      className={`form_textarea ${errors.message ? 'has-error' : ''}`}
                      rows={4}
                      maxLength={1000}
                      placeholder={
                        intent === 'project'
                          ? 'Tell me about the vision, key deliverables, goals, or references...'
                          : intent === 'hire'
                          ? 'Tell me about the role, team, technology stack, and hiring timeline...'
                          : 'Tell me about the partnership or project you would like to discuss...'
                      }
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
                      }}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && <span className="field_error">{errors.message}</span>}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="form_submit_wrapper">
                  <button
                    type="submit"
                    className={`contact_submit_btn ${isSubmitting ? 'is-submitting' : ''}`}
                    disabled={isSubmitting}
                  >
                    <span className="btn_label">
                      {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    </span>
                    <svg className="btn_arrow" width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8H15M15 8L8.5 1.5M15 8L8.5 14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="submit_disclaimer">
                    Direct message • Fast reply within 24 hours.
                  </span>
                </div>

              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

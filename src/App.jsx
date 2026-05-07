import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, hasFirebaseConfig } from "./firebase";
import { betaCode, betaUrl, faqItems, infoCards, marketingUrl } from "./content";

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <article className={`faq-item ${isOpen ? "is-open" : ""}`}>
      <button
        className="faq-trigger"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{item.question}</span>
        <span className="faq-icon" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen ? <p className="faq-answer">{item.answer}</p> : null}
    </article>
  );
}

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

export default function App() {
  const [openFaq, setOpenFaq] = useState(0);
  const [formValues, setFormValues] = useState(initialFormState);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasFirebaseConfig || !db) {
      setStatus({
        type: "error",
        message:
          "The contact form is not connected yet. Add your Firebase config to enable submissions.",
      });
      return;
    }

    setStatus({ type: "pending", message: "Sending your question..." });

    try {
      await addDoc(collection(db, "contactSubmissions"), {
        ...formValues,
        source: "kove-campus-beta-page",
        createdAt: serverTimestamp(),
      });

      setFormValues(initialFormState);
      setStatus({
        type: "success",
        message: "Question sent. We will get back to you soon.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          "Something went wrong while sending your question. Please try again in a bit.",
      });
    }
  };

  return (
    <div className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-pill">WWU students: beta testers wanted</span>
          <h1>Join the Kove beta. Free for WWU students through August.</h1>
          <p className="hero-text">
            Kove is looking for students to test a money app that helps you track
            spending, build a budget, and actually understand where your money goes.
            Access is free through August.
          </p>

          <div className="hero-code-card">
            <span className="code-label">Access code</span>
            <strong>{betaCode}</strong>
            <p>Redeem this code on a computer at KoveBeta.com</p>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href={betaUrl} target="_blank" rel="noreferrer">
              Open Kove Beta
            </a>
            <a className="button button-secondary" href={marketingUrl} target="_blank" rel="noreferrer">
              Main website
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-top">
            <span className="panel-kicker">What you get in beta</span>
            <span className="panel-badge">Free through August</span>
          </div>
          <ul className="feature-list">
            <li>Track spending without spreadsheets</li>
            <li>See category breakdowns and cash flow</li>
            <li>Use KoveAI to make sense of your spending</li>
            <li>Set savings goals and watch progress build</li>
          </ul>
          <div className="trust-grid">
            <div>
              <span>Privacy</span>
              <strong>No data selling</strong>
            </div>
            <div>
              <span>Built by</span>
              <strong>Maceo, a student at WWU</strong>
            </div>
            <div>
              <span>Account linking</span>
              <strong>Plaid</strong>
            </div>
            <div>
              <span>Best on</span>
              <strong>Desktop during beta</strong>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="info-section">
          <SectionHeading
            eyebrow="Why students are trying it"
            title="Short version: it is free, convenient, and secure."
            text="Everything here is meant to be easy to scan on your phone."
          />

          <div className="info-grid">
            {infoCards.map((card) => (
              <article className="info-card" key={card.title}>
                <span className="card-eyebrow">{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="faq-section">
          <SectionHeading
            eyebrow="FAQ"
            title="Quick answers before you open the beta."
            text="Tap a question to expand it."
          />

          <div className="faq-list">
            {faqItems.map((item, index) => (
              <FaqItem
                item={item}
                key={item.question}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>
        </section>

        <section className="website-section">
          <div className="website-copy">
            <span className="section-eyebrow">Want the bigger picture?</span>
            <h2>Check out the full Kove website.</h2>
            <p>See the broader product story, company background, and more about what Kove is building.</p>
          </div>
          <a className="button button-secondary" href={marketingUrl} target="_blank" rel="noreferrer">
            Visit KoveFinance.com
          </a>
        </section>

        <section className="contact-section">
          <SectionHeading
            eyebrow="Questions?"
            title="Send a note."
            text="This form goes straight to the Kove team."
          />

          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                autoComplete="name"
                name="name"
                onChange={handleChange}
                placeholder="Your name"
                required
                type="text"
                value={formValues.name}
              />
            </label>

            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                onChange={handleChange}
                placeholder="you@school.edu"
                required
                type="email"
                value={formValues.email}
              />
            </label>

            <label>
              Message
              <textarea
                name="message"
                onChange={handleChange}
                placeholder="Ask anything about the beta."
                required
                rows="5"
                value={formValues.message}
              />
            </label>

            <button className="button button-primary" disabled={status.type === "pending"} type="submit">
              {status.type === "pending" ? "Sending..." : "Send question"}
            </button>

            {status.type !== "idle" ? (
              <p className={`form-status form-status-${status.type}`}>{status.message}</p>
            ) : null}
          </form>
        </section>

        <section className="access-strip" aria-label="Beta access reminder">
          <div>
            <span className="section-eyebrow">Ready to try it?</span>
            <h2>Use code {betaCode} and open the beta on a computer.</h2>
            <p>Same code as the poster. Open the beta, redeem it during signup, and start exploring.</p>
          </div>
          <a className="button button-primary" href={betaUrl} target="_blank" rel="noreferrer">
            Go to Kove Beta
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>Kove</strong>
          <p>A product of Keane Financials LLC.</p>
        </div>
        <div className="footer-links">
          <a href={marketingUrl} target="_blank" rel="noreferrer">
            KoveFinance.com
          </a>
          <a href={betaUrl} target="_blank" rel="noreferrer">
            KoveBeta.com
          </a>
        </div>
      </footer>
    </div>
  );
}

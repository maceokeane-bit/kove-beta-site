import { useEffect, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, hasFirebaseConfig } from "./firebase";
import {
  accessCode,
  appStoreHref,
  codeConnections,
  codeExpires,
  codeSpots,
  detectPlatform,
  faqItems,
  features,
  marketingUrl,
  openAppHref,
  playStoreHref,
  privacyUrl,
  steps,
  track,
  webAppUrl,
} from "./content";

const platform = detectPlatform();

// Official badges, unmodified, both at the same height (Google's badge rules).
const storeBadges = [
  {
    key: "ios",
    href: appStoreHref(),
    src: "/images/app-store.svg",
    alt: "Download on the App Store",
    width: 120,
    height: 40,
  },
  {
    key: "android",
    href: playStoreHref(),
    src: "/images/google-play.png",
    alt: "Get it on Google Play",
    width: 564,
    height: 168,
  },
];

function StoreButtons() {
  // Put the visitor's own store first.
  const ordered = platform === "android" ? [...storeBadges].reverse() : storeBadges;
  return (
    <div className="store-buttons">
      {ordered.map((badge) => (
        <a
          key={badge.key}
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("store_click", { store: badge.key })}
        >
          <img src={badge.src} alt={badge.alt} width={badge.width} height={badge.height} />
        </a>
      ))}
    </div>
  );
}

/**
 * /get, the "Get the app" poster QR. Logs the scan, then sends the phone to its
 * store (tagged with the poster design) or a computer to the web app. Waits for
 * the Google tag to confirm the hit, with a timeout so nobody gets stuck.
 */
function GetApp() {
  const destination =
    platform === "ios" ? appStoreHref() : platform === "android" ? playStoreHref() : webAppUrl;

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.location.replace(destination);
    };
    track("get_app_scan", { platform, event_callback: go, event_timeout: 1500 });
    const fallback = setTimeout(go, 1800);
    return () => clearTimeout(fallback);
  }, [destination]);

  const storeName = platform === "ios" ? "the App Store" : platform === "android" ? "Google Play" : "Kove";

  return (
    <main className="get-app">
      <img src="/images/logo.png" alt="" width="64" height="64" />
      <h1>Opening {storeName}...</h1>
      <p>
        Once Kove is installed, enter code <strong>{accessCode}</strong> in Settings, Access Program.
      </p>
      <a className="button button-primary" href={destination}>
        Continue to {storeName}
      </a>
      <a className="text-link" href="/">
        Learn more about Kove
      </a>
    </main>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// The Clipboard API can be missing or blocked (older browsers, in-app QR
// scanner browsers), so fall back to the legacy copy command.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

// Facts match the FAQ in content.js: no card needed, nothing charged at the end.
const ledger = [
  ["Free for", `first ${codeSpots} students`],
  ["Full access through", codeExpires],
  ["Connected banks", `up to ${codeConnections}`],
  ["Features", "all of them"],
  ["Card needed", "none"],
];

function CodeCard() {
  const [copyState, setCopyState] = useState("idle");
  const codeRef = useRef(null);

  const handleCopy = async () => {
    if (await copyText(accessCode)) {
      setCopyState("copied");
    } else {
      // Select the code so it's one tap from the system copy menu.
      window.getSelection()?.selectAllChildren(codeRef.current);
      setCopyState("manual");
    }
    setTimeout(() => setCopyState("idle"), 2500);
  };
  const copied = copyState === "copied";

  return (
    <div className="code-card">
      <span className="code-label">WWU access code</span>
      <div className="code-row">
        <strong className="code-value" ref={codeRef}>
          {accessCode}
        </strong>
        <button className="copy-button" type="button" onClick={handleCopy} aria-label={`Copy code ${accessCode}`}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="copy-status" role="status">
        {copyState === "manual" ? "Code selected. Tap Copy in your phone's menu." : ""}
      </p>
      <dl className="code-ledger">
        {ledger.map(([label, value]) => (
          <div className="ledger-row" key={label}>
            <dt>{label}</dt>
            <span className="ledger-leader" aria-hidden="true" />
            <dd>{value}</dd>
          </div>
        ))}
        <div className="ledger-row ledger-total">
          <dt>Charged when it ends</dt>
          <span className="ledger-leader" aria-hidden="true" />
          <dd>$0</dd>
        </div>
      </dl>
      <p className="code-note">Code fully used? Student plans start at $1.99/mo.</p>
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <article className={`faq-item ${isOpen ? "is-open" : ""}`}>
      <button className="faq-trigger" type="button" aria-expanded={isOpen} onClick={onToggle}>
        <span>{item.question}</span>
        <span className="faq-icon" aria-hidden="true">
          <ChevronIcon />
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

function ContactForm() {
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
        message: "The contact form isn't connected right now. Please try again later.",
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
        message: "Question sent. We'll get back to you soon.",
      });
      setTimeout(() => setStatus({ type: "idle", message: "" }), 4000);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Something went wrong sending your question. Please try again in a bit.",
      });
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input autoComplete="name" name="name" onChange={handleChange} placeholder="Your name" required type="text" value={formValues.name} />
      </label>

      <label>
        Email
        <input autoComplete="email" name="email" onChange={handleChange} placeholder="you@wwu.edu" required type="email" value={formValues.email} />
      </label>

      <label>
        Message
        <textarea name="message" onChange={handleChange} placeholder="Ask us anything about Kove or the code." required rows="4" value={formValues.message} />
      </label>

      <button className="button button-primary" disabled={status.type === "pending"} type="submit">
        {status.type === "pending" ? "Sending..." : "Send question"}
      </button>

      {status.type !== "idle" ? (
        <p className={`form-status form-status-${status.type}`} role="status">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}

const isGetAppRoute = window.location.pathname.replace(/\/+$/, "") === "/get";

export default function App() {
  return isGetAppRoute ? <GetApp /> : <LandingPage />;
}

function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const openHref = openAppHref(platform);
  const openIsWeb = platform === "desktop";

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner glass">
          <a className="brand" href={marketingUrl} target="_blank" rel="noreferrer">
            <img src="/images/logo.png" alt="" width="32" height="32" />
            <span>Kove</span>
          </a>
          <a className="topbar-code" href="#code">
            WWU code <strong>{accessCode}</strong>
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-pill">Free for the first {codeSpots} WWU students</span>
              <h1>Finally, a budgeting app that&rsquo;s actually on your side.</h1>
              <p className="hero-text">Track spending, budgets, and goals in one place. No data selling, no investors.</p>
            </div>

            <div className="hero-visual">
              <img
                src="/images/hero-phones.webp"
                alt="Kove on two iPhones: the Spending screen in dark mode showing October spending by category, and the Home screen showing $1,196 left in the October budget"
                width="1400"
                height="1901"
                fetchPriority="high"
              />
              <div className="hero-qr">
                <div className="hero-qr-code">
                  <img src="/images/app-download.svg" alt="QR code to download the Kove app from the App Store or Google Play" width="33" height="33" />
                  <span className="hero-qr-logo">
                    <img src="/images/logo.png" alt="" width="48" height="48" />
                  </span>
                </div>
                <p>Scan to get the app</p>
              </div>
            </div>

            <div className="hero-actions">
              <StoreButtons />
              <a className="text-link" href={webAppUrl} target="_blank" rel="noreferrer">
                Or use Kove on the web &rarr;
              </a>
            </div>
          </div>
        </section>

        <section className="code-section" id="code">
          <div className="container code-grid">
            <div className="code-copy">
              <span className="section-eyebrow">Your access code</span>
              <h2>Get Kove free with this code.</h2>
              <p>
                The first {codeSpots} WWU students who enter it get full access. After that the code stops working, but Kove is still
                yours on a student plan starting at $1.99/mo.
              </p>
            </div>
            <CodeCard />
          </div>
        </section>

        <section className="founder-section">
          <div className="container narrow founder-copy">
            <span className="section-eyebrow">Made at Western</span>
            <h2>Built by a WWU student.</h2>
            <p>
              Kove was started by a student here at Western. That&rsquo;s why these {codeSpots} free spots go to WWU students first,
              and why <a href="#contact">the form below</a> reaches us directly.
            </p>
          </div>
        </section>

        <section className="steps-section">
          <div className="container">
            <SectionHeading eyebrow="How it works" title="Redeem your code in 3 steps." text="Same steps on iPhone, Android, and the web." />
            <ol className="steps">
              {steps.map((step, index) => (
                <li className="step" key={step.title}>
                  <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="steps-cta">
              <a
                className="button button-primary"
                href={openHref}
                onClick={() => track("open_kove_click", { platform })}
                {...(openIsWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {openIsWeb ? "Open Kove on the web" : "Open Kove"}
              </a>
              <p>{openIsWeb ? "Or scan the QR code above to get the app on your phone." : "Opens the app, or its store page if you don't have it yet."}</p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <SectionHeading eyebrow="What you get" title="Everything you need, nothing you don't." />
            <div className="features">
              {features.map((feature) => (
                <article className="feature" key={feature.eyebrow}>
                  <div className="feature-copy">
                    <span className="section-eyebrow">{feature.eyebrow}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </div>
                  <div className="feature-shot">
                    <img src={feature.src} alt={feature.alt} width={feature.width} height={feature.height} loading="lazy" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container narrow">
            <SectionHeading eyebrow="FAQ" title="Quick answers." />
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
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container narrow">
            <SectionHeading eyebrow="Questions?" title="Send us a note." text="This goes straight to our team." />
            <ContactForm />
          </div>
        </section>

        <section className="final-cta">
          <div className="container narrow">
            <h2>Ready when you are.</h2>
            <p>
              Get the app, then enter <strong>{accessCode}</strong> in Settings, Access Program.
            </p>
            <StoreButtons />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            Kove is a product of Keane Financials LLC. Not affiliated with Western Washington University.
          </p>
          <div className="footer-links">
            <a href={marketingUrl} target="_blank" rel="noreferrer">
              kovefinance.com
            </a>
            <a href={privacyUrl} target="_blank" rel="noreferrer">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

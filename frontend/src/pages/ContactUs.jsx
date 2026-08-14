import { Link } from "react-router-dom";
import { GYM } from "../data/gymInfo.js";
import SocialLinks from "../components/SocialLinks.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ContactUs() {
  const { user } = useAuth();



  return (
    <div className={user ? "" : "max-w-2xl mx-auto"}>
      {!user && (
        <Link to="/login" className="inline-block text-xs font-mono uppercase tracking-wide text-muted hover:text-signal mb-6">
          ← Back to login
        </Link>
      )}
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-2">
        Contact us
      </h1>
      <p className="text-muted text-sm mb-8">
        Questions about the gym or the tracker — here's how to reach us.
      </p>

      <div className="bg-panel border border-line rounded-xl px-5 py-5 sm:px-6 sm:py-6 mb-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-4">{GYM.name}</h2>

        <div className="flex flex-col gap-4 text-sm">
          <Row icon="pin" label="Address">
            {GYM.fullAddress}
            <span className="block text-muted text-xs font-mono mt-0.5">{GYM.plusCode}</span>
          </Row>

          <Row icon="clock" label="Hours">
            <span className="text-signal">{GYM.hoursNote}</span>
          </Row>

          <Row icon="phone" label="Phone">
            <a href={GYM.phoneHref} className="hover:text-signal transition-colors">
              {GYM.phone}
            </a>
          </Row>

          <Row icon="globe" label="Website">
            <a href={GYM.website} target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors break-all">
              {GYM.website.replace(/^https?:\/\//, "")}
            </a>
          </Row>
        </div>

        <div className="ledger-rule my-5" />

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GYM.mapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm bg-ink border border-line hover:border-signal rounded-xl px-4 py-2.5 transition-colors"
        >
          Get directions
        </a>
      </div>

      <div className="bg-panel border border-line rounded-xl px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-1">Follow along</h2>
        <p className="text-muted text-sm mb-4">Reach the developer directly on social media.</p>
        <SocialLinks />
      </div>
    </div>
  );
}


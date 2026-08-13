import { useState } from "react";
import { Link } from "react-router-dom";
import { GYM, CREATOR } from "../data/gymInfo.js";
import SocialLinks from "../components/SocialLinks.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AboutUs() {
  const [photoFailed, setPhotoFailed] = useState(false);
  const { user } = useAuth();

  return (
    <div className={user ? "" : "max-w-2xl mx-auto"}>
      {!user && (
        <Link to="/login" className="inline-block text-xs font-mono uppercase tracking-wide text-muted hover:text-signal mb-6">
          ← Back to login
        </Link>
      )}
      <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-2">
        About us
      </h1>
      <p className="text-muted text-sm mb-8">
        The gym behind the log, and the person who built it.
      </p>

     

      {/* The creator */}
      <section className="bg-panel border border-line rounded-xl px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-4">
          Built by
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {!photoFailed ? (
            <img
              src={CREATOR.photo}
              alt={CREATOR.name}
              onError={() => setPhotoFailed(true)}
              className="w-20 h-20 rounded-full object-cover border border-line shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border border-line bg-ink flex items-center justify-center font-display font-bold text-lg text-signal shrink-0">
              {CREATOR.initials}
            </div>
          )}

          <div className="flex-1">
            <p className="font-medium text-bone">{CREATOR.name}</p>
            <p className="text-muted text-sm mb-3">{CREATOR.role}</p>
            <SocialLinks />
          </div>
        </div>

        {photoFailed && (
          <p className="text-xs text-muted font-mono mt-4">
            No photo yet — add one at{" "}
            <code className="text-signal">frontend/public/profile.jpg</code> and it'll show up here.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-ink border border-line rounded-xl px-2.5 sm:px-4 py-3">
      <p className="text-muted text-[11px] sm:text-xs uppercase tracking-wide">{label}</p>
      <p className="font-mono text-sm sm:text-base font-medium mt-1 truncate">{value}</p>
    </div>
  );
}

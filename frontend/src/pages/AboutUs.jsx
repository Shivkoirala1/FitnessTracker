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

     

      
  );
}



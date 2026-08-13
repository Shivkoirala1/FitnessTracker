import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QUOTES } from "../data/quotes.js";

export default function AuthLayout({ children, maxWidthClass = "max-w-sm" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] md:grid md:grid-cols-2">
      {/* Left half — auth form */}
      <div className="flex items-center justify-center px-4 sm:px-6 py-10 md:py-0">
        <div className={`w-full ${maxWidthClass}`}>
          {children}
          <div className="flex gap-4 justify-center mt-8 text-xs font-mono uppercase tracking-wide text-muted">
            <Link to="/about" className="hover:text-signal transition-colors">About</Link>
            <Link to="/contact" className="hover:text-signal transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Right half — rotating gym quotes. Hidden on small screens so the
          form gets full width where space is tight. */}
      <div className="hidden md:flex relative flex-col justify-between bg-panel border-l border-line px-10 lg:px-14 py-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(242,238,226,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal" aria-hidden="true" />
          <span className="font-display font-bold text-xl tracking-wide uppercase">
            Richard<span className="text-signal">Gym</span>
          </span>
        </div>

        <div className="relative" key={index}>
          <p className="font-display text-3xl lg:text-4xl uppercase tracking-wide leading-tight mb-6 animate-quote-fade">
            &ldquo;{QUOTES[index]}&rdquo;
          </p>
          <div className="flex gap-1.5">
            {QUOTES.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-signal" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative text-xs font-mono text-muted uppercase tracking-wide">
          Every session logged is a session that counts.
        </p>
      </div>
    </div>
  );
}

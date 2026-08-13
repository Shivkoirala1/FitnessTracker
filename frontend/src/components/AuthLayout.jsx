import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QUOTES } from "../data/quotes.js";

export default function AuthLayout({ children, maxWidthClass = "max-w-sm" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(id);
  }, []);

  
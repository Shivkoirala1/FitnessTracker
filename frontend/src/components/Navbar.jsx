import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/workout", label: "Workout" },
  { to: "/cardio", label: "Cardio" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];


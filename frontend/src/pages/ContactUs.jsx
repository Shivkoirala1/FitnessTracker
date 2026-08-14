import { Link } from "react-router-dom";
import { GYM } from "../data/gymInfo.js";
import SocialLinks from "../components/SocialLinks.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ContactUs() {
  const { user } = useAuth();




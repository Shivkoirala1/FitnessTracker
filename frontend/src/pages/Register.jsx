import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    age: "", height: "", weight: "", sex: "male", activityLevel: "moderate", goal: "maintain",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        ...form,
        age: Number(form.age) || undefined,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }
  
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Nutrition from "./pages/Nutrition.jsx";
import Workout from "./pages/Workout.jsx";
import Cardio from "./pages/Cardio.jsx";
import Profile from "./pages/Profile.jsx";
import History from "./pages/History.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Routes>
          
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>
    </div>
  );
}

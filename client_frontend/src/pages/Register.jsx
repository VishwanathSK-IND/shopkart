import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { registerCustomer } from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
};

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = "Enter a valid 10-digit phone number";
  }

  return errors;
}

function Field({ label, error, ...inputProps }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        {...inputProps}
        className={`w-full border-b-2 bg-transparent py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors ${
          error
            ? "border-red-400"
            : "border-gray-200 focus:border-teal-600"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await registerCustomer(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ShopKart and start shopping."
    >
      {serverError && (
        <div className="mb-5 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field
          label="Full Name"
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Jane Cooper"
          error={errors.fullName}
        />

        <Field
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          error={errors.email}
        />

        <Field
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          error={errors.password}
        />

        <Field
          label="Phone Number"
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="9876543210"
          error={errors.phone}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-teal-600 text-white font-medium py-2.5 text-sm hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-8 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

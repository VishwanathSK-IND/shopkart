import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { loginCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

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

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const validationErrors = {};
    if (!form.email.trim()) validationErrors.email = "Email is required";
    if (!form.password) validationErrors.password = "Password is required";
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await loginCustomer(form);
      // Load this user's saved cart into the shared state.
      refreshCart();
      navigate("/home", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setServerError("Invalid Credentials");
      } else {
        setServerError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue to ShopKart.">
      {serverError && (
        <div className="mb-5 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-2.5">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
          placeholder="Your password"
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-teal-600 text-white font-medium py-2.5 text-sm hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-8 text-center">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-teal-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

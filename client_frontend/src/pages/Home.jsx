import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    getCurrentCustomer()
      .then((res) => {
        if (isMounted) {
          setCustomer(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) navigate("/login", { replace: true });
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-teal-500 to-emerald-500 relative">
            <div className="absolute -bottom-9 left-8 w-20 h-20 rounded-full bg-white p-1.5">
              <div className="w-full h-full rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-semibold">
                {getInitials(customer.fullName) || "?"}
              </div>
            </div>
          </div>

          <div className="pt-12 pb-8 px-8">
            <h1 className="text-xl font-semibold text-gray-900 mt-3">
              Welcome, {customer.fullName}
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Here&apos;s what we have on file for you.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                  Email
                </p>
                <p className="text-sm text-gray-900 break-all">
                  {customer.email}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                  Phone
                </p>
                <p className="text-sm text-gray-900">{customer.phone}</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="mt-8 w-full rounded-full bg-teal-600 text-white text-sm font-medium py-3 hover:bg-teal-700 transition"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

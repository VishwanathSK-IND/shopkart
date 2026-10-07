import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrder } from "../services/api";

// Fetches one order of the logged-in user.
// status: "loading" | "ready" | "not-found" | "error"
export default function useOrder(id) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(() => {
    let isMounted = true;
    setStatus("loading");

    getOrder(id)
      .then((res) => {
        if (!isMounted) return;
        setOrder(res.data.order);
        setStatus("ready");
      })
      .catch((err) => {
        if (!isMounted) return;
        const code = err.response?.status;
        if (code === 401) {
          navigate("/login", { replace: true });
        } else if (code === 404 || code === 400) {
          setStatus("not-found");
        } else {
          setStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  useEffect(() => load(), [load]);

  return { order, status, reload: load };
}

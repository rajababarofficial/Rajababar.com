import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Har baar jab pathname (URL) change hoga, scroll upar chala jayega
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
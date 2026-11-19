import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const RequireRole = ({ allowedRoles, children, showAlert, setComp, comp }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until loading finishes
    if (loading) return;

    // Not logged in
    if (!user) {
      showAlert?.("Please login first", "error");
      navigate("/");
      return;
    }

    // User logged in but role not allowed
    if (!allowedRoles.includes(user.role)) {
      showAlert?.("Access Denied", "error");
      if (setComp && comp) {
        setComp({ [comp]: true });
      }
    }
  }, [user, loading, allowedRoles, navigate, showAlert, setComp, comp]);

  // While checking localStorage or not allowed, render nothing
  if (loading) return null;
  if (!user || !allowedRoles.includes(user.role)) return null;

  // User is logged in and allowed
  return children;
};

export default RequireRole;
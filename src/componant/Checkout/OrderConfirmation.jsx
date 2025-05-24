import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { useEffect } from "react";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  useLanguage();
  
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate("/OrderTracker");
    }, 3000);
    
    // Clean up timer on component unmount
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  const containerStyle = {
    padding: "2rem 1rem",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    textAlign: "center"
  };
  
  const headingStyle = {
    fontSize: "1.75rem",
    color: "#333",
    marginBottom: "1rem",
    fontWeight: "600"
  };
  
  const paragraphStyle = {
    fontSize: "1rem",
    color: "#6c757d"
  };

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>{t("checkout.orderPlacedSuccessfully")}</h3>
      <p style={paragraphStyle}>{t("checkout.orderId")}: {state?.orderId || t("common.notAvailable")}</p>
      <p style={paragraphStyle}>{t("checkout.redirecting")}</p>
    </div>
  );
}

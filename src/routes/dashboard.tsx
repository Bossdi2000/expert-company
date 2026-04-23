import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Disabled — Expert Invests" }] }),
  component: DashboardDisabled,
});

function DashboardDisabled() {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to home since dashboard is disabled
    navigate({ to: "/" });
  }, [navigate]);
  return null;
}

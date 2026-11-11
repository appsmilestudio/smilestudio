import { createFileRoute } from "@tanstack/react-router";
import { SmileApp } from "@/components/smile/app";

export const Route = createFileRoute("/")({
  component: SmileApp,
});

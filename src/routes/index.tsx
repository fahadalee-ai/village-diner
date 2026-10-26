import { createFileRoute } from "@tanstack/react-router";
import { DinerApp } from "@/app/DinerApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Village Diner" },
      {
        name: "description",
        content: "A Classic Neighborhood Diner in Glenside. Order breakfast and lunch for pickup.",
      },
    ],
  }),
  component: DinerApp,
});

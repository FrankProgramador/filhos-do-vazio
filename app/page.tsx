import { redirect } from "next/navigation";

// Landing page is served as a static file from /public/landing.html
// The redirect in next.config.ts handles the "/" → "/landing.html" rewrite at
// the server level, but this component acts as a safety fallback.
export default function Home() {
  redirect("/landing.html");
}

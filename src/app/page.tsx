import { cookies } from "next/headers";
import { Home } from "@/components/home";
import { OPENED_COOKIE } from "@/lib/opened";

export default async function Page() {
  // The opening was played earlier in this visit: the page is drawn open
  // from the server on, so a reload never shows the curtain first.
  const opened = (await cookies()).get(OPENED_COOKIE)?.value === "1";
  return <Home opened={opened} />;
}

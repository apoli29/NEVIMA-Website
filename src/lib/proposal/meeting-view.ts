import "server-only";
import type { MeetingView } from "@/components/meeting";
import { readMeeting } from "./meeting";
import { slotDate } from "./slots";

/** What the meeting page shows for the address it was opened at. */
export function meetingView(t: unknown, h: unknown): MeetingView {
  const meeting = readMeeting(t);
  if (!meeting) return { kind: "invalid" };
  const now = Date.now();
  return {
    kind: "ready",
    token: t as string,
    slots: meeting.slots,
    choice: h === "1" ? 1 : 0,
    past: [slotDate(meeting.slots[0]).getTime() < now, slotDate(meeting.slots[1]).getTime() < now],
  };
}

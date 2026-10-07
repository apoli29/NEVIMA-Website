import "server-only";
import type { Answers, Contact, Estimate } from "./questions";

/* ==================================================================
   Where simulations and requests go

   Not connected yet: the destination is still to be chosen (the user:
   "depois definimos isso"). Until then:

   - Each simulation is written to the server log as one JSON line,
     tagged [nevima:simulation]. It is anonymous: the answers and the
     estimate, no name, email, phone or IP.
   - A proposal request is written to the log too, but reported back as
     not delivered, so the form can tell the visitor and offer to send it
     from their own email app. Nobody is left thinking a request reached
     the studio when it did not.

   Connecting a destination means filling in deliverRequest() (and, if
   wanted, recordSimulation()) and its environment variables. Nothing
   else changes.
   ================================================================== */

export type Simulation = {
  at: string;
  answers: Answers;
  estimate: Estimate;
};

export type ProposalRequest = Simulation & { contact: Contact };

export async function recordSimulation(simulation: Simulation) {
  console.info("[nevima:simulation]", JSON.stringify(simulation));
}

/** True once the request has reached the studio. */
export async function deliverRequest(request: ProposalRequest): Promise<boolean> {
  // Logged without the contact details: the logs are not the inbox.
  console.info(
    "[nevima:request:undelivered]",
    JSON.stringify({ at: request.at, answers: request.answers, estimate: request.estimate }),
  );
  return false;
}

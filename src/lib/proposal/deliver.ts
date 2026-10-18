import "server-only";
import type { Lang } from "../i18n";
import type { PartnerAnswers } from "./partner";
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

/** With the language the visitor used the site in, to reply in it. */
export type ProposalRequest = Simulation & { contact: Contact; lang: Lang };

export async function recordSimulation(simulation: Simulation) {
  console.info("[nevima:simulation]", JSON.stringify(simulation));
}

/** True once the request has reached the studio. */
export async function deliverRequest(request: ProposalRequest): Promise<boolean> {
  // Logged without the contact details: the logs are not the inbox.
  console.info(
    "[nevima:request:undelivered]",
    JSON.stringify({ at: request.at, lang: request.lang, answers: request.answers, estimate: request.estimate }),
  );
  return false;
}

/** A development company asking to work with us on a front end. */
export type PartnerRequest = { at: string; lang: Lang; answers: PartnerAnswers; contact: Contact };

/** True once the request has reached the studio. Not connected yet,
    as above: logged without the contact details, reported back as not
    delivered so the form offers the visitor's email app. */
export async function deliverPartner(request: PartnerRequest): Promise<boolean> {
  console.info(
    "[nevima:partner:undelivered]",
    JSON.stringify({ at: request.at, lang: request.lang, answers: request.answers }),
  );
  return false;
}

"use client";

import type { ReactNode } from "react";
import { ProposalOverlay, ProposalProvider, useProposalController } from "./proposal-flow";
import { useSmoothScroll } from "./smooth-scroll";

/* A page that has no proposal overlay of its own (the service pages, set
   on the server) gets one here, so the form at its foot is a preview that
   grows into the overlay, as on the other pages (user, 2026-10-31). The
   page is held still and put out of reach while the form is out. */
export function ProposalHost({ children }: { children: ReactNode }) {
  const proposal = useProposalController();
  useSmoothScroll(proposal.present);
  return (
    <ProposalProvider value={proposal}>
      <div inert={proposal.present}>{children}</div>
      <ProposalOverlay ctl={proposal} />
    </ProposalProvider>
  );
}

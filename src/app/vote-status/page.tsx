import { Suspense } from "react";
import VoteStatus from "./vote-status";

export default function Page() {
  return (
    <Suspense>
      <VoteStatus />
    </Suspense>
  );
}

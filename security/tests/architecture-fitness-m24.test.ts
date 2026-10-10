import { describe, expect, it } from "vitest";
import {
  assertCompositionParity,
  createBrokenCompositionDriftProbe,
} from "@kivro/cloud-core";
import { createNetsonsComposition } from "@kivro/cloud-netsons";
import { createAwsComposition } from "@kivro/cloud-aws";

/** M24 architecture fitness — machine-enforced shared/provider boundaries. */
describe("M24 architecture fitness", () => {
  it("both profiles satisfy composition parity invariant", () => {
    assertCompositionParity(createNetsonsComposition(), createAwsComposition());
  });

  it("intentional composition divergence is rejected (CI drift canary)", () => {
    const broken = createBrokenCompositionDriftProbe(createAwsComposition());
    expect(() => assertCompositionParity(createNetsonsComposition(), broken)).toThrow();
  });
});

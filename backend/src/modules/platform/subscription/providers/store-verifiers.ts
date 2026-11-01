import { env } from "../../../../config/env.js";
import type { IStoreVerifier } from "../domain/IStoreVerifier.js";
import type { Store } from "../models/plan.js";
import { AppleStoreVerifier } from "./apple-store-verifier.js";
import { DevStoreVerifier } from "./dev-store-verifier.js";
import { GooglePlayVerifier } from "./google-play-verifier.js";

export function createStoreVerifiers(): Map<Store, IStoreVerifier> {
  const verifiers: IStoreVerifier[] = [new AppleStoreVerifier(), new GooglePlayVerifier()];
  if (env.devStoreEnabled) verifiers.push(new DevStoreVerifier());
  return new Map(verifiers.map((verifier) => [verifier.store, verifier]));
}

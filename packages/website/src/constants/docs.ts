/**
 * Central reference to all internal documentation links.
 * Update these when reference slugs change.
 */
export const REFERENCES = {
  projectSetup: "/01-project-setup",
  tsconfig: "/02-tsconfig",
  servicesAndLayers: "/03-services-and-layers",
  effectStyle: "/04-effect-style",
  dataTypes: "/05-data-types",
  errorHandling: "/06-error-handling",
  config: "/07-config",
} as const;

export type ReferenceKey = keyof typeof REFERENCES;

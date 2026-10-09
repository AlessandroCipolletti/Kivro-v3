/** §33 — native OpenClaw plugins are not importable into marketplace workers by default. */

export function assertNoNativePluginsInDiscovery(input: {
  nativePlugins?: string[];
  warnings?: string[];
}): { ok: true } | { ok: false; code: "NATIVE_PLUGINS_FORBIDDEN"; plugins: string[] } {
  const fromList = input.nativePlugins ?? [];
  const fromWarnings = (input.warnings ?? []).filter((w) =>
    /native\s+plugin/i.test(w),
  );
  const plugins = [...fromList, ...fromWarnings];
  if (plugins.length === 0) {
    return { ok: true };
  }
  return { ok: false, code: "NATIVE_PLUGINS_FORBIDDEN", plugins };
}

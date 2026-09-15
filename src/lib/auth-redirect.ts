export function normalizeAuthRedirect(value: string | null): string {
  if (!value) return "/";

  const redirect = value.startsWith("/") ? value : `/${value}`;
  if (redirect.startsWith("//")) return "/";

  return redirect;
}
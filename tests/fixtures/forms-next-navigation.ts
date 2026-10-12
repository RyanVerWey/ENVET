export function useRouter() {
  return {
    push(path: string) {
      window.dispatchEvent(
        new CustomEvent("synthetic-navigation", { detail: path }),
      );
    },
    replace(path: string) {
      window.dispatchEvent(
        new CustomEvent("synthetic-navigation", { detail: path }),
      );
    },
  };
}
// Header-only pathname double for local content-layout checks.
export function usePathname() {
  return "/programs";
}

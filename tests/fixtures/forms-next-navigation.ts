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

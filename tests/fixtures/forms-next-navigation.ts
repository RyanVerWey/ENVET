export function useRouter() {
  return {
    replace(path: string) {
      window.dispatchEvent(
        new CustomEvent("synthetic-navigation", { detail: path }),
      );
    },
  };
}

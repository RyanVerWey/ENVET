export function useRouter() {
  return {
    replace() {
      throw new Error(
        "Signing navigation is not mocked in this review/report fixture.",
      );
    },
  };
}

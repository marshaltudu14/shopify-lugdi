import ErrorContent from "./ErrorContent";

export const metadata = {
  title: "Error!",
  description: "An unexpected error occured.",
};

export default function Page() {
  return <ErrorContent />;
}

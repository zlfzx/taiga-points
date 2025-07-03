import {
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import Layout from "./layout";
import { Button } from "./ui/button";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Layout>
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance mb-2">
          {error.status} {error.statusText}
        </h1>
        <p className="text-muted-foreground">{error.data}</p>

        <Button variant="default" className="cursor-pointer mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Layout>
    );
  } else if (error instanceof Error) {
    return (
      <Layout>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </Layout>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

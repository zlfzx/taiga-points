import {
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import Layout from "./layout";
import { Button } from "./ui/button";

function sanitizeText(text: unknown): string {
  if (typeof text === 'string') {
    return text.replace(/[<>"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match] || match;
    });
  }
  return String(text || '');
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Layout>
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance mb-2">
          {sanitizeText(error.status)} {sanitizeText(error.statusText)}
        </h1>
        <p className="text-muted-foreground">{sanitizeText(error.data)}</p>

        <Button variant="default" className="cursor-pointer mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Layout>
    );
  } else if (error instanceof Error) {
    return (
      <Layout>
        <h1>Error</h1>
        <p>{sanitizeText(error.message)}</p>
        <p>The stack trace is:</p>
        <pre>{sanitizeText(error.stack)}</pre>
      </Layout>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

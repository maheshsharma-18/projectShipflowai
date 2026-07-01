import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@shipflow/api";
import { createAuthContext } from "@shipflow/auth";

const handler = (request: Request) => {
  const workspaceId = request.headers.get("x-shipflow-workspace") ?? new URL(request.url).searchParams.get("workspaceId");

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createAuthContext(request.headers, workspaceId)
  });
};

export { handler as GET, handler as POST };

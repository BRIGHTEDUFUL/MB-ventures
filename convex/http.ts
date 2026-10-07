import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Mount Convex Auth HTTP handlers (sign-in, sign-out, session refresh, etc.)
auth.addHttpRoutes(http);

export default http;

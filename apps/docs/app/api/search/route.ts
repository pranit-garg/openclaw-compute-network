import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

export const revalidate = false;

// Fumadocs server-side query endpoint.
// `GET` returns an array of search results for `?query=...`.
// `staticGET` exports the full index and breaks the client search UI.
export const { GET } = createFromSource(source);

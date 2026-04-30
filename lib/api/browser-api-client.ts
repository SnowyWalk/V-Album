import createFetchClient from "openapi-fetch";
import type { paths } from "./schema";
import createClient from "openapi-react-query";

export const browserFetchClient = createFetchClient<paths>({
    baseUrl: "",
});
export const browserApiClient = createClient(browserFetchClient)
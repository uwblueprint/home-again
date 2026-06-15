import { http, HttpResponse } from "msw";
import { agenciesHandlers } from "./handlers/agencies";
import { agentsHandlers } from "./handlers/agents";
import { clientsHandlers } from "./handlers/clients";
import { donationsHandlers } from "./handlers/donations";
import { donorsHandlers } from "./handlers/donors";
import { furnitureHandlers } from "./handlers/furniture";
import { referralsHandlers } from "./handlers/referrals";
import { routesHandlers } from "./handlers/routes";

const MOCK_API_URL = process.env.NEXT_PUBLIC_API_URL;

const fallbackHandler = http.all(`${MOCK_API_URL}/*`, ({ request }) => {
  console.warn(`[MSW] No handler for: ${request.method} ${request.url}`);
  return HttpResponse.json({});
});

export const handlers = [
  ...agenciesHandlers,
  ...agentsHandlers,
  ...clientsHandlers,
  ...donationsHandlers,
  ...donorsHandlers,
  ...furnitureHandlers,
  ...referralsHandlers,
  ...routesHandlers,
  fallbackHandler,
];

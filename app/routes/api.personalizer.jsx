import { json } from "@remix-run/node";
import prisma from "../db.server";

/**
 * App Proxy endpoint - serves personalizer config to the storefront.
 * Accessed via: /apps/personalizer?shop=myshop.myshopify.com
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const config = await prisma.personalizerConfig.findUnique({
    where: { shop },
  });

  const response = {
    label: config?.label || "Add your personalization",
    charLimit: config?.charLimit ?? 100,
    required: config?.required ?? false,
  };

  return json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60",
    },
  });
};

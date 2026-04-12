import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  TextField,
  Button,
  FormLayout,
  Banner,
  Checkbox,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let config = await prisma.personalizerConfig.findUnique({ where: { shop } });

  if (!config) {
    config = {
      label: "Add your personalization",
      charLimit: 100,
      required: false,
    };
  }

  return json({ config });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const data = {
    label: formData.get("label") || "Add your personalization",
    charLimit: parseInt(formData.get("charLimit")) || 100,
    required: formData.get("required") === "true",
  };

  await prisma.personalizerConfig.upsert({
    where: { shop },
    create: { shop, ...data },
    update: data,
  });

  return json({ success: true });
};

export default function SettingsPage() {
  const { config } = useLoaderData();
  const fetcher = useFetcher();
  const isSaving = fetcher.state !== "idle";

  const [label, setLabel] = useState(config.label || "");
  const [charLimit, setCharLimit] = useState(String(config.charLimit || 100));
  const [required, setRequired] = useState(config.required || false);

  return (
    <Page>
      <TitleBar title="Settings" />
      <fetcher.Form method="POST">
        <BlockStack gap="500">
          {fetcher.data?.success && (
            <Banner tone="success" title="Settings saved" />
          )}

          <Layout>
            <Layout.AnnotatedSection
              title="Personalization Prompt"
              description="Write the instructions that buyers will see on the product page. This is like Etsy's personalization — tell them what info you need."
            >
              <Card>
                <FormLayout>
                  <TextField
                    label="Personalization label"
                    name="label"
                    value={label}
                    onChange={setLabel}
                    placeholder="e.g., Enter the name you'd like engraved"
                    helpText="This text appears above the input field on the product page"
                    autoComplete="off"
                    multiline={3}
                  />
                  <TextField
                    label="Character limit"
                    name="charLimit"
                    type="number"
                    value={charLimit}
                    onChange={setCharLimit}
                    min={1}
                    max={500}
                    helpText="Maximum number of characters the buyer can enter"
                    autoComplete="off"
                  />
                  <input type="hidden" name="required" value={required ? "true" : "false"} />
                  <Checkbox
                    label="Require personalization"
                    checked={required}
                    onChange={setRequired}
                    helpText="If checked, buyer must fill in the field before adding to cart"
                  />
                </FormLayout>
              </Card>
            </Layout.AnnotatedSection>
          </Layout>

          <InlineStack align="end">
            <Button submit variant="primary" loading={isSaving}>
              Save settings
            </Button>
          </InlineStack>
        </BlockStack>
      </fetcher.Form>
    </Page>
  );
}

import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Badge,
  Banner,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Ensure the personalization metafield definition exists
  try {
    const response = await admin.graphql(`
      mutation {
        metafieldDefinitionCreate(definition: {
          name: "Personalization Prompt"
          namespace: "custom"
          key: "personalization_label"
          type: "multi_line_text_field"
          ownerType: PRODUCT
          description: "Write your personalization instructions here. If set, buyers will see a text field on the product page with this prompt."
        }) {
          createdDefinition {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `);
    const data = await response.json();
    console.log("Metafield definition:", data?.data?.metafieldDefinitionCreate?.userErrors);
  } catch (err) {
    // Definition likely already exists, that's fine
    console.log("Metafield definition already exists or error:", err.message);
  }

  return { shop };
};

export default function Index() {
  const { shop } = useLoaderData();

  return (
    <Page>
      <TitleBar title="MePersonalize" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  How to use MePersonalize
                </Text>
                <Text as="p" variant="bodyMd">
                  MePersonalize works just like Etsy — you write a personalization prompt per product,
                  and buyers fill in a text field.
                </Text>

                <BlockStack gap="300">
                  <InlineStack gap="200" align="start">
                    <Badge tone="info">Step 1</Badge>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Add personalization to a product
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Go to any product in your Shopify admin. Scroll down to the "Metafields" section
                        and find "Personalization Prompt". Write your instructions there
                        (e.g., "Enter the name you'd like engraved").
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <InlineStack gap="200" align="start">
                    <Badge tone="info">Step 2</Badge>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Add the widget to your theme
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Go to Online Store &gt; Themes &gt; Customize. Navigate to a Product page,
                        click "Add section" and select "Personalizer Widget" under Apps.
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <InlineStack gap="200" align="start">
                    <Badge tone="info">Done!</Badge>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        That's it
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Products with a personalization prompt will show a text field to buyers.
                        Products without one won't show anything. The buyer's response is saved
                        as a line item property in the order.
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  How it works
                </Text>
                <List>
                  <List.Item>
                    You write a personalization prompt per product (via metafields)
                  </List.Item>
                  <List.Item>
                    Buyers see your prompt and a text field on the product page
                  </List.Item>
                  <List.Item>
                    Their response is saved as a line item property in the order
                  </List.Item>
                  <List.Item>
                    No prompt = no personalization field shown
                  </List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

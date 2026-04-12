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
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const config = await prisma.personalizerConfig.findUnique({ where: { shop } });

  return {
    shop,
    hasConfig: !!config,
    label: config?.label || "",
  };
};

export default function Index() {
  const { shop, hasConfig, label } = useLoaderData();

  return (
    <Page>
      <TitleBar title="MePersonalize" />
      <BlockStack gap="500">
        {!hasConfig && (
          <Banner tone="warning" title="Setup Incomplete">
            <p>Complete the steps below to get personalization working on your product pages.</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Setup Checklist
                </Text>
                <BlockStack gap="300">
                  <InlineStack gap="200" align="start">
                    <Badge tone={hasConfig ? "success" : "attention"}>
                      {hasConfig ? "Done" : "Todo"}
                    </Badge>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        1. Configure your personalization prompt
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Go to Settings to write the instructions buyers will see.
                        {hasConfig && ` Current: "${label}"`}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <InlineStack gap="200" align="start">
                    <Badge tone="info">Manual</Badge>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        2. Add the widget to your theme
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Go to Online Store &gt; Themes &gt; Customize. Navigate to a Product page,
                        click "Add section" and select "Personalizer Widget" under Apps.
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
                    You write a personalization prompt (like on Etsy)
                  </List.Item>
                  <List.Item>
                    Buyers see your prompt and fill in a text field on the product page
                  </List.Item>
                  <List.Item>
                    Their response is saved as a line item property in the order
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

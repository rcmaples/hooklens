import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  Button,
  TextInput,
  Select,
  Code,
  usePrefersDark,
} from "@sanity/ui";
import { SearchIcon, CogIcon, SyncIcon } from "@sanity/icons";
import { WebhookAttemptsTable } from "./WebhookAttemptsTable";

import { useState, useCallback } from "react";
import { SettingsDialog } from "./SettingsDialog";
import { useCurrentUser, useProjects } from "@sanity/sdk-react";

// Placeholder data - this will eventually come from state managed by React Query
const attemptsData = [
  {
    messageId: "msg-2xVGmQ96Ly4eAYEE3UcPf8xg...",
    firstAttempt: "5/23/2025 11:59:45 AM",
    firstAttemptRelative: "2 days ago",
    lastAttempt: "5/23/2025 12:02:24 PM",
    lastAttemptRelative: "2 days ago",
    attempts: 13,
    status: "Failed" as const,
    issue: "502",
  },
  {
    messageId: "msg-2xUuZePuUA3dl8Zslv31klTu7Nt",
    firstAttempt: "5/23/2025 9:31:05 AM",
    firstAttemptRelative: "2 days ago",
    lastAttempt: "5/23/2025 9:31:05 AM",
    lastAttemptRelative: "2 days ago",
    attempts: 1,
    status: "Success" as const,
    issue: null,
  },
  {
    messageId: "msg-2xUuQDnVu744AM8rR9OMt5a...",
    firstAttempt: "5/23/2025 9:00:34 AM",
    firstAttemptRelative: "2 days ago",
    lastAttempt: "5/23/2025 9:31:05 AM",
    lastAttemptRelative: "2 days ago",
    attempts: 41,
    status: "Failed" as const,
    issue: "500",
  },
  {
    messageId: "msg-2xUrBrA99jXgwZN6JKoGWJ5ib...",
    firstAttempt: "5/23/2025 8:29:20 AM",
    firstAttemptRelative: "2 days ago",
    lastAttempt: "5/23/2025 9:00:23 AM",
    lastAttemptRelative: "2 days ago",
    attempts: 41,
    status: "Failed" as const,
    issue: "502",
  },
  {
    messageId: "msg-2xSdIUy7TthvhJV5jc1BRVN...",
    firstAttempt: "5/22/2025 1:35:29 PM",
    firstAttemptRelative: "3 days ago",
    lastAttempt: "5/22/2025 2:06:27 PM",
    lastAttemptRelative: "3 days ago",
    attempts: 42,
    status: "Failed" as const,
    issue: "500",
  },
];

export const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const onOpenSettings = useCallback(() => setOpen(true), []);
  const closeSettingsDialog = useCallback(() => setOpen(false), []);

  const user = useCurrentUser();
  console.log("user:");
  console.dir(user, { depth: null });

  const projects = useProjects();
  console.log("\nprojects:");
  console.dir(projects, { depth: null });

  const filteredAttempts = attemptsData;

  const webhookId = "hkURZGCTz08qhCed";
  const projectId = projects?.[0]?.id || "hzao7xsp";

  return (
    <Card
      width={"auto"}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={4}
      style={{
        height: "100vh",
        margin: "-8px",
      }}
    >
      <Stack space={4} paddingX={2}>
        {/* Header Section */}
        <Flex align="center" justify="space-between">
          <Stack space={2}>
            <Heading size={3}>Hooklens</Heading>
            <Text muted size={1}>
              Webhook monitoring for Sanity
            </Text>
          </Stack>
          <Flex gap={2}>
            <Button
              icon={CogIcon}
              text="Settings"
              mode="bleed"
              onClick={onOpenSettings}
            />
            <Button icon={SyncIcon} text="Refresh Data" tone="primary" />
          </Flex>
        </Flex>

        {open && (
          <SettingsDialog
            onClose={closeSettingsDialog}
            webhookId={webhookId || ""}
            projectId={projectId || ""}
          />
        )}

        {/* Current Settings Bar */}
        <Card radius={2} shadow={1} tone="caution" padding={4}>
          <Flex align="center" gap={2}>
            <Text size={2}>Project ID:</Text>
            <Code size={2}>{projectId}</Code>
            <Text size={2}>Webhook ID:</Text>
            <Code size={2}>{webhookId}</Code>
          </Flex>
        </Card>

        {/* Search and Filter Bar */}
        <Flex align="center" gap={3}>
          <Box flex={1}>
            <TextInput
              icon={SearchIcon}
              placeholder="Search by message ID, document ID, or hook ID..."
              fontSize={1}
              // onChange={(e) => setSearchString(e.currentTarget.value)} // Example for state update
            />
          </Box>
          <Box style={{ minWidth: "200px" }}>
            <Select
              fontSize={1}
              // onChange={(e) => setStatusFilter(e.currentTarget.value)} // Example for state update
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </Select>
          </Box>
        </Flex>

        <WebhookAttemptsTable attemptsData={filteredAttempts} />
      </Stack>
    </Card>
  );
};

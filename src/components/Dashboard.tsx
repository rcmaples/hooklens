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
  Badge,
  Spinner,
} from "@sanity/ui";
import { SearchIcon, CogIcon, SyncIcon } from "@sanity/icons";
import { WebhookAttemptsTable } from "./WebhookAttemptsTable";

import { useState, useCallback, useMemo, useEffect } from "react";
import { SettingsDialog } from "./SettingsDialog";
import { useCurrentUser, useProjects } from "@sanity/sdk-react";
import {
  processMockData,
  getMockDataSummary,
  type ProcessedAttempt,
} from "../utils/mockDataProcessor";

export const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [allAttempts, setAllAttempts] = useState<ProcessedAttempt[]>([]);
  const [summary, setSummary] = useState({
    totalMessages: 0,
    successMessages: 0,
    failedMessages: 0,
    totalAttempts: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onOpenSettings = useCallback(() => setOpen(true), []);
  const closeSettingsDialog = useCallback(() => setOpen(false), []);

  // const user = useCurrentUser();
  const projects = useProjects();

  // Load mock data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [attempts, summaryData] = await Promise.all([
          processMockData(),
          getMockDataSummary(),
        ]);
        setAllAttempts(attempts);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load webhook data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter attempts based on search and status
  const filteredAttempts = useMemo(() => {
    return allAttempts.filter((attempt) => {
      // Apply search filter
      const matchesSearch =
        searchString === "" ||
        attempt.messageId.toLowerCase().includes(searchString.toLowerCase());

      // Apply status filter
      let matchesStatus = true;
      if (statusFilter === "success") {
        matchesStatus = attempt.status === "Success";
      } else if (statusFilter === "failed") {
        matchesStatus = attempt.status === "Failed";
      }

      return matchesSearch && matchesStatus;
    });
  }, [allAttempts, searchString, statusFilter]);

  const webhookId = "hkURZGCTz08qhCed";
  const projectId = projects?.[0]?.id || "hzao7xsp";

  const handleRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Clear cache and reload
      const [attempts, summaryData] = await Promise.all([
        processMockData(),
        getMockDataSummary(),
      ]);
      setAllAttempts(attempts);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh webhook data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <Card
        width={"auto"}
        paddingLeft={2}
        paddingRight={2}
        paddingTop={4}
        style={{
          minHeight: "100vh",
          margin: "-8px",
        }}
      >
        <Stack space={4} paddingX={2}>
          <Flex align="center" justify="center" style={{ height: "50vh" }}>
            <Card padding={4} radius={2} shadow={1} tone="critical">
              <Stack space={3}>
                <Text size={2} weight="semibold" align="center">
                  Error Loading Data
                </Text>
                <Text size={1} align="center">
                  {error}
                </Text>
                <Flex justify="center">
                  <Button text="Retry" onClick={handleRefresh} tone="primary" />
                </Flex>
              </Stack>
            </Card>
          </Flex>
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      width={"auto"}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={4}
      style={{
        minHeight: "100vh",
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
            <Button
              icon={SyncIcon}
              text="Refresh Data"
              tone="primary"
              onClick={handleRefresh}
              disabled={isLoading}
            />
          </Flex>
        </Flex>

        {open && (
          <SettingsDialog
            onClose={closeSettingsDialog}
            webhookId={webhookId || ""}
            projectId={projectId || ""}
          />
        )}

        {/* Summary Statistics */}
        <Card radius={2} shadow={1} padding={4}>
          <Stack space={3}>
            <Flex align="center" justify="space-between">
              <Text size={2} weight="semibold">
                Summary
              </Text>
              {isLoading ? (
                <Spinner size={1} />
              ) : (
                <Flex gap={2}>
                  <Badge tone="positive" fontSize={1} padding={2} radius={2}>
                    {summary.successMessages} Success
                  </Badge>
                  <Badge tone="critical" fontSize={1} padding={2} radius={2}>
                    {summary.failedMessages} Failed
                  </Badge>
                </Flex>
              )}
            </Flex>
            <Flex gap={4} wrap="wrap">
              <Text size={1}>
                <strong>Total Messages:</strong>{" "}
                {isLoading ? "..." : summary.totalMessages}
              </Text>
              <Text size={1}>
                <strong>Total Attempts:</strong>{" "}
                {isLoading ? "..." : summary.totalAttempts}
              </Text>
              <Text size={1}>
                <strong>Success Rate:</strong>{" "}
                {isLoading ? "..." : `${summary.successRate}%`}
              </Text>
            </Flex>
          </Stack>
        </Card>

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
              placeholder="Search by message ID..."
              fontSize={1}
              value={searchString}
              onChange={(e) => setSearchString(e.currentTarget.value)}
              disabled={isLoading}
            />
          </Box>
          <Box style={{ minWidth: "200px" }}>
            <Select
              fontSize={1}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.currentTarget.value)}
              disabled={isLoading}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </Select>
          </Box>
          {(searchString || statusFilter !== "all") && (
            <Button
              text="Clear"
              mode="bleed"
              onClick={() => {
                setSearchString("");
                setStatusFilter("all");
              }}
              disabled={isLoading}
            />
          )}
        </Flex>

        {isLoading ? (
          <Card padding={4} radius={2} shadow={1}>
            <Flex align="center" justify="center" style={{ padding: "40px" }}>
              <Stack space={3}>
                <Flex justify="center">
                  <Spinner size={2} />
                </Flex>
                <Text size={1} muted align="center">
                  Loading webhook attempts...
                </Text>
              </Stack>
            </Flex>
          </Card>
        ) : (
          <WebhookAttemptsTable attemptsData={filteredAttempts} />
        )}
      </Stack>
    </Card>
  );
};

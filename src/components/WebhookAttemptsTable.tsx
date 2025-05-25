import { Card, Flex, Text, Box, Stack, Button, Badge } from "@sanity/ui";
import { ChevronDownIcon, ArrowUpIcon, ArrowDownIcon } from "@sanity/icons";

// Define a type for a single attempt's data
interface Attempt {
  messageId: string;
  firstAttempt: string;
  firstAttemptRelative: string;
  lastAttempt: string;
  lastAttemptRelative: string;
  attempts: number;
  status: "Success" | "Failed"; // More specific type
  issue: string | null;
}

// Define props for the WebhookAttemptsTable component
interface WebhookAttemptsTableProps {
  attemptsData: Attempt[];
}

const TableHeader = ({
  text,
  sortable,
  sortDirection,
}: {
  text: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
}) => (
  <Flex flex={1} padding={3} align="center">
    <Text weight="semibold" size={1}>
      {text}
    </Text>
    {sortable && (
      <Box marginLeft={1}>
        {sortDirection === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </Box>
    )}
  </Flex>
);

export const WebhookAttemptsTable = ({
  attemptsData,
}: WebhookAttemptsTableProps) => {
  if (!attemptsData || attemptsData.length === 0) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Text align="center">No webhook attempts to display.</Text>
      </Card>
    );
  }

  return (
    <Card radius={2} shadow={1} style={{ overflowX: "auto" }}>
      {/* Table Header */}
      <Flex
        style={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "var(--card-border-color)",
        }}
      >
        <Box style={{ width: "40px" }} padding={3}>
          <Text> </Text>
        </Box>{" "}
        {/* For expand icon */}
        <TableHeader text="Message ID" sortable sortDirection="asc" />
        <TableHeader text="First Attempt" sortable sortDirection="asc" />
        <TableHeader text="Last Attempt" sortable sortDirection="desc" />
        <TableHeader text="Attempts" sortable sortDirection="asc" />
        <TableHeader text="Status" sortable sortDirection="asc" />
        <TableHeader text="Issues" />
      </Flex>

      {/* Table Rows */}
      <Stack space={0}>
        {" "}
        {/* No space between rows, Card itself provides separation */}
        {attemptsData.map((attempt, index) => (
          <Card
            key={index}
            paddingY={0}
            paddingX={0}
            tone={attempt.status === "Failed" ? "critical" : "transparent"}
            style={{
              borderBottomWidth: index < attemptsData.length - 1 ? "1px" : "0",
              borderBottomStyle: "solid",
              borderBottomColor: "var(--card-border-color)",
            }}
          >
            <Flex align="center">
              <Flex
                align="center"
                justify="center"
                style={{ width: "40px" }}
                padding={3}
              >
                <Button mode="bleed" padding={1} icon={ChevronDownIcon} />
              </Flex>
              <Flex flex={1} padding={3} align="center">
                <Text size={1} textOverflow="ellipsis">
                  {attempt.messageId}
                </Text>
              </Flex>
              <Flex
                flex={1}
                padding={3}
                direction="column"
                align="flex-start"
                justify="center"
              >
                <Text size={1}>{attempt.firstAttempt}</Text>
                <Text size={1} muted>
                  {attempt.firstAttemptRelative}
                </Text>
              </Flex>
              <Flex
                flex={1}
                padding={3}
                direction="column"
                align="flex-start"
                justify="center"
              >
                <Text size={1}>{attempt.lastAttempt}</Text>
                <Text size={1} muted>
                  {attempt.lastAttemptRelative}
                </Text>
              </Flex>
              <Flex flex={1} padding={3} align="center">
                <Text size={1}>{attempt.attempts}</Text>
              </Flex>
              <Flex flex={1} padding={3} align="center">
                <Badge
                  tone={attempt.status === "Success" ? "positive" : "critical"}
                  fontSize={1}
                >
                  {attempt.status}
                </Badge>
              </Flex>
              <Flex flex={1} padding={3} align="center">
                {attempt.issue && (
                  <Badge tone="critical" mode="outline" fontSize={1}>
                    {attempt.issue}
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Card>
        ))}
      </Stack>
    </Card>
  );
};

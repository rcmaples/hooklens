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
  <th
    style={{
      flex: 1,
      height: "42px",
    }}
  >
    <Flex
      align="center"
      justify={
        text === "Status" || text === "Response" ? "center" : "flex-start"
      }
    >
      <Text weight="semibold" size={1}>
        {text}
      </Text>
      {sortable && sortDirection === "asc" ? (
        <ArrowUpIcon style={{ marginLeft: "4px" }} />
      ) : (
        <ArrowDownIcon style={{ marginLeft: "4px" }} />
      )}
    </Flex>
  </th>
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
    <Card radius={2} shadow={1}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {/* Table Header */}
        <thead
          style={{
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "var(--card-border-color)",
          }}
        >
          <tr>
            {/* For expand icon */}
            <th style={{ width: "40px" }}> </th>{" "}
            <TableHeader text="Message ID" sortable sortDirection="asc" />
            <TableHeader text="First Attempt" sortable sortDirection="asc" />
            <TableHeader text="Last Attempt" sortable sortDirection="desc" />
            <TableHeader text="Attempts" sortable sortDirection="asc" />
            <TableHeader text="Status" sortable sortDirection="asc" />
            <TableHeader text="Response" sortable sortDirection="asc" />
          </tr>
        </thead>

        {/* Table Rows */}
        <tbody>
          {attemptsData.map((attempt, index) => (
            <tr
              key={attempt.messageId}
              style={{
                height: "48px",

                borderBottomWidth:
                  index < attemptsData.length - 1 ? "1px" : "0",
                borderBottomStyle: "solid",
                borderBottomColor: "var(--card-border-color)",
              }}
            >
              {/* toggle */}
              <td
                style={{
                  width: "40px",
                  padding: "4px",
                  textAlign: "center",
                }}
              >
                <Button mode="bleed" padding={1} icon={ChevronDownIcon} />
              </td>

              {/* message id */}
              <td>
                <Text size={1}>{attempt.messageId}</Text>
              </td>

              {/* first attempt */}
              <td>
                <Flex
                  direction="column"
                  align="flex-start"
                  justify="center"
                  gap={2}
                >
                  <Text size={1}>{attempt.firstAttempt}</Text>
                  <Text size={1} muted>
                    {attempt.firstAttemptRelative}
                  </Text>
                </Flex>
              </td>

              {/* last attempt */}
              <td>
                <Flex
                  direction="column"
                  align="flex-start"
                  justify="center"
                  gap={2}
                >
                  <Text size={1}>{attempt.lastAttempt}</Text>
                  <Text size={1} muted>
                    {attempt.lastAttemptRelative}
                  </Text>
                </Flex>
              </td>

              {/* attempts */}
              <td>
                <Text size={1} align={"center"}>
                  {attempt.attempts}
                </Text>
              </td>

              {/* status */}
              <td
                style={{
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <Badge
                  tone={attempt.status === "Success" ? "positive" : "critical"}
                  fontSize={1}
                  padding={2}
                  radius={2}
                  style={{
                    width: "48px",
                    textAlign: "center",
                    border:
                      attempt.status === "Success"
                        ? "1px solid var(--card-badge-positive-fg-color)"
                        : "1px solid var(--card-badge-critical-fg-color)",
                  }}
                >
                  {attempt.status}
                </Badge>
              </td>

              {/* Response */}
              <td
                style={{
                  textAlign: "center",
                }}
              >
                {attempt.issue && (
                  <Badge
                    tone={
                      attempt.status === "Success" ? "positive" : "critical"
                    }
                    fontSize={1}
                    padding={2}
                    radius={2}
                    style={{
                      border:
                        attempt.status === "Success"
                          ? "1px solid var(--card-badge-positive-fg-color)"
                          : "1px solid var(--card-badge-critical-fg-color)",
                    }}
                  >
                    {attempt.issue}
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

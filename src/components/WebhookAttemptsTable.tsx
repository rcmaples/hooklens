import { Card, Flex, Text, Box, Stack, Button, Badge } from "@sanity/ui";
import {
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronUpIcon,
  ErrorOutlineIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@sanity/icons";
import { useState, useMemo } from "react";

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
  // Response code for both success and failure
  responseCode?: number;
  // Add detailed failure information
  failureDetails?: {
    resultCode: number;
    failureReason: string;
    responseBody: string;
    timestamp: string;
  };
  // Add detailed success information
  successDetails?: {
    resultCode: number;
    responseBody: string;
    timestamp: string;
  };
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

// Component for formatting response body
const ResponseBodyDisplay = ({ body }: { body: string }) => {
  try {
    // Try to parse as JSON for better formatting
    const parsed = JSON.parse(body);
    return (
      <Box
        style={{
          maxHeight: "200px",
          overflow: "auto",
          backgroundColor: "var(--card-bg-color)",
          border: "1px solid var(--card-border-color)",
          borderRadius: "4px",
          padding: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: "0 8px",
          }}
        >
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </Box>
    );
  } catch (e) {
    // If not JSON, return as plain text
    return (
      <Box
        style={{
          maxHeight: "200px",
          overflow: "auto",
          backgroundColor: "var(--card-bg-color)",
          border: "1px solid var(--card-border-color)",
          borderRadius: "4px",
          padding: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: "0 8px",
          }}
        >
          {body}
        </pre>
      </Box>
    );
  }
};

export const WebhookAttemptsTable = ({
  attemptsData,
}: WebhookAttemptsTableProps) => {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(attemptsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(() => {
    return attemptsData.slice(startIndex, endIndex);
  }, [attemptsData, startIndex, endIndex]);

  // Reset to first page when data changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [attemptsData.length, currentPage, totalPages]);

  const toggleExpand = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Clear expanded messages when changing pages
    setExpandedMessages(new Set());
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (!attemptsData || attemptsData.length === 0) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Text align="center">No webhook attempts to display.</Text>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      <Card radius={2} shadow={1}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
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
            {paginatedData.map((attempt, index) => (
              <>
                <tr
                  key={attempt.messageId}
                  style={{
                    height: "48px",
                    borderBottomWidth:
                      index < paginatedData.length - 1 ? "1px" : "0",
                    borderBottomStyle: "solid",
                    borderBottomColor: "var(--card-border-color)",
                    backgroundColor:
                      attempt.status === "Failed"
                        ? "var(--card-bg2-color)"
                        : undefined,
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
                    <Button
                      mode="bleed"
                      padding={1}
                      icon={
                        expandedMessages.has(attempt.messageId)
                          ? ChevronUpIcon
                          : ChevronDownIcon
                      }
                      onClick={() => toggleExpand(attempt.messageId)}
                    />
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
                      tone={
                        attempt.status === "Success" ? "positive" : "critical"
                      }
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
                    {(attempt.responseCode || attempt.issue) && (
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
                        {attempt.responseCode || attempt.issue}
                      </Badge>
                    )}
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedMessages.has(attempt.messageId) && (
                  <tr key={`${attempt.messageId}-expanded`}>
                    <td
                      colSpan={7}
                      style={{
                        backgroundColor: "var(--card-bg2-color)",
                        padding: "0",
                        borderBottomWidth:
                          index < paginatedData.length - 1 ? "1px" : "0",
                        borderBottomStyle: "solid",
                        borderBottomColor: "var(--card-border-color)",
                      }}
                    >
                      <Box padding={4}>
                        {attempt.status === "Failed" &&
                        attempt.failureDetails ? (
                          <Stack space={4}>
                            {/* Failure Header */}
                            <Flex align="flex-start" gap={2}>
                              <ErrorOutlineIcon
                                style={{
                                  color: "var(--card-badge-critical-fg-color)",
                                  marginTop: "2px",
                                }}
                              />
                              <Stack space={2}>
                                <Text weight="semibold" size={2}>
                                  Latest Failure Details
                                </Text>
                                <Text size={1} muted>
                                  {attempt.failureDetails.timestamp}
                                </Text>
                              </Stack>
                            </Flex>

                            {/* Failure Information Grid */}
                            <Flex gap={4} wrap="wrap">
                              <Box flex={1} style={{ minWidth: "200px" }}>
                                <Stack space={2}>
                                  <Text size={1} weight="semibold">
                                    Result Code
                                  </Text>
                                  <Badge
                                    tone={"critical"}
                                    fontSize={1}
                                    padding={2}
                                    radius={2}
                                    style={{
                                      width: "48px",
                                      textAlign: "center",
                                      border:
                                        "1px solid var(--card-badge-critical-fg-color)",
                                    }}
                                  >
                                    {attempt.failureDetails.resultCode}
                                  </Badge>
                                </Stack>
                              </Box>

                              {attempt.failureDetails.failureReason && (
                                <Box flex={1} style={{ minWidth: "200px" }}>
                                  <Stack space={2}>
                                    <Text size={1} weight="semibold">
                                      Failure Reason
                                    </Text>
                                    <Text size={1}>
                                      {attempt.failureDetails.failureReason}
                                    </Text>
                                  </Stack>
                                </Box>
                              )}
                            </Flex>

                            {/* Response Body */}
                            {attempt.failureDetails.responseBody && (
                              <Stack space={2}>
                                <Text size={1} weight="semibold">
                                  Response Body
                                </Text>
                                <ResponseBodyDisplay
                                  body={attempt.failureDetails.responseBody}
                                />
                              </Stack>
                            )}
                          </Stack>
                        ) : attempt.status === "Success" &&
                          attempt.successDetails ? (
                          <Stack space={4}>
                            {/* Success Header */}
                            <Flex align="flex-start" gap={2}>
                              <Stack space={2}>
                                <Text weight="semibold" size={2}>
                                  Latest Success Details
                                </Text>
                                <Text size={1} muted>
                                  {attempt.successDetails.timestamp}
                                </Text>
                              </Stack>
                            </Flex>

                            {/* Success Information */}
                            <Flex gap={4} wrap="wrap">
                              <Box flex={1} style={{ minWidth: "200px" }}>
                                <Stack space={2}>
                                  <Text size={1} weight="semibold">
                                    Result Code
                                  </Text>
                                  <Badge
                                    tone={"positive"}
                                    fontSize={1}
                                    padding={2}
                                    radius={2}
                                    style={{
                                      width: "48px",
                                      textAlign: "center",
                                      border:
                                        "1px solid var(--card-badge-positive-fg-color)",
                                    }}
                                  >
                                    {attempt.successDetails.resultCode}
                                  </Badge>
                                </Stack>
                              </Box>
                            </Flex>

                            {/* Response Body */}
                            {attempt.successDetails.responseBody && (
                              <Stack space={2}>
                                <Text size={1} weight="semibold">
                                  Response Body
                                </Text>
                                <ResponseBodyDisplay
                                  body={attempt.successDetails.responseBody}
                                />
                              </Stack>
                            )}
                          </Stack>
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            style={{ padding: "16px" }}
                          >
                            <Text size={1} muted>
                              No additional details available for this message.
                            </Text>
                          </Flex>
                        )}
                      </Box>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card padding={3} radius={2}>
          <Flex align="center" justify="space-between">
            {/* Page Info */}
            <Text size={1} muted>
              Showing {startIndex + 1}-{Math.min(endIndex, attemptsData.length)}{" "}
              of {attemptsData.length} results
            </Text>

            {/* Pagination Controls */}
            <Flex align="center" gap={2}>
              <Button
                icon={ChevronLeftIcon}
                text="Previous"
                mode="bleed"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                fontSize={1}
              />

              {/* Page Numbers */}
              <Flex align="center" gap={1}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      text={pageNumber.toString()}
                      mode={currentPage === pageNumber ? "default" : "bleed"}
                      tone={currentPage === pageNumber ? "primary" : undefined}
                      onClick={() => handlePageChange(pageNumber)}
                      fontSize={1}
                      padding={2}
                      style={{ minWidth: "32px" }}
                    />
                  );
                })}
              </Flex>

              <Button
                icon={ChevronRightIcon}
                text="Next"
                mode="bleed"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                fontSize={1}
              />
            </Flex>
          </Flex>
        </Card>
      )}
    </Stack>
  );
};

// Types matching the mock data structure
interface MockAttempt {
  id: string;
  projectId: string;
  inProgress: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
  messageId: string;
  hookId: string;
  isFailure: boolean;
  failureReason: string | null;
  resultCode: number;
  resultBody: string;
}

interface MockMessage {
  createdAt: string;
  projectId: string;
  dataset: string;
  failureCount: number;
  resultCode?: number;
  id: string;
  payload: string;
  status: string;
  attempts: MockAttempt[];
}

// Types for the processed data
export interface ProcessedAttempt {
  messageId: string;
  firstAttempt: string;
  firstAttemptRelative: string;
  lastAttempt: string;
  lastAttemptRelative: string;
  attempts: number;
  status: "Success" | "Failed";
  issue: string | null;
  // Response code for both success and failure
  responseCode?: number;
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

// Helper function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper function to get relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    }
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else {
    return `${diffInDays} days ago`;
  }
};

// Cache for loaded data
let cachedMessages: MockMessage[] | null = null;

// Function to load mock data
export const loadMockData = async (): Promise<MockMessage[]> => {
  if (cachedMessages) {
    return cachedMessages;
  }

  try {
    const response = await fetch("/mocks/messages.json");
    if (!response.ok) {
      throw new Error(`Failed to load messages: ${response.statusText}`);
    }
    const messages = (await response.json()) as MockMessage[];
    cachedMessages = messages;
    return messages;
  } catch (error) {
    console.error("Error loading mock data:", error);
    // Return fallback data if loading fails
    return [];
  }
};

// Main function to process mock data
export const processMockData = async (): Promise<ProcessedAttempt[]> => {
  const messages = await loadMockData();
  const processedAttempts: ProcessedAttempt[] = [];

  messages.forEach((message) => {
    if (message.attempts && message.attempts.length > 0) {
      // Sort attempts by creation date
      const sortedAttempts = [...message.attempts].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const firstAttempt = sortedAttempts[0];
      const lastAttempt = sortedAttempts[sortedAttempts.length - 1];

      // Determine overall status
      const hasFailures = sortedAttempts.some((attempt) => attempt.isFailure);
      const status: "Success" | "Failed" = hasFailures ? "Failed" : "Success";

      // Find the latest failure for details
      const latestFailure = sortedAttempts
        .filter((attempt) => attempt.isFailure)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      // Find the latest success for details
      const latestSuccess = sortedAttempts
        .filter((attempt) => !attempt.isFailure)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      // Determine issue code and response code
      let issue: string | null = null;
      let responseCode: number | undefined = undefined;

      if (status === "Failed" && latestFailure) {
        issue = latestFailure.resultCode.toString();
        responseCode = latestFailure.resultCode;
      } else if (status === "Success" && latestSuccess) {
        responseCode = latestSuccess.resultCode;
      }

      // Create failure details if there's a failure
      let failureDetails: ProcessedAttempt["failureDetails"] = undefined;
      if (latestFailure) {
        failureDetails = {
          resultCode: latestFailure.resultCode,
          failureReason: latestFailure.failureReason || "Unknown error",
          responseBody: latestFailure.resultBody,
          timestamp: formatDate(latestFailure.createdAt),
        };
      }

      // Create success details if there's a success
      let successDetails: ProcessedAttempt["successDetails"] = undefined;
      if (latestSuccess) {
        successDetails = {
          resultCode: latestSuccess.resultCode,
          responseBody: latestSuccess.resultBody,
          timestamp: formatDate(latestSuccess.createdAt),
        };
      }

      processedAttempts.push({
        messageId: message.id,
        firstAttempt: formatDate(firstAttempt.createdAt),
        firstAttemptRelative: getRelativeTime(firstAttempt.createdAt),
        lastAttempt: formatDate(lastAttempt.createdAt),
        lastAttemptRelative: getRelativeTime(lastAttempt.createdAt),
        attempts: sortedAttempts.length,
        status,
        issue,
        responseCode,
        failureDetails,
        successDetails,
      });
    }
  });

  // Sort by last attempt date (newest first)
  return processedAttempts.sort(
    (a, b) =>
      new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime()
  );
};

// Function to get summary statistics
export const getMockDataSummary = async () => {
  const processed = await processMockData();
  const totalMessages = processed.length;
  const failedMessages = processed.filter(
    (attempt) => attempt.status === "Failed"
  ).length;
  const successMessages = totalMessages - failedMessages;
  const totalAttempts = processed.reduce(
    (sum, attempt) => sum + attempt.attempts,
    0
  );

  return {
    totalMessages,
    successMessages,
    failedMessages,
    totalAttempts,
    successRate:
      totalMessages > 0
        ? Math.round((successMessages / totalMessages) * 100)
        : 0,
  };
};

import { type SanityConfig } from "@sanity/sdk";
import { SanityApp } from "@sanity/sdk-react";
import { Box, ThemeProvider, usePrefersDark } from "@sanity/ui";
import { buildTheme } from "@sanity/ui/theme";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Dashboard } from "./components/Dashboard";
import { Loading } from "./components/Loading";

const theme = buildTheme();

const queryClient = new QueryClient();

function App() {
  // apps can access many different projects or other sources of data
  const sanityConfigs: SanityConfig[] = [
    {
      projectId: "",
      dataset: "",
    },
  ];

  const prefersDark = usePrefersDark();
  const scheme = prefersDark ? "dark" : "light";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme} scheme={scheme}>
        <SanityApp config={sanityConfigs} fallback={<Loading />}>
          <Dashboard />
        </SanityApp>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

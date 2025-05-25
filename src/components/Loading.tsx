import { Flex, Spinner } from "@sanity/ui";

export const Loading = () => {
  return (
    <Flex justify="center" align="center" width="100vw" height="fill">
      <Spinner />
    </Flex>
  );
};

import { useState } from "react";
import {
  Box,
  Dialog,
  Text,
  TextInput,
  Button,
  Stack,
  Heading,
  Label,
} from "@sanity/ui";

import { EditIcon } from "@sanity/icons";

export const SettingsDialog = (props: {
  onClose: () => void;
  webhookId: string;
  projectId: string;
}) => {
  const {
    onClose,
    webhookId: initialWebhookId,
    projectId: initialProjectId,
  } = props;

  const [webhookId, setWebhookId] = useState(initialWebhookId);
  const [projectId, setProjectId] = useState(initialProjectId);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Option 1: Log individual fields
    const projectId = formData.get("project-id");
    const webhookId = formData.get("webhook-id");
    console.log({ projectId, webhookId });
  };

  return (
    <Dialog
      header={<Heading size={1}>Webhook settings</Heading>}
      id="dialog-example"
      onClose={onClose}
      onClickOutside={onClose}
      zOffset={1000}
    >
      <Box padding={4}>
        <form onSubmit={onSubmit}>
          <Stack space={4}>
            <Label htmlFor="project-id">Project ID</Label>
            <TextInput
              name="project-id"
              fontSize={3}
              onChange={(event) => setProjectId(event.currentTarget.value)}
              padding={3}
              placeholder="Project id"
              value={projectId}
              required
            />
            <Label htmlFor="webhook-id">Webhook ID</Label>
            <TextInput
              name="webhook-id"
              fontSize={3}
              onChange={(event) => setWebhookId(event.currentTarget.value)}
              padding={3}
              placeholder="Webhook id"
              value={webhookId}
              required
            />
            <Button
              icon={EditIcon}
              fontSize={1}
              mode="default"
              text="Save"
              type="submit"
            />
          </Stack>
        </form>
      </Box>
    </Dialog>
  );
};

import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

export type SqsDurableWorkConfig = {
  queueUrl: string;
  region: string;
};

export function resolveSqsDurableWorkConfig(
  env: NodeJS.ProcessEnv = process.env,
): SqsDurableWorkConfig | null {
  const queueUrl = env.AWS_SQS_DURABLE_WORK_QUEUE_URL?.trim();
  if (!queueUrl) {
    return null;
  }
  return {
    queueUrl,
    region: env.AWS_REGION?.trim() ?? "us-east-1",
  };
}

export function createSqsClient(region: string): SQSClient {
  return new SQSClient({ region });
}

export async function publishSqsDurableWorkMessage(
  client: SQSClient,
  config: SqsDurableWorkConfig,
  body: Record<string, unknown>,
): Promise<void> {
  await client.send(
    new SendMessageCommand({
      QueueUrl: config.queueUrl,
      MessageBody: JSON.stringify(body),
    }),
  );
}

export async function drainSqsDurableWorkMessages(
  client: SQSClient,
  config: SqsDurableWorkConfig,
  limit = 10,
): Promise<{ received: number; deleted: number }> {
  const res = await client.send(
    new ReceiveMessageCommand({
      QueueUrl: config.queueUrl,
      MaxNumberOfMessages: Math.min(limit, 10),
      WaitTimeSeconds: 0,
    }),
  );
  const messages = res.Messages ?? [];
  let deleted = 0;
  for (const msg of messages) {
    if (msg.ReceiptHandle) {
      await client.send(
        new DeleteMessageCommand({
          QueueUrl: config.queueUrl,
          ReceiptHandle: msg.ReceiptHandle,
        }),
      );
      deleted += 1;
    }
  }
  return { received: messages.length, deleted };
}

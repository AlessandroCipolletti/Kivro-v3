# M21 — container image for ECS/Fargate (build from repo root).
# docker build -f docs/deploy/aws/Dockerfile -t kivro-cloud-aws .

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @kivro/database exec prisma generate
RUN pnpm --filter @kivro/api run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV KIVRO_CLOUD_PROFILE=aws
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps ./apps
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
EXPOSE 3001
CMD ["node", "apps/cloud-aws/start.mjs"]

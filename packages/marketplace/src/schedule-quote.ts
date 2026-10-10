const SCHEDULE_QUOTE_TTL_MS = 3 * 60_000;

export type JobScheduleQuote = {
  capabilityId: string;
  capabilityVersionId: string;
  price: { currency: "USD"; amountMinor: number };
  executionMode: "IMMEDIATE" | "EARLIEST_AVAILABLE";
  earliestEligibleAt: string;
  estimatedDeliveryAt: string;
  estimatedDeliveryLabel: string;
  earliestExecutionLabel: string;
  quoteExpiresAt: string;
  guaranteedStart: false;
  paymentNotice: string;
};

export function buildJobScheduleQuote(input: {
  capabilityId: string;
  capabilityVersionId: string;
  amountMinor: number;
  accepting: boolean;
  nextEligibleAt?: string | null;
  estimatedDurationSeconds?: number | null;
  queueDelaySeconds?: number | null;
  timeZone?: string;
  now?: Date;
}): JobScheduleQuote | null {
  const now = input.now ?? new Date();
  const immediate = input.accepting;
  const eligible = immediate ? now : input.nextEligibleAt ? new Date(input.nextEligibleAt) : null;
  if (!eligible || Number.isNaN(eligible.getTime()) || input.amountMinor < 0) {
    return null;
  }
  const durationSeconds = Math.max(0, input.estimatedDurationSeconds ?? 0);
  const queueSeconds = Math.max(0, input.queueDelaySeconds ?? 0);
  const delivery = new Date(eligible.getTime() + (durationSeconds + queueSeconds) * 1000);
  const zone = safeTimeZone(input.timeZone);
  return {
    capabilityId: input.capabilityId,
    capabilityVersionId: input.capabilityVersionId,
    price: { currency: "USD", amountMinor: Math.floor(input.amountMinor) },
    executionMode: immediate ? "IMMEDIATE" : "EARLIEST_AVAILABLE",
    earliestEligibleAt: eligible.toISOString(),
    estimatedDeliveryAt: roundToMinute(delivery).toISOString(),
    estimatedDeliveryLabel: deliveryRangeLabel(eligible, delivery, durationSeconds, zone),
    earliestExecutionLabel: immediate
      ? "Available now"
      : `Eligible to start from ${clockLabel(eligible, zone)}`,
    quoteExpiresAt: new Date(now.getTime() + SCHEDULE_QUOTE_TTL_MS).toISOString(),
    guaranteedStart: false,
    paymentNotice: immediate
      ? "Your payment will be secured now. The job can start immediately."
      : "Your payment will be secured now. The job will execute when the capability becomes available.",
  };
}

/** §458 — eligibility is not a promise that work starts at that exact minute. */
export function earliestExecutionWording(label: string): boolean {
  return !/will start at/i.test(label);
}

export function formatBuyerLocalTime(
  iso: string,
  timeZone: string,
): { timeLabel: string; note: "Your local time" } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    timeLabel: clockLabel(date, safeTimeZone(timeZone)),
    note: "Your local time",
  };
}

export function marketplaceCardCopy(input: {
  status?: string | null;
  nextAvailableAt?: string | null;
  timeZone?: string;
  now?: Date;
}): string {
  const now = input.now ?? new Date();
  const zone = safeTimeZone(input.timeZone);
  switch (input.status) {
    case "ONLINE":
      return "Available now";
    case "BUSY":
      return "Busy";
    case "PAUSED":
      return "Temporarily paused";
    case "SECURITY_BLOCKED":
      return "Unavailable";
    case "OFFLINE":
      return "Provider offline. Next availability unknown";
    case "SCHEDULED_OFFLINE": {
      if (!input.nextAvailableAt) {
        return "Next availability unknown";
      }
      const next = new Date(input.nextAvailableAt);
      if (Number.isNaN(next.getTime())) {
        return "Next availability unknown";
      }
      const when = sameLocalDay(now, next, zone) ? "tonight" : weekdayLabel(next, zone);
      return `Available ${when} at ${hourLabel(next, zone)}`;
    }
    default:
      return "Unknown";
  }
}

function deliveryRangeLabel(eligible: Date, delivery: Date, durationSeconds: number, timeZone: string): string {
  if (durationSeconds <= 0) {
    return "Estimated result follows typical runtime once the job starts";
  }
  const bandMinutes = Math.max(5, Math.round((durationSeconds / 60) * 0.25 / 5) * 5);
  const start = new Date(delivery.getTime() - bandMinutes * 60_000);
  const end = new Date(delivery.getTime() + bandMinutes * 60_000);
  const floor = start.getTime() < eligible.getTime() ? eligible : start;
  return `Estimated result ${hourLabel(floor, timeZone)}–${hourLabel(end, timeZone)}`;
}

function roundToMinute(date: Date): Date {
  const rounded = new Date(date);
  rounded.setUTCSeconds(0, 0);
  return rounded;
}

function safeTimeZone(timeZone: string | undefined): string {
  const zone = timeZone?.trim() || "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
    return zone;
  } catch {
    return "UTC";
  }
}

function clockLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function hourLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function weekdayLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(date);
}

function sameLocalDay(a: Date, b: Date, timeZone: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(a) === fmt.format(b);
}

import { readJson } from "@/server/body";
import { fail, handleRequest } from "@/server/http";
import { conflict, validationFailed } from "@/server/problem";
import {
  createReservation,
  findConflict,
  validateReservation,
  type ReservationInput,
} from "@/server/reservations";
import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return handleRequest("reservations", request, () => {
    const itemId = new URL(request.url).searchParams.get("itemId");
    const all = getStore().reservations;
    const reservations = itemId ? all.filter((r) => r.itemId === itemId) : all;
    return { body: { reservations, total: reservations.length } };
  });
}

export function POST(request: Request): Promise<Response> {
  return handleRequest("reservations", request, async () => {
    const input = (await readJson(request)) as unknown as ReservationInput;
    const errors = validateReservation(input);
    if (Object.keys(errors).length > 0) fail(validationFailed(errors));

    const valid = input as {
      itemId: string;
      name: string;
      email: string;
      from: string;
      to: string;
      purpose: string;
    };
    const taken = findConflict(valid.itemId, valid.from, valid.to);
    if (taken) {
      fail(conflict(`The item is reserved until ${taken.to}.`, taken.to));
    }

    return { status: 201, body: createReservation(valid) };
  });
}

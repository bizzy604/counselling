import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      status: "success",
      data,
    },
    init,
  );
}

export function failure(
  code: string,
  message: string,
  status = 400,
  details?: Array<{ field: string; issue: string }>,
) {
  return NextResponse.json(
    {
      status: "error",
      code,
      message,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

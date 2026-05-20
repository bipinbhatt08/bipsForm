// packages/trpc/server/utils/api-error.ts
import  {  TRPCError } from "@trpc/server"

export class CustomError  {

  static internal(message = "Internal server error") {
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message,
    })
    }
  static badRequest(message = "Bad request") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
    })
  }

  static unAuthorized(message = "Unauthorized") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message,
    })
  }

  static conflict(message = "Conflict - User already exists") {
    throw new TRPCError({
      code: "CONFLICT",
      message,
    })
  }

  static forbidden(message = "Forbidden") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message,
    })
  }

  static notFound(message = "Not found") {
    throw new TRPCError({
      code: "NOT_FOUND",
      message,
    })
  }
}
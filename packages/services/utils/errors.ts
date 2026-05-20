// packages/trpc/server/utils/api-error.ts
import  {  TRPCError } from "@trpc/server"

export class CustomError  {

  static internal(message = "Internal server error") {
    return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message,
    })
    }
  static badRequest(message = "Bad request") {
    return new TRPCError({
      code: "BAD_REQUEST",
      message,
    })
  }

  static unAuthorized(message = "Unauthorized") {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message,
    })
  }

  static conflict(message = "Conflict - User already exists") {
    return new TRPCError({
      code: "CONFLICT",
      message,
    })
  }

  static forbidden(message = "Forbidden") {
    return new TRPCError({
      code: "FORBIDDEN",
      message,
    })
  }

  static notFound(message = "Not found") {
    return new TRPCError({
      code: "NOT_FOUND",
      message,
    })
  }
}
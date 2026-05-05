import { NextResponse } from "next/server";
import { verifyToken } from "./utils/jwtUtils.js";

export function withAuth(handler) {
  return async (request, context) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get("Authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Missing or invalid authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      // Verify token
      const result = verifyToken(token);
      if (!result.success) {
        return NextResponse.json(
          { message: result.message },
          { status: 401 }
        );
      }

      // Attach user info to request
      const request2 = new Request(request);
      request2.user = result.decoded;

      // Call the actual handler
      return handler(request2, context);
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function getAuthUser(request) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const result = verifyToken(token);

  if (!result.success) {
    return null;
  }

  return result.decoded;
}

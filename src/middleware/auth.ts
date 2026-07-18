import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const clientCache: { [url: string]: jwksClient.JwksClient } = {};

function getJwksClient(jwksUri: string) {
  if (!clientCache[jwksUri]) {
    clientCache[jwksUri] = jwksClient({
      jwksUri,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      requestHeaders: {
        apikey: process.env.SUPABASE_ANON_KEY || "",
      },
    });
  }
  return clientCache[jwksUri];
}

export function authenticateSupabaseJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedRaw = jwt.decode(token, { complete: true }) as any;
    if (!decodedRaw || !decodedRaw.header || !decodedRaw.payload) {
      return res.status(401).json({ error: "Invalid authentication token structure" });
    }

    const issuer = decodedRaw.payload.iss;
    if (!issuer || !/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/auth\/v1$/.test(issuer)) {
      return res.status(401).json({ error: "Untrusted or missing token issuer" });
    }

    const jwksUri = `${issuer}/.well-known/jwks.json`;
    const client = getJwksClient(jwksUri);

    client.getSigningKey(decodedRaw.header.kid, (err, key) => {
      if (err || !key) {
        console.error("Error fetching signing key from JWKS:", err);
        return res.status(401).json({ error: "Invalid or expired authentication token" });
      }

      const signingKey = key.getPublicKey();

      jwt.verify(token, signingKey, { algorithms: [decodedRaw.header.alg] }, (verifyErr, decoded: any) => {
        if (verifyErr || !decoded) {
          console.error("JWT verification failed:", verifyErr);
          return res.status(401).json({ error: "Invalid or expired authentication token" });
        }

        req.user = {
          id: decoded.sub,
          email: decoded.email || "",
        };

        next();
      });
    });
  } catch (err) {
    console.error("Pre-verification parsing failed:", err);
    return res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}

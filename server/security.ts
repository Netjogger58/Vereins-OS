import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === "production" ? 100 : 10000, // per window
    blockDurationMs: 60 * 60 * 1000, // 1 hour block after violation
  },
  
  // Suspicious patterns to monitor
  suspiciousPatterns: [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onload etc
    /\.\.\//, // Path traversal
    /etc\/passwd/i,
    /\/bin\/bash/i,
    /cmd\.exe/i,
    /powershell/i,
    /admin\/login/i, // Brute force attempts
    /wp-login/i,
    /\.env$/i,
    /config\.php/i,
    /\.git\//i,
  ],
  
  // High-risk paths that need monitoring
  sensitivePaths: [
    "/api/auth/login",
    "/api/import",
    "/api/users",
    "/api/members/delete",
    "/api/finance",
  ],
};

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>();

// Get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

// Check for suspicious patterns
function detectThreat(req: Request): { isThreat: boolean; reason: string } {
  const url = req.url || "";
  const body = JSON.stringify(req.body || {});
  const userAgent = req.headers["user-agent"] || "";
  
  // Check URL and body for suspicious patterns
  for (const pattern of SECURITY_CONFIG.suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      return { isThreat: true, reason: `Pattern match: ${pattern.source}` };
    }
  }
  
  // Check for missing user-agent (often bots)
  if (!userAgent || userAgent.length < 10) {
    return { isThreat: true, reason: "Missing or suspicious User-Agent" };
  }
  
  // Check for automated tools
  const botSignatures = ["sqlmap", "nikto", "nmap", "masscan", "zgrab", "gobuster", "dirb"];
  const ua = userAgent.toLowerCase();
  for (const bot of botSignatures) {
    if (ua.includes(bot)) {
      return { isThreat: true, reason: `Known attack tool: ${bot}` };
    }
  }
  
  return { isThreat: false, reason: "" };
}

// Rate limiting middleware
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip rate limiting for static assets, Vite HMR, and non-API routes in development
  if (req.path.startsWith("/@") || req.path.startsWith("/node_modules") || req.path.startsWith("/src") || req.path.includes("__vite")) {
    return next();
  }

  const ip = getClientIP(req);
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Get or create entry
  let entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + SECURITY_CONFIG.rateLimit.windowMs,
      blocked: false,
    };
  }
  
  // Check if blocked
  if (entry.blocked) {
    if (now < entry.resetTime) {
      // Log blocked attempt
      logSecurityEvent({
        type: "RATE_LIMIT_BLOCKED",
        ip,
        path: req.path,
        method: req.method,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
        details: "Request from blocked IP",
      });
      
      return res.status(429).json({ 
        message: "Zu viele Anfragen. Bitte später erneut versuchen.",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }
    // Reset block
    entry.blocked = false;
    entry.count = 0;
    entry.resetTime = now + SECURITY_CONFIG.rateLimit.windowMs;
  }
  
  // Increment counter
  entry.count++;
  
  // Block if exceeded
  if (entry.count > SECURITY_CONFIG.rateLimit.maxRequests) {
    entry.blocked = true;
    entry.resetTime = now + SECURITY_CONFIG.rateLimit.blockDurationMs;
    
    // Log security event
    logSecurityEvent({
      type: "RATE_LIMIT_EXCEEDED",
      ip,
      path: req.path,
      method: req.method,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
      details: `Exceeded ${SECURITY_CONFIG.rateLimit.maxRequests} requests in window`,
    });
    
    return res.status(429).json({ 
      message: "Zu viele Anfragen. IP wurde temporär blockiert.",
      blocked: true,
    });
  }
  
  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", SECURITY_CONFIG.rateLimit.maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, SECURITY_CONFIG.rateLimit.maxRequests - entry.count));
  res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));
  
  rateLimitStore.set(ip, entry);
  next();
}

// Erzwinge HTTPS in Produktion (hinter Reverse-Proxy via x-forwarded-proto).
// Kann mit DISABLE_HTTPS_REDIRECT=true deaktiviert werden (z.B. vor SSL-Einrichtung).
export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  if (process.env.DISABLE_HTTPS_REDIRECT === "true") return next();
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Strict transport security (HTTPS only)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  
  // Content Security Policy
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self'; " +
    "connect-src 'self';"
  );
  
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions policy
  res.setHeader("Permissions-Policy", 
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
  );
  
  next();
}

// Threat detection middleware
export function threatDetection(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIP(req);
  const path = req.path;
  
  // Skip health checks
  if (path === "/api/health") {
    return next();
  }
  
  // Detect threats
  const threat = detectThreat(req);
  
  if (threat.isThreat) {
    // Log immediately
    logSecurityEvent({
      type: "THREAT_DETECTED",
      ip,
      path,
      method: req.method,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
      details: threat.reason,
      severity: "HIGH",
    });
    
    // Return generic error (don't reveal security measures)
    return res.status(400).json({ message: "Ungültige Anfrage" });
  }
  
  // Log sensitive path access
  if (SECURITY_CONFIG.sensitivePaths.some(p => path.includes(p))) {
    logSecurityEvent({
      type: "SENSITIVE_ACCESS",
      ip,
      path,
      method: req.method,
      userAgent: req.headers["user-agent"],
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
      severity: "MEDIUM",
    });
  }
  
  // Override res.json to capture responses for audit
  const originalJson = res.json.bind(res);
  res.json = function(body: any) {
    // Log failed auth attempts
    if (path === "/api/auth/login" && body && !body._token) {
      logSecurityEvent({
        type: "AUTH_FAILURE",
        ip,
        path,
        method: req.method,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
        details: "Failed login attempt",
        severity: "MEDIUM",
      });
    }
    
    return originalJson(body);
  };
  
  next();
}

// Audit log function (prepares for email notifications)
interface SecurityEvent {
  type: string;
  ip: string;
  path: string;
  method: string;
  userAgent?: string | string[];
  userId?: number;
  timestamp: string;
  details?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

async function logSecurityEvent(event: SecurityEvent) {
  try {
    // Store in database
    await storage.createAuditLog?.({
      eventType: event.type,
      ipAddress: event.ip,
      path: event.path,
      method: event.method,
      userId: event.userId,
      userAgent: Array.isArray(event.userAgent) ? event.userAgent[0] : event.userAgent,
      details: event.details,
      severity: event.severity || "LOW",
      timestamp: event.timestamp,
    });
    
    // Console warning for immediate visibility
    if (event.severity === "HIGH" || event.severity === "CRITICAL") {
      console.warn(`🚨 SECURITY ALERT [${event.type}] from ${event.ip}: ${event.details}`);
    }
    
    // TODO: Email notification system (prepared but not active)
    // if (process.env.EMAIL_ALERTS_ENABLED === "true" && (event.severity === "HIGH" || event.severity === "CRITICAL")) {
    //   await sendSecurityAlertEmail(event);
    // }
  } catch (err) {
    console.error("Failed to log security event:", err);
  }
}

// Health check endpoint
export function setupSecurityRoutes(app: Express) {
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      security: {
        rateLimitEnabled: true,
        threatDetectionEnabled: true,
        auditLogEnabled: true,
        emailAlertsConfigured: !!process.env.EMAIL_SMTP_HOST,
      },
    });
  });
}

// Setup all security middleware
export function setupSecurity(app: Express) {
  // HTTPS erzwingen (Produktion)
  app.use(enforceHttps);

  // Apply security headers
  app.use(securityHeaders);
  
  // Apply rate limiting
  app.use(rateLimitMiddleware);
  
  // Apply threat detection
  app.use(threatDetection);
  
  // Setup routes
  setupSecurityRoutes(app);
  
  console.log("🔒 Security middleware initialized");
  console.log("   - Rate limiting: 100 req/15min per IP");
  console.log("   - Threat detection: Active");
  console.log("   - Security headers: Enabled");
  console.log("   - Audit logging: Enabled (email alerts prepared)");
}

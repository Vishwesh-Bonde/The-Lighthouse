
const store = new Map();

function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 60 * 1000; 
  const max = options.max || 10; 

  return (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `${ip}:${req.path}`;
      const now = Date.now();
      const entry = store.get(key) || [];

      // prune old timestamps
      const recent = entry.filter((ts) => now - ts < windowMs);
      recent.push(now);
      store.set(key, recent);

      if (recent.length > max) {
        const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ success: false, error: `Too many requests. Try again in ${retryAfter} seconds.` });
      }

      next();
    } catch (err) {
      next();
    }
  };
}

module.exports = rateLimiter;

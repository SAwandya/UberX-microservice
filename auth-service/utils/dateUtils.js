// FIX 3: Added 'expire' parameter to the function signature
exports.convertDate = (expire) => {
  let expiresAt;

  if (typeof expire === "string") {
    // Extract the numeric value and unit
    const match = expire.match(/^(\d+)([smhdwy])$/);

    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      const now = new Date();

      // Calculate expiration based on unit
      switch (unit) {
        case "s": // seconds
          expiresAt = new Date(now.getTime() + value * 1000);
          break;
        case "m": // minutes
          expiresAt = new Date(now.getTime() + value * 60 * 1000);
          break;
        case "h": // hours
          expiresAt = new Date(now.getTime() + value * 60 * 60 * 1000);
          break;
        case "d": // days
          expiresAt = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
          break;
        case "w": // weeks
          expiresAt = new Date(
            now.getTime() + value * 7 * 24 * 60 * 60 * 1000
          );
          break;
        case "y": // years (approximate)
          expiresAt = new Date(
            now.getTime() + value * 365 * 24 * 60 * 60 * 1000
          );
          break;
        default:
          // Default to parsing the string if format unknown, or 7 days if invalid
          try {
            expiresAt = new Date(Date.now() + require('ms')(expire)); // Use ms library if available or implement custom parsing
          } catch (e) {
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days if string is invalid
          }
      }
    } else {
      // If the format doesn't match, default to 7 days
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  } else if (typeof expire === "number") {
    // If expire is already a number, assume it's milliseconds from now
    expiresAt = new Date(Date.now() + expire);
    // Or if you intend numbers to be days:
    // expiresAt = new Date(Date.now() + expire * 24 * 60 * 60 * 1000);
  } else {
    // Default fallback
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  // Ensure expiresAt is a valid Date object before returning
  if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
    console.error("Failed to calculate expiresAt, defaulting to 7 days.");
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }


  // Format for MySQL TIMESTAMP
  // return expiresAt.toISOString().slice(0, 19).replace('T', ' ');
  // Or just return the Date object if your DB driver handles it
  return expiresAt;
}
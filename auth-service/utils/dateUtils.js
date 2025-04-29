exports.convertDate = (expire) => {
  let expiresAt;

  if (typeof expire === "string") {
    const match = expire.match(/^(\d+)([smhdwy])$/);

    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      const now = new Date();

      switch (unit) {
        case "s":
          expiresAt = new Date(now.getTime() + value * 1000);
          break;
        case "m":
          expiresAt = new Date(now.getTime() + value * 60 * 1000);
          break;
        case "h":
          expiresAt = new Date(now.getTime() + value * 60 * 60 * 1000);
          break;
        case "d":
          expiresAt = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
          break;
        case "w":
          expiresAt = new Date(
            now.getTime() + value * 7 * 24 * 60 * 60 * 1000
          );
          break;
        case "y":
          expiresAt = new Date(
            now.getTime() + value * 365 * 24 * 60 * 60 * 1000
          );
          break;
        default:
          try {
            expiresAt = new Date(Date.now() + require('ms')(expire));
          } catch (e) {
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          }
      }
    } else {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  } else if (typeof expire === "number") {
    expiresAt = new Date(Date.now() + expire);
  } else {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
    console.error("Failed to calculate expiresAt, defaulting to 7 days.");
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  return expiresAt;
}
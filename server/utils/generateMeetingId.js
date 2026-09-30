const crypto = require('crypto');

/**
 * Generate a clean, memorable meeting ID in format 'xxx-yyyy-zzz'
 * e.g. "sky-nova-942" or "omni-7bf4-31a"
 */
const generateMeetingId = (prefix = '') => {
  const segment1 = prefix ? prefix.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4) : crypto.randomBytes(2).toString('hex');
  const segment2 = crypto.randomBytes(2).toString('hex');
  const segment3 = crypto.randomBytes(2).toString('hex');
  return `${segment1}-${segment2}-${segment3}`;
};

module.exports = {
  generateMeetingId,
};

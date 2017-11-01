function parseVersion(str) {
  let parts = str.split(".");
  let major = parseInt(parts[0], 10);
  let minor = parseInt(parts[1], 10);
  let patch = parseInt(parts[2], 10);
  return { major, minor, patch };
}

module.exports = parseVersion;

const pino = require("pino");

module.exports = (level) => {
  return pino({
    level,
    name: process.env.FUNC_NAME,
  });
};

const chalk = {
  blue: (t) => `\x1b[34m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  gray: (t) => `\x1b[90m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
};

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (msg, ...args) => {
    console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.blue('[INFO]')} ${msg}`, ...args);
  },
  success: (msg, ...args) => {
    console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.green('[SUCCESS]')} ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.yellow('[WARN]')} ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.red('[ERROR]')} ${msg}`, ...args);
  },
  socket: (msg, ...args) => {
    console.log(`${chalk.gray(`[${getTimestamp()}]`)} ${chalk.cyan('[SOCKET]')} ${msg}`, ...args);
  }
};

module.exports = logger;

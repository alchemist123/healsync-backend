const getLastToken = require('../../patiant/lib/token.last');

const generatePatientToken = async () => {
  const lastToken = await getLastToken();

  let nextNumber = 1;

  if (lastToken) {
    const lastValue = lastToken.token.split('-')[1];
    nextNumber = parseInt(lastValue, 10) + 1;
  }

  const padded = String(nextNumber).padStart(3, '0');

  return `HY-${padded}`;
};

module.exports = {
  generatePatientToken,
};

exports.capitalizeToLowerCaseWithDelimitier = (string, delimiter = '-') => {
    const [first, ...rest] = string.split(delimiter);
    return [first.toLowerCase(), ...rest].join('');
};

module.exports = exports;
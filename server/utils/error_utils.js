const errorUtils = {
  toJson(error) {
    const alt = {};

    Object.getOwnPropertyNames(error).forEach((key) => {
      alt[key] = error[key];
    });

    return alt;
  },
};

module.exports = errorUtils;

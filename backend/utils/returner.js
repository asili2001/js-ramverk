/**
   * Ensures a structured return!
   * @param {Response} res - Express Response
   * @param {"success"|"error"} type - type of the return, if it went good or bad
   * @param {number} code - The HTTP status code of the response
   * @param {unknown} data - Data to be returned
   * @param {string} message - A message
   * @returns {void}
   */
const returner = (
    res,
    type,
    code,
    data,
    message
) => {
    return res.status(code).json({
        type,
        code,
        data,
        message,
    });
};

export default returner;

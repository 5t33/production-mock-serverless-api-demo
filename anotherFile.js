const { ApiError } = require('./utils');

module.exports.functionThatRejectsWith400 = () => Promise.reject(new ApiError(400, ["wow you messed up, huh?", "Looks like somebody didn't read the documentation."]))

module.exports.functionThatRejects = () => Promise.reject(new Error("Oh No"))

module.exports.functionThatResolves = () => Promise.resolve({so: "much", data: "wow"})
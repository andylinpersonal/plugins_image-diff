/**
 * @fileoverview Defines externally defined symbols that the JS Closure compiler
 * must be aware of: 1. Don't complain about "is undeclared". 2. Don't rename.
 *
 * @externs
 */

/**
 * resemblejs uses the nodejs require fuction without declaring it
 *
 * @param {string} id
 * @return {*}
 */
function require(id) {}

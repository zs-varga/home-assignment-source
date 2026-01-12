/**
 * Read-Only State Wrapper
 * Prevents direct mutations of state objects, enforcing immutability
 */

/**
 * Creates a read-only proxy of the given data
 * Prevents modifications and logs attempts to tamper with the state
 * @param {any} data - The data to make read-only
 * @param {string} _name - Optional name for logging purposes
 * @returns {Proxy} - A read-only proxy of the data
 */
export function createReadOnlyState(data, _name = 'state') {
  return new Proxy(data, {
    set(_target, _property, _value) {
      return false // Reject the assignment
    },
    deleteProperty(_target, _property) {
      return false // Reject the deletion
    },
    defineProperty(_target, _property, _descriptor) {
      return false // Reject the property definition
    }
  })
}

/**
 * Create a deeply frozen object (immutable)
 * More restrictive than read-only proxy - actually freezes the object
 * @param {any} obj - The object to freeze
 * @returns {any} - The frozen object
 */
export function deepFreeze(obj) {
  Object.freeze(obj)

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop])
    }
  })

  return obj
}

/**
 * Create a shallow frozen object (only top level is immutable)
 * Lighter weight than deep freeze
 * @param {object} obj - The object to freeze
 * @returns {object} - The frozen object
 */
export function shallowFreeze(obj) {
  return Object.freeze(obj)
}

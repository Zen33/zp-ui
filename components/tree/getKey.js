export default {
  methods: {
    getKey (node) {
      const NODE_KEY = '$$nodeKey'
      !node[NODE_KEY] && Object.defineProperty(node, NODE_KEY, {
        value: `${Math.random().toString(36).substr(2, 9)}`,
        enumerable: false,
        configurable: false,
        writable: false
      })
      return node[NODE_KEY]
    }
  }
}

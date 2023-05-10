Macro.add('initItems', {
  tags: null,
  handler: function () {
    const categories = this.args[0];

    for (const category in categories) {
      if (!State.variables.items.hasOwnProperty(category)) {
        State.variables.items[category] = [];
      }

      categories[category].forEach(item => {
        State.variables.items[category].push({
          name: item.name,
          description: item.description
        });
      });
    }
  }
});

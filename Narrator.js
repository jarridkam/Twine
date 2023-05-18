// Story JavaScript
window.Narrator = class {
  constructor(text) {
    this.text = text;
  }

  display() {
    const box = document.createElement('div');
    box.className = 'narrator-box';
    box.innerHTML = this.text;
    return box.outerHTML;
  }
};

Macro.add('narratorOption', {
    handler() {
        const options = this.args[0];
        if (Array.isArray(options)) {
            options.forEach(option => {
                if (option.text && option.link) {
                    this.output.append(Engine.createLink(this.output, option.link, option.text));
                }
            });
        } else {
            throw new Error('narratorOption requires an array of objects');
        }
    }
});

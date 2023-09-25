$(document).on(':passagerender', function() {
    // Always show the sidebar
    $("#ui-bar-toggle").hide();
    $("#ui-bar-body").addClass("enabled").removeClass("disabled");
});

/////////////// -Character- ///////////////

Macro.add("character", {
  handler: function () {
    const characterName = this.args[0];
    const characterImage = this.args[1];
    const characterFaction = this.args[2] || "none";

    // Save the character data in State.variables
    State.variables.character = {
      name: characterName,
      image: characterImage,
      faction: characterFaction,
    };
  },
});

function getNestedVar(variable) {
  const parts = variable.split('.');
  let obj = State.variables;

  for (let part of parts) {
    if (obj.hasOwnProperty(part)) {
      obj = obj[part];
    } else {
      return undefined;
    }
  }

  return obj;
}


    
/////////////// -Dialog- ///////////////
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />');

function evaluateCondition(condition) {
  if (!condition) return true;

  const [attributeOrSkill, operator, value] = condition.split(/\s+/);
  const actualValue = attributeOrSkill.includes(".") ? 
                      eval("State.variables." + attributeOrSkill) : 
                      (State.variables.attributes[attributeOrSkill] || State.variables.skills[attributeOrSkill]);

  switch (operator) {
    case ">":
      return actualValue > Number(value);
    case ">=":
      return actualValue >= Number(value);
    case "<":
      return actualValue < Number(value);
    case "<=":
      return actualValue <= Number(value);
    case "==":
      return actualValue == Number(value);
    case "!=":
      return actualValue != Number(value);
    default:
      console.error("Invalid operator in condition:", operator);
      return false;
  }
}

Macro.add('dialog', {
  handler: function () {
    if (!this.args.length) {
      return this.error('No dialog options provided');
    }

    let responseSegments = [];
    let currentSegment = 0;
    let selectedIndex = -1;

    const dialogOptions = this.args[0];
    const character = dialogOptions.char;
    const items = dialogOptions.items;
    const greetings = dialogOptions.greetings || [];
    const goodbyes = dialogOptions.goodbyes || [];

    function getGreeting(greetings) {
      if (!State.variables.stats) {
        State.variables.stats = {};
      }

      let selectedGreeting = '';
      let maxPriority = -1;

      greetings.forEach((greeting) => {
        let showGreeting = true;

        if (greeting.condition) {
          const conditionFunction = new Function('stats', 'return ' + greeting.condition);
          showGreeting = conditionFunction(State.variables.stats);
        }

        if (showGreeting && (maxPriority === -1 || greeting.priority > maxPriority)) {
          selectedGreeting = greeting.text;
          maxPriority = greeting.priority;
        }
      });

      return selectedGreeting;
    }

    function goBackToPreviousPassage() {
      Engine.backward();
    }

    function getGoodbye(goodbyes) {
      if (!State.variables.stats) {
        State.variables.stats = {};
      }

      let selectedGoodbye = '';
      let maxPriority = -1;

      goodbyes.forEach((goodbye) => {
        let showGoodbye = true;

        if (goodbye.condition) {
          const conditionFunction = new Function('stats', 'return ' + goodbye.condition);
          showGoodbye = conditionFunction(State.variables.stats);
        }

        if (showGoodbye && (maxPriority === -1 || goodbye.priority > maxPriority)) {
          selectedGoodbye = goodbye.text;
          maxPriority = goodbye.priority;
        }
      });

      return selectedGoodbye;
    }

    function modifyReputation(faction, operation, amount) {
      if (!State.variables.reputation) {
        State.variables.reputation = {};
      }
      if (State.variables.reputation.hasOwnProperty(faction)) {
        switch (operation) {
          case '+':
            State.variables.reputation[faction] += amount;
            break;
          case '-':
            State.variables.reputation[faction] -= amount;
            break;
          case '=':
            State.variables.reputation[faction] = amount;
            break;
          default:
            console.error("Invalid operation:", operation);
        }
        updateReputationDisplay();
      } else {
        console.error("Faction not found:", faction);
      }
      displayReputationChangeNotification(faction, operation, amount);
    }

    function updateReputationDisplay() {
      if (!State.variables.reputation) {
        State.variables.reputation = {};
      }
      const reputationDisplay = $('#reputationDisplay');
      reputationDisplay.html('');

      const reputationHTML = Object.entries(State.variables.reputation)
        .map(([faction, reputation]) => {
          return `<div class="reputation-row">
                    <div class="reputation-faction">${faction}</div>
                    <div class="reputation-value">${reputation}</div>
                  </div>`;
        }).join('');
      reputationDisplay.html(reputationHTML);
    }

    updateReputationDisplay();

    const greetingText = getGreeting(greetings);

    const characterName = document.createElement('div');
    characterName.className = 'character-name';
    characterName.textContent = character.name;

    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'dialog-container';

    const dialogImageContainer = document.createElement('div');
    dialogImageContainer.className = 'dialog-image-container';
    const characterImage = document.createElement('img');
    characterImage.className = 'character-image';
    characterImage.src = character.image;
    characterImage.alt = 'Character image';
    dialogImageContainer.appendChild(characterImage);

    const dialogTextContainer = document.createElement('div');
    dialogTextContainer.className = 'dialog-text-container';
    const dialogTextWrapper = document.createElement('div');
    dialogTextWrapper.className = 'dialog-text-wrapper';

    const dialogGreeting = document.createElement('div');
    dialogGreeting.className = 'dialog-greeting';
    dialogGreeting.textContent = greetingText;
    dialogTextWrapper.appendChild(dialogGreeting);

    const dialogResponse = document.createElement('div');
    dialogResponse.className = 'dialog-response';
    dialogTextWrapper.appendChild(dialogResponse);
    dialogTextContainer.appendChild(dialogTextWrapper);
    dialogContainer.appendChild(dialogImageContainer);
    dialogContainer.appendChild(dialogTextContainer);

    this.output.appendChild(dialogContainer);
    this.output.insertBefore(characterName, dialogContainer);

    const dialogOptionsList = document.createElement('ul');
    dialogOptionsList.className = 'dialog-options';

    const moreButton = document.createElement('button');
    moreButton.className = 'more-button';
    moreButton.textContent = '--->';
    moreButton.style.display = 'none';
    dialogTextContainer.appendChild(moreButton);

    function updateDialogOptions(options) {
      dialogOptionsList.innerHTML = '';

      options.forEach((item, index) => {
        let showOption = evaluateCondition(item.condition);

        if (showOption) {
          const listItem = document.createElement('li');
          const button = document.createElement('button');

          if (item.condition) {
            const iconElement = document.createElement('i');
            if (item.condition.includes('stats.strength')) {
              iconElement.className = 'fas fa-dumbbell';
            } else if (item.condition.includes('stats.intelligence')) {
              iconElement.className = 'fas fa-brain';
            } else {
              iconElement.className = 'fas fa-question';
            }
            button.appendChild(iconElement);
          }

          const buttonText = document.createElement('span');
          buttonText.textContent = item.text;
          button.appendChild(buttonText);

          button.addEventListener('click', () => {
            selectedIndex = index;
            currentSegment = 0;
            responseSegments[index] = processResponseText(item.response);

            if (item.action === 'set new options') {
              dialogGreeting.style.display = 'none';
              dialogResponse.style.display = 'block';
              dialogResponse.textContent = responseSegments[index][currentSegment];

              if (responseSegments[index].length > 1) {
                moreButton.style.display = 'block';
              } else {
                moreButton.style.display = 'none';
              }
              updateDialogOptions(item.newOptions);
            } else if (item.action === 'return to original options') {
              dialogGreeting.style.display = 'none';
              dialogResponse.style.display = 'block';
              dialogResponse.textContent = responseSegments[index][currentSegment];

              if (responseSegments[index].length > 1) {
                moreButton.style.display = 'block';
              } else {
                moreButton.style.display = 'none';
              }

              updateDialogOptions(dialogOptions.items);
            } else if (item.action === 'goodbye') {
              const goodbyeText = getGoodbye(goodbyes);
              dialogGreeting.style.display = 'none';
              dialogResponse.style.display = 'block';
              dialogResponse.textContent = goodbyeText;
            } else if (item.action === 'add option' && !item.optionAdded) {
              const newItem = item.newOption;
              options.splice(index, 0, newItem);
              item.optionAdded = true;
              updateDialogOptions(options);
            } else if (item.action === 'remove option') {
              options.splice(index, 1);
              updateDialogOptions(options);
            } else if (item.action === 'replace option') {
              const newItem = item.newOption;
              options.splice(index, 1, newItem);
              updateDialogOptions(options);
            } else if (item.action === 'addItem') {
              const addItemName = item.itemName;
              const addItemQuantity = item.itemQuantity || 1;
              const addItemResult = window.addItemToInventory(addItemName, addItemQuantity);
              dialogGreeting.style.display = 'none';
              dialogResponse.style.display = 'block';
              dialogResponse.textContent = addItemResult;
            } else if (item.action === 'modify reputation') {
              const faction = item.faction;
              const operation = item.operation;
              const value = item.value;
              modifyReputation(faction, operation, value);

              dialogGreeting.style.display = 'none';
              dialogResponse.style.display = 'block';
              dialogResponse.textContent = responseSegments[index][currentSegment];

              if (responseSegments[index].length > 1) {
                moreButton.style.display = 'block';
              } else {
                moreButton.style.display = 'none';
              }
            } else {
              dialogGreeting.style.display = 'none';
              dialogResponse.style.display = 'block';
              dialogResponse.textContent = responseSegments[index][currentSegment];

              if (responseSegments[index].length > 1) {
                moreButton.style.display = 'block';
              } else {
                moreButton.style.display = 'none';
              }
            }
          });

          listItem.appendChild(button);
          dialogOptionsList.appendChild(listItem);
        }
      });

      moreButton.addEventListener('click', () => {
        currentSegment++;

        if (responseSegments[selectedIndex][currentSegment]) {
          dialogResponse.textContent = responseSegments[selectedIndex][currentSegment];
        }

        if (!responseSegments[selectedIndex][currentSegment + 1]) {
          moreButton.style.display = 'none';
        }
      });

      addGoodbyeOption();
    }

    function addGoodbyeOption() {
      const goodbyeText = getGoodbye(goodbyes);
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      button.classList.add("no-icon");
      button.textContent = goodbyeText;

      button.addEventListener('click', () => {
        dialogGreeting.style.display = 'none';
        dialogResponse.style.display = 'block';
        dialogResponse.textContent = goodbyeText;
        dialogOptionsList.innerHTML = '';

        const backListItem = document.createElement('li');
        const backButton = document.createElement('button');
        backButton.textContent = '<---';

        backButton.addEventListener('click', () => {
          goBackToPreviousPassage();
        });

        backListItem.appendChild(backButton);
        dialogOptionsList.appendChild(backListItem);
      });

      listItem.appendChild(button);
      dialogOptionsList.appendChild(listItem);
    }

    updateDialogOptions(dialogOptions.items);

    this.output.appendChild(dialogOptionsList);
  },
});

function processResponseText(text) {
  if (!text) {
    return [''];
  }

  return text.split('::');
}

function displayReputationChangeNotification(faction, operation, amount) {
    // Create the notification element
    const notification = document.createElement('div');
    notification.id = 'reputationChangeNotification';
    notification.textContent = `${faction} Reputation ${operation}${amount}`;

    // Add the appropriate class for positive or negative changes
    if (amount > 0) {
        notification.classList.add('positive');
    } else {
        notification.classList.add('negative');
    }

    // Append the notification to the body
    document.body.appendChild(notification);

    // Slide the notification into view
    setTimeout(() => {
        notification.style.right = '10px';
    }, 50);

    // After 3 seconds, slide the notification out and then remove it
    setTimeout(() => {
        notification.style.right = '-300px';
        setTimeout(() => {
            notification.remove();
        }, 500); // This should match the transition duration in the CSS
    }, 3000);
}


/////////////// -Inventory- ////////////////

// Load jQuery UI
$.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', function() {
  $(document).ready(function() {
    // Add the custom button to the sidebar
    $('<li id="customButton" class="link-internal">Custom Button</li>').appendTo('#menu');

   // Add the custom modal
$('body').append('<div id="customModal" class="modal" style="display:none;">' +
  '<div class="modal-content">' +
    '<div class="modal-header">' +
      '<h3>Custom Modal Window</h3>' +
      '<div class="tab">' +
        '<button class="tablinks" id="characterTab">Character</button>' +
        '<button class="tablinks" id="inventoryTab">Inventory</button>' +
      '</div>' +
    '</div>' +
    '<div id="Character" class="tabcontent">' +
      '<div class="level-container">' +
        '<div class="level-info">Level: <span id="levelDisplay"></span></div>' +
        '<div class="level-bar"></div>' +
        '<div class="level-info">Exp To Next Level: <span id="experiencetonextLevelDisplay"></span></div>' +
      '</div>' +
      '<div class="attribute-skill-container">' +
        '<div class="attribute-box">' +
          '<h4 class="box-title">Attributes</h4>' +
          '<div id="attributesDisplay" class="attributes-content"></div>' +
        '</div>' +
        '<div class="skill-box">' +
          '<h4 class="box-title">Skills</h4>' +
          '<div id="skillsDisplay" class="skills-content"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div id="Inventory" class="tabcontent" style="display:none;">' +
      '<p>This is the inventory tab.</p>' +
    '</div>' +
    '<div class="modal-footer">' +
      '<span class="close">&times;</span>' +
    '</div>' +
  '</div>' +
'</div>');


    // Make the modal window draggable
    $('#customModal .modal-content').draggable({ handle: ".modal-header" });

    // Button and modal logic
    var modal = document.getElementById("customModal");
    var btn = document.getElementById("customButton");
    var span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
      modal.style.display = "block";
      updateCharacterTab();
    }

    span.onclick = function() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    // Tab functionality
    function openTab(evt, tabName) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }

    // Set the default tab to open
    document.getElementById("characterTab").click();

    // Update character tab content
  function updateCharacterTab() {
  var attributesDisplay = $('#attributesDisplay');
  var skillsDisplay = $('#skillsDisplay');
  var levelDisplay = $('#levelDisplay');
  var experiencetonextLevelDisplay = $('#experiencetonextLevelDisplay');

  attributesDisplay.html('');
  skillsDisplay.html('');
  levelDisplay.html('');
  experiencetonextLevelDisplay.html('');

  for (var key in State.variables.attributes) {
    attributesDisplay.append('<p class="attribute-item">' + key + ': ' + State.variables.attributes[key] + '</p>');
  }

  for (var key in State.variables.skills) {
    skillsDisplay.append('<p class="skill-item">' + key + ': ' + State.variables.skills[key] + '</p>');
  }

  levelDisplay.html(State.variables.level);
  experiencetonextLevelDisplay.html(State.variables.experiencetonextLevel);
}


    // Update the character tab when the character tab is clicked
    $('#characterTab').on('click', function() {
      updateCharacterTab();
    });

    // Tab event listeners
    $('#characterTab').on('click', function(e) {
      openTab(e, 'Character');
    });

    $('#inventoryTab').on('click', function(e) {
      openTab(e, 'Inventory');
    });

  });
});


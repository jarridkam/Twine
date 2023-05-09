// Load jQuery UI
$.getScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', function() {
  $(document).ready(function() {
    // Add the custom button to the sidebar
    $('<li id="customButton" class="link-internal">Custom Button</li>').appendTo('#menu');

    // Add the custom modal
    $('body').append('<div id="customModal" class="modal" style="display:none;">' +
      '<div class="modal-content">' +
        '<div class="modal-header">' +
          '<span class="close">&times;</span>' +
          '<h3>Custom Modal Window</h3>' +
        '</div>' +
        '<div class="modal-body">' +
          '<p id="modalContent">This is a custom modal window.</p>' +
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
    }

    span.onclick = function() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  });
});

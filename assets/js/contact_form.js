function showTempMessage() {
    var message = document.getElementById('tempMessage');
    if (message) {
      message.style.display = 'block';
      setTimeout(function () {
        message.style.display = 'none';
      }, 3000);
    }
  }

  function showLoadingCircle() {
    var loadingCircle = document.getElementById('loadingCircle');
    if (loadingCircle) {
      loadingCircle.style.display = 'block';
    }
  }

  function hideLoadingCircle() {
    var loadingCircle = document.getElementById('loadingCircle');
    if (loadingCircle) {
      loadingCircle.style.display = 'none';
    }
  }

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent the form from submitting the traditional way

      var form = e.target;
      var data = new FormData(form);
      
      // Endpoint for Google Apps Script
      var scriptURL = 'https://script.google.com/macros/s/AKfycbwQR5wJ7Lz7fC2JreqY6kZVLiE66zWAGhEdhkIZ_1N_FjGZ34S5S2zqX-NnP67Ue4U/exec';

      // Show loading circle
      showLoadingCircle();

      // Send data using fetch
      fetch(scriptURL, {
        method: 'POST',
        body: data,
      })
      .then(response => response.text())
      .then((responseText) => {
        // Hide loading circle
        hideLoadingCircle();

        // Display success message
        showTempMessage();
        
        // Reset the form fields
        form.reset();
      })
      .catch((error) => {
        // Hide loading circle
        hideLoadingCircle();

        console.error('Error!', error.message);
        alert('There was an error sending your message. Please try again later.');
      });
    });
  }
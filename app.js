const stripe = Stripe('pk_test_7eGxNWLsBhgGKicizQt8IABH');
const elements = stripe.elements();

// Open the modal
function openProductModal(productId) {
  let product = document.getElementById(productId);

  // Get Modal values
  let productTitle = document.getElementById('productItemTitle');
  let productDescription = document.getElementById('productItemDescription');
  let productPrice = document.getElementById('productItemPrice');

  //Change values in Modal and input
  productTitle.innerHTML = product.dataset.title;
  productDescription.innerHTML = product.dataset.description;
  productPrice.value = product.dataset.price


  $('#purchaseProductModal').modal('show')
}

// Custom styling can be passed to options when creating an Element.
const style = {
  base: {
    // Add your base input styles here. For example:
    fontSize: '16px',
    color: "#32325d",
  },
};

// Create an instance of the card Element.
const card = elements.create('card', {
  style
});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

//Adding event listener on the change event
card.addEventListener('change', ({
  error
}) => {
  const displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

// Create a token or display an error when the form is submitted.
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {
    token,
    error
  } = await stripe.createToken(card);

  if (error) {
    // Inform the customer that there was an error.
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = error.message;
  } else {
    // Send the token to your server.
    stripeTokenHandler(token);
  }
});

// Handles Payments to be sent to the server
// Closes Modal on Success
// Keeps modal open on Failure
// BONUS: ADD user feedback if process has failed

const stripeTokenHandler = (token) => {
  // Insert the token ID into the form so it gets submitted to the server
  const form = document.getElementById('payment-form');
  const hiddenInput = document.createElement('input');
  //Set a hidden attribute
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  // Grab the form information and turn it into an object
  let obj = {};
  $('#payment-form')
    .serializeArray()
    .forEach(val => {
      obj[val.name] = val.value
    });

  // Submit the form to the server
  fetch('http://localhost:3333/payment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    .then(response => {
      $('#purchaseProductModal').modal('hide')
    })
    .catch(err => {
      $('#purchaseProductModal').modal('show');
    })
}
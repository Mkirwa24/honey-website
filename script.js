// Get references to the main page elements that JavaScript needs to control.
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navBackdrop = document.getElementById("navBackdrop");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const productCards = document.querySelectorAll(".product-card");
const cartToggle = document.getElementById("cartToggle");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartClose = document.getElementById("cartClose");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartCheckout = document.getElementById("cartCheckout");
const priceModal = document.getElementById("priceModal");
const priceModalTitle = document.getElementById("priceModalTitle");
const priceModalValue = document.getElementById("priceModalValue");
const priceModalClose = document.getElementById("priceModalClose");
const priceModalBackdrop = document.getElementById("priceModalBackdrop");
const modalBuyNow = document.getElementById("modalBuyNow");
const revealItems = document.querySelectorAll(
  ".section-heading, .about-grid article, .product-card, .contact-copy, .contact-form, .footer"
);

// Storage keys keep cart data and theme choice saved between page visits.
const CART_STORAGE_KEY = "golden-hive-cart";
const THEME_STORAGE_KEY = "golden-hive-theme";

// Runtime state used while the page is open.
let cart = [];
let selectedModalProduct = null;

// Close the mobile navigation menu and restore the page state.
const closeNavMenu = () => {
  if (!navLinks || !navBackdrop || !navToggle) {
    return;
  }

  navLinks.classList.remove("open");
  navBackdrop.classList.remove("open");
  navBackdrop.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

// Hide the cart drawer.
const closeCartDrawer = () => {
  if (!cartDrawer) {
    return;
  }

  cartDrawer.hidden = true;
  document.body.classList.remove("cart-open");
};

// Open the cart drawer and move keyboard focus into it.
const openCartDrawer = () => {
  if (!cartDrawer || !cartClose) {
    return;
  }

  closeNavMenu();
  closePriceModal();
  cartDrawer.hidden = false;
  document.body.classList.add("cart-open");
  cartClose.focus();
};

// Close the product price modal and forget the currently selected product.
const closePriceModal = () => {
  if (!priceModal) {
    return;
  }

  priceModal.hidden = true;
  selectedModalProduct = null;
};

// Save the current cart array into localStorage.
const saveCart = () => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

// Convert a numeric value into the simple currency format used by the UI.
const formatCurrency = (value) => `$${value}`;

// Rebuild the cart UI any time cart data changes.
const renderCart = () => {
  if (!cartItems || !cartCount || !cartTotal) {
    return;
  }

  // Count the total number of jars and total price across all cart items.
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = String(totalItems);
  cartTotal.textContent = formatCurrency(totalPrice);

  // Show the empty state when there is nothing in the cart.
  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty. Add a honey jar to get started.</p>';
    return;
  }

  // Create the HTML for each cart line item and inject it into the drawer.
  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-top">
            <p class="cart-item-name">${item.name}</p>
            <span class="cart-item-price">${formatCurrency(item.price * item.quantity)}</span>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="quantity-button" type="button" data-action="decrease" data-product="${item.name}" aria-label="Decrease quantity for ${item.name}">-</button>
              <span>${item.quantity} jar${item.quantity > 1 ? "s" : ""}</span>
              <button class="quantity-button" type="button" data-action="increase" data-product="${item.name}" aria-label="Increase quantity for ${item.name}">+</button>
            </div>
            <button class="remove-item" type="button" data-action="remove" data-product="${item.name}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");
};

// Add a product to the cart, or increase quantity if it is already there.
const addItemToCart = (name, price) => {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  saveCart();
  renderCart();
};

// Temporarily change a button label to show a successful "added" state.
const showAddedState = (button, defaultLabel = "Buy Now") => {
  const existingTimer = Number(button.dataset.resetTimer ?? "0");
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  button.classList.add("is-added");
  button.textContent = "Added to Cart";

  const timerId = window.setTimeout(() => {
    button.classList.remove("is-added");
    button.textContent = defaultLabel;
    delete button.dataset.resetTimer;
  }, 1400);

  button.dataset.resetTimer = String(timerId);
};

// Update an existing cart item by increasing, decreasing, or removing it.
const updateCartItem = (name, action) => {
  const item = cart.find((entry) => entry.name === name);

  if (!item) {
    return;
  }

  if (action === "increase") {
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity -= 1;
  }

  if (action === "remove" || item.quantity <= 0) {
    cart = cart.filter((entry) => entry.name !== name);
  }

  saveCart();
  renderCart();
};

// Load saved cart data from localStorage when the page starts.
const loadCart = () => {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    renderCart();
    return;
  }

  try {
    cart = JSON.parse(storedCart);
  } catch {
    // If saved data is broken, recover with an empty cart instead of crashing.
    cart = [];
  }

  renderCart();
};

// Apply the chosen theme to the page and update the toggle button text.
const applyTheme = (theme) => {
  if (theme === "dark") {
    document.body.dataset.theme = "dark";
  } else {
    document.body.dataset.theme = "light";
  }

  if (!themeToggle) {
    return;
  }

  // Update the visible label so the button tells the user the next available mode.
  const label = themeToggle.querySelector(".theme-toggle-label");
  if (label) {
    label.textContent = theme === "dark" ? "Light" : "Dark";
  }

  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
};

// Load the saved theme, or fall back to the user's system preference.
const loadTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(storedTheme ?? preferredTheme);
};

// Open the product modal using data from the clicked product card.
const openPriceModal = (card) => {
  if (!priceModal || !priceModalTitle || !priceModalValue || !priceModalClose) {
    return;
  }

  // Read product details from the card element.
  const title = card.querySelector("h3")?.textContent ?? "Honey product";
  const price = card.dataset.price ?? "Price available on request";

  // Strip currency symbols/text so the value can be stored as a number in the cart.
  const numericPrice = Number(card.dataset.price?.replace(/[^0-9.]/g, "") ?? "0");

  priceModalTitle.textContent = title;
  priceModalValue.textContent = price;
  selectedModalProduct = {
    name: title,
    price: numericPrice,
  };
  priceModal.hidden = false;
  priceModalClose.focus();
};

// Set up mobile navigation behavior if the required elements exist.
if (navToggle && navLinks && navBackdrop) {
  // Open the mobile menu and activate the page overlay.
  const openNavMenu = () => {
    closeCartDrawer();
    navLinks.classList.add("open");
    navBackdrop.hidden = false;
    navBackdrop.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  };

  // Toggle the menu open/closed when the menu button is clicked.
  navToggle.addEventListener("click", () => {
    if (navLinks.classList.contains("open")) {
      closeNavMenu();
      return;
    }

    openNavMenu();
  });

  // Close the mobile menu after selecting a section link.
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavMenu);
  });

  // Clicking outside the mobile menu closes it.
  navBackdrop.addEventListener("click", closeNavMenu);

  // If the screen grows back to desktop size, reset the mobile nav state.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeNavMenu();
    }
  });
}

// Set up theme toggling.
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

// Handle the contact form locally and show a success message instead of submitting to a server.
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Read the submitted form values.
    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const interest = formData.get("interest");

    // Show a simple confirmation message, then clear the form fields.
    formStatus.textContent = `Thanks ${name}, your message about ${interest} has been received. We will contact you shortly.`;
    contactForm.reset();
  });
}

// Make each product card open the modal when clicked or keyboard-activated.
if (
  productCards.length &&
  priceModal &&
  priceModalTitle &&
  priceModalValue &&
  priceModalClose &&
  priceModalBackdrop
) {
  productCards.forEach((card) => {
    card.addEventListener("click", () => {
      openPriceModal(card);
    });

    card.addEventListener("keydown", (event) => {
      // Support keyboard activation for accessibility.
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openPriceModal(card);
    });
  });

  // Allow the user to close the modal from the close button or backdrop.
  priceModalClose.addEventListener("click", closePriceModal);
  priceModalBackdrop.addEventListener("click", closePriceModal);

  if (modalBuyNow) {
    modalBuyNow.addEventListener("click", () => {
      if (!selectedModalProduct) {
        return;
      }

      // Add the chosen product to cart, show feedback, then open the cart drawer.
      addItemToCart(selectedModalProduct.name, selectedModalProduct.price);
      showAddedState(modalBuyNow);
      closePriceModal();
      openCartDrawer();
    });
  }
}

// Set up cart interactions if the drawer UI exists.
if (cartToggle && cartDrawer && cartBackdrop && cartClose) {
  cartToggle.addEventListener("click", openCartDrawer);
  cartClose.addEventListener("click", closeCartDrawer);
  cartBackdrop.addEventListener("click", closeCartDrawer);

  if (cartItems) {
    // Use event delegation so one listener can handle all cart action buttons.
    cartItems.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const action = target.dataset.action;
      const productName = target.dataset.product;

      if (!action || !productName) {
        return;
      }

      // Update the correct cart item based on the clicked button's data attributes.
      updateCartItem(productName, action);
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
      if (!cart.length) {
        return;
      }

      // Placeholder checkout behavior until a real payment flow is connected.
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      alert(`Checkout ready for ${itemCount} item${itemCount > 1 ? "s" : ""}. Connect this button to your payment flow next.`);
    });
  }
}

// Add reveal classes and animate sections into view as the user scrolls.
if (revealItems.length) {
  revealItems.forEach((item) => {
    item.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    // Observe elements and reveal them once they enter the viewport.
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          // Make the item visible once, then stop observing it.
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });
  } else {
    // Fallback for older browsers: show everything immediately.
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }
}

// Let the Escape key close whichever overlay is currently open.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (navLinks?.classList.contains("open")) {
      closeNavMenu();
    }

    if (cartDrawer && !cartDrawer.hidden) {
      closeCartDrawer();
    }

    if (priceModal && !priceModal.hidden) {
      closePriceModal();
    }
  }
});

// Initialize saved theme and cart state when the page loads.
loadTheme();
loadCart();

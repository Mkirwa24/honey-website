const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navBackdrop = document.getElementById("navBackdrop");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const productCards = document.querySelectorAll(".product-card");
const addToCartButtons = document.querySelectorAll(".add-to-cart");
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

const CART_STORAGE_KEY = "golden-hive-cart";
const THEME_STORAGE_KEY = "golden-hive-theme";
let cart = [];
let selectedModalProduct = null;

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

const closeCartDrawer = () => {
  if (!cartDrawer) {
    return;
  }

  cartDrawer.hidden = true;
  document.body.classList.remove("cart-open");
};

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

const closePriceModal = () => {
  if (!priceModal) {
    return;
  }

  priceModal.hidden = true;
  selectedModalProduct = null;
};

const saveCart = () => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

const formatCurrency = (value) => `$${value}`;

const renderCart = () => {
  if (!cartItems || !cartCount || !cartTotal) {
    return;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = String(totalItems);
  cartTotal.textContent = formatCurrency(totalPrice);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty. Add a honey jar to get started.</p>';
    return;
  }

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

const loadCart = () => {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    renderCart();
    return;
  }

  try {
    cart = JSON.parse(storedCart);
  } catch {
    cart = [];
  }

  renderCart();
};

const applyTheme = (theme) => {
  if (theme === "dark") {
    document.body.dataset.theme = "dark";
  } else {
    document.body.dataset.theme = "light";
  }

  if (!themeToggle) {
    return;
  }

  const label = themeToggle.querySelector(".theme-toggle-label");
  if (label) {
    label.textContent = theme === "dark" ? "Light" : "Dark";
  }

  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
};

const loadTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(storedTheme ?? preferredTheme);
};

const openPriceModal = (card) => {
  if (!priceModal || !priceModalTitle || !priceModalValue || !priceModalClose) {
    return;
  }

  const title = card.querySelector("h3")?.textContent ?? "Honey product";
  const price = card.dataset.price ?? "Price available on request";
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

if (navToggle && navLinks && navBackdrop) {
  const openNavMenu = () => {
    closeCartDrawer();
    navLinks.classList.add("open");
    navBackdrop.hidden = false;
    navBackdrop.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  };

  navToggle.addEventListener("click", () => {
    if (navLinks.classList.contains("open")) {
      closeNavMenu();
      return;
    }

    openNavMenu();
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavMenu);
  });

  navBackdrop.addEventListener("click", closeNavMenu);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeNavMenu();
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name");
    const interest = formData.get("interest");

    formStatus.textContent = `Thanks ${name}, your message about ${interest} has been received. We will contact you shortly.`;
    contactForm.reset();
  });
}

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
  });

  priceModalClose.addEventListener("click", closePriceModal);
  priceModalBackdrop.addEventListener("click", closePriceModal);

  if (modalBuyNow) {
    modalBuyNow.addEventListener("click", () => {
      if (!selectedModalProduct) {
        return;
      }

      addItemToCart(selectedModalProduct.name, selectedModalProduct.price);
      showAddedState(modalBuyNow);
      closePriceModal();
      openCartDrawer();
    });
  }
}

if (addToCartButtons.length) {
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const productName = button.dataset.product ?? "Honey product";
      const productPrice = Number(button.dataset.price ?? "0");

      addItemToCart(productName, productPrice);
      openCartDrawer();
      showAddedState(button);
    });

    button.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });
  });
}

if (cartToggle && cartDrawer && cartBackdrop && cartClose) {
  cartToggle.addEventListener("click", openCartDrawer);
  cartClose.addEventListener("click", closeCartDrawer);
  cartBackdrop.addEventListener("click", closeCartDrawer);

  if (cartItems) {
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

      updateCartItem(productName, action);
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
      if (!cart.length) {
        return;
      }

      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      alert(`Checkout ready for ${itemCount} item${itemCount > 1 ? "s" : ""}. Connect this button to your payment flow next.`);
    });
  }
}

if (revealItems.length) {
  revealItems.forEach((item) => {
    item.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

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
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }
}

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

loadTheme();
loadCart();

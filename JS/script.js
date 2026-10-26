
"use strict";

// 1. MENGAMBIL ELEMEN HTML
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const themeToggle = document.querySelector("#themeToggle");

const filterButtons = document.querySelectorAll(".filter-button");
const menuCards = document.querySelectorAll(".menu-card");
const addButtons = document.querySelectorAll(".add-button");

const cartList = document.querySelector("#cartList");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const clearCartButton = document.querySelector("#clearCart");

const orderForm = document.querySelector("#orderForm");
const customerName = document.querySelector("#customerName");
const customerNote = document.querySelector("#customerNote");
const toast = document.querySelector("#toast");

let cart = [];
let toastTimer;


// 2. FORMAT HARGA RUPIAH
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}


// 3. NOTIFIKASI
function showToast(message) {
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}


// 4. NAVIGASI MOBILE
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Tutup menu" : "Buka menu"
  );

  menuToggle.textContent = isOpen ? "×" : "☰";
});

navLinks.addEventListener("click", event => {
  if (!event.target.closest("a")) return;

  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Buka menu");
  menuToggle.textContent = "☰";
});

// Memberi tanda pada tautan navigasi yang diklik
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});


// 5. DARK MODE DAN LIGHT MODE
const THEME_KEY = "kopikita_theme";

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark", isDark);

  themeToggle.textContent = isDark ? "☀" : "☾";

  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Aktifkan light mode" : "Aktifkan dark mode"
  );

  themeToggle.title = isDark
    ? "Aktifkan light mode"
    : "Aktifkan dark mode";
}

// Membaca tema yang tersimpan
let savedTheme = "light";

try {
  savedTheme = localStorage.getItem(THEME_KEY) || "light";
} catch (error) {
  console.warn("Penyimpanan tema tidak tersedia.");
}

applyTheme(savedTheme);

// Mengubah tema ketika tombol diklik
themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark")
    ? "light"
    : "dark";

  applyTheme(newTheme);

  try {
    localStorage.setItem(THEME_KEY, newTheme);
  } catch (error) {
    console.warn("Tema berubah, tetapi tidak dapat disimpan.");
  }

  showToast(
    newTheme === "dark"
      ? "Dark mode diaktifkan."
      : "Light mode diaktifkan."
  );
});


// 6. FILTER MENU
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    // Mengatur tombol yang aktif
    filterButtons.forEach(item => {
      const active = item === button;

      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    // Menampilkan menu sesuai kategori
    menuCards.forEach(card => {
      const matches =
        category === "all" ||
        card.dataset.category === category;

      card.hidden = !matches;
    });
  });
});


// 7. MENAMBAHKAN MENU KE KERANJANG
addButtons.forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    if (!name || !Number.isFinite(price) || price <= 0) {
      showToast("Data menu tidak valid.");
      return;
    }

    // Periksa apakah menu sudah ada
    const existing = cart.find(item => item.name === name);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        name: name,
        price: price,
        quantity: 1
      });
    }

    renderCart();
    showToast(`${name} ditambahkan ke keranjang.`);
  });
});


// 8. MENAMPILKAN KERANJANG DAN TOTAL HARGA
function renderCart() {
  cartList.replaceChildren();

  // Pesan ketika keranjang kosong
  if (cart.length === 0) {
    const empty = document.createElement("li");

    empty.className = "empty-cart";
    empty.textContent =
      "Keranjang masih kosong. Yuk, pilih menu!";

    cartList.appendChild(empty);
  }

  // Menampilkan setiap produk
  cart.forEach(item => {
    const row = document.createElement("li");
    row.className = "cart-item";

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("strong");
    title.textContent = item.name;

    const subtotal = document.createElement("small");
    subtotal.textContent = formatRupiah(
      item.price * item.quantity
    );

    info.append(title, subtotal);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    // Tombol mengurangi jumlah
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute(
      "aria-label",
      `Kurangi ${item.name}`
    );

    minus.addEventListener("click", () => {
      changeQuantity(item.name, -1);
    });

    // Jumlah produk
    const amount = document.createElement("span");
    amount.textContent = item.quantity;

    // Tombol menambah jumlah
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute(
      "aria-label",
      `Tambah ${item.name}`
    );

    plus.addEventListener("click", () => {
      changeQuantity(item.name, 1);
    });

    controls.append(minus, amount, plus);
    row.append(info, controls);
    cartList.appendChild(row);
  });

  // Menghitung total jumlah item
  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Menghitung seluruh harga
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = `${totalItems} item`;
  cartTotal.textContent = formatRupiah(totalPrice);
}


// 9. MENGUBAH JUMLAH PRODUK
function changeQuantity(name, change) {
  const item = cart.find(product => product.name === name);

  if (!item) return;

  item.quantity += change;

  // Hapus produk jika jumlahnya nol
  if (item.quantity <= 0) {
    cart = cart.filter(product => product.name !== name);

    showToast(`${name} dihapus dari keranjang.`);
  }

  renderCart();
}


// 10. MENGOSONGKAN KERANJANG
clearCartButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Keranjang sudah kosong.");
    return;
  }

  const confirmed = confirm(
    "Yakin ingin mengosongkan keranjang?"
  );

  if (!confirmed) return;

  cart = [];
  renderCart();

  showToast("Keranjang berhasil dikosongkan.");
});


// 11. FORMULIR PEMESANAN
orderForm.addEventListener("submit", event => {
  // Mencegah halaman dimuat ulang
  event.preventDefault();

  const name = customerName.value.trim();
  const note = customerNote.value.trim();

  if (!name) {
    showToast("Silakan isi nama pemesan.");
    customerName.focus();
    return;
  }

  if (cart.length === 0) {
    showToast("Pilih menu terlebih dahulu.");

    document.querySelector("#menu").scrollIntoView({
      behavior: "smooth"
    });

    return;
  }

  // Membuat daftar pesanan
  const details = cart
    .map(item => `${item.name} x${item.quantity}`)
    .join(", ");

  // Menghitung total pesanan
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Menampilkan ringkasan pesanan simulasi
  alert(
    `Terima kasih, ${name}!\n` +
    `Pesanan: ${details}\n` +
    `Total: ${formatRupiah(total)}` +
    (note ? `\nCatatan: ${note}` : "") +
    "\n\nIni hanya simulasi website."
  );

  showToast("Simulasi pesanan berhasil!");

  // Mengosongkan keranjang setelah simulasi
  cart = [];
  renderCart();
  orderForm.reset();
});


// 12. FAQ ACCORDION
document.querySelectorAll(".faq-question").forEach(button => {
  button.addEventListener("click", () => {
    const answer = button
      .closest(".faq-item")
      .querySelector(".faq-answer");

    const wasOpen =
      button.getAttribute("aria-expanded") === "true";

    // Menutup semua jawaban
    document.querySelectorAll(".faq-question").forEach(other => {
      other.setAttribute("aria-expanded", "false");

      const otherAnswer = other
        .closest(".faq-item")
        .querySelector(".faq-answer");

      otherAnswer.hidden = true;
      other.querySelector("span").textContent = "+";
    });

    // Membuka pertanyaan yang dipilih
    if (!wasOpen) {
      button.setAttribute("aria-expanded", "true");
      answer.hidden = false;
      button.querySelector("span").textContent = "−";
    }
  });
});


// 13. TAHUN OTOMATIS DI FOOTER
document.querySelector("#currentYear").textContent =
  new Date().getFullYear();


// 14. MENJALANKAN KERANJANG SAAT HALAMAN DIBUKA
renderCart();

console.log("Landing page KopiKita berhasil dijalankan!");

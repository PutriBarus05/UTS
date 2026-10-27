const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

// Navigasi untuk layar HP
menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("open");
});

navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navMenu.classList.remove("open");
    });
});

// Tahun otomatis di footer
document.getElementById("year").textContent = new Date().getFullYear();

// FILTER KATEGORI MENU
const filterBtns = document.querySelectorAll(".filter-btn");
const menuCards = document.querySelectorAll(".menu-card");

filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.category;

        menuCards.forEach(function (card) {
            if (category === "all" || card.dataset.category === category) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// KERANJANG PESANAN
const cart = {};

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

function renderCart() {
    cartItems.innerHTML = "";

    const names = Object.keys(cart);
    let total = 0;

    if (names.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-cart">Belum ada menu yang dipilih.</p>';
    }

    names.forEach(function (name) {
        const item = cart[name];
        const subtotal = item.price * item.quantity;

        total += subtotal;

        const row = document.createElement("div");
        row.className = "cart-row";

        const description = document.createElement("div");
        description.textContent = name + " — " + formatRupiah(subtotal);

        const controls = document.createElement("div");
        controls.className = "cart-controls";

        const minusButton = document.createElement("button");
        minusButton.type = "button";
        minusButton.textContent = "−";
        minusButton.setAttribute("aria-label", "Kurangi " + name);
        minusButton.addEventListener("click", function () {
            changeQuantity(name, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plusButton = document.createElement("button");
        plusButton.type = "button";
        plusButton.textContent = "+";
        plusButton.setAttribute("aria-label", "Tambah " + name);
        plusButton.addEventListener("click", function () {
            changeQuantity(name, 1);
        });

        controls.append(minusButton, quantity, plusButton);
        row.append(description, controls);
        cartItems.appendChild(row);
    });

    cartTotal.textContent = formatRupiah(total);
}

function changeQuantity(name, change) {
    if (!cart[name]) return;

    cart[name].quantity += change;

    if (cart[name].quantity <= 0) {
        delete cart[name];
    }

    renderCart();
}

// Tombol tambah menu
document.querySelectorAll(".add-button").forEach(function (button) {
    button.addEventListener("click", function () {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (!cart[name]) {
            cart[name] = {
                price: price,
                quantity: 0
            };
        }

        cart[name].quantity += 1;
        renderCart();
    });
});

// FORM PEMESANAN INTEGRASI WHATSAPP
document.getElementById("orderForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const customerName = document.getElementById("customerName").value.trim();
    const customerNote = document.getElementById("customerNote").value.trim();
    const names = Object.keys(cart);

    if (names.length === 0) {
        alert("Pilih setidaknya satu menu terlebih dahulu.");
        return;
    }

    let total = 0;
    const orderDetails = names.map(function (name) {
        const item = cart[name];
        total += item.price * item.quantity;
        return `• ${name} (${item.quantity}x)`;
    });

    let waMessage = `Halo Barista KopiKita! 👋\nSaya mau pesan kopi nih:\n\n*Nama:* ${customerName}\n\n*Pesanan:*\n${orderDetails.join("\n")}\n\n*Total:* ${formatRupiah(total)}`;

    if (customerNote) {
        waMessage += `\n*Catatan:* ${customerNote}`;
    }

    waMessage += `\n\nTerima kasih! ☕`;

    const waNumber = "6281234567890"; // Ganti dengan nomor WhatsApp toko/pribadi
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

    window.open(waUrl, "_blank");
});

// Tampilan keranjang awal
renderCart();
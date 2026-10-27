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

// Keranjang pesanan
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

// Tombol tambah menu (Bekerja otomatis untuk 8 menu)
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

// Form pemesanan demo
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
        return name + " x" + item.quantity;
    });

    let message =
        "Terima kasih, " + customerName + "!\n\n" +
        "Pesanan demo kamu:\n" +
        orderDetails.join("\n") + "\n\n" +
        "Total: " + formatRupiah(total);

    if (customerNote) {
        message += "\nCatatan: " + customerNote;
    }

    message += "\n\nIni hanya simulasi website. Pesanan belum dikirim ke toko.";

    alert(message);
});

// Tampilan keranjang awal
renderCart();
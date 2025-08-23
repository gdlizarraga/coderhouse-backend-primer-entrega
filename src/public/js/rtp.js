const socket = io();

// Actualizar la lista de productos en tiempo real
socket.on("updateProducts", (products) => {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "col-md-6 col-lg-4 mb-3";
    productCard.setAttribute("data-id", product.id);
    productCard.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text">${product.description}</p>
          <p class="card-text">
            <small class="text-muted">Código: ${product.code}</small><br>
            <small class="text-muted">Stock: ${product.stock}</small><br>
            <small class="text-muted">Categoría: ${product.category}</small>
          </p>
          <h6 class="text-success">$${product.price}</h6>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
            Eliminar
          </button>
        </div>
      </div>
    `;
    list.appendChild(productCard);
  });
  // Ocultar mensaje de error
  const errorDiv = document.getElementById("error-message");
  errorDiv.classList.add("d-none");
  errorDiv.textContent = "";
});

// Mostrar mensaje de error si el servidor lo envía
socket.on("errorMessage", (msg) => {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = msg;
  errorDiv.classList.remove("d-none");
});

// Mostrar alert cuando hay error al agregar producto
socket.on("addProductError", (msg) => {
  Swal.fire({
    icon: "error",
    title: "Error al agregar producto",
    text: msg,
    confirmButtonText: "Entendido",
  });
});

// Mostrar notificación de éxito cuando se agrega correctamente
socket.on("addProductSuccess", (msg) => {
  Swal.fire({
    icon: "success",
    title: "¡Éxito!",
    text: msg,
    timer: 2000,
    showConfirmButton: false,
  });
});

// Agregar producto
document
  .getElementById("add-product-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = Object.fromEntries(formData.entries());
    socket.emit("addProduct", product);
    e.target.reset();
  });

// Eliminar producto
window.deleteProduct = function (id) {
  socket.emit("deleteProduct", id);
};

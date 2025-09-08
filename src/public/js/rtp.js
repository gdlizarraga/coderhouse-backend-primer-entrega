const socket = io();

// Actualizar la lista de productos en tiempo real
socket.on("updateProducts", ({ products, pagination }) => {
  // Detectar si la página actual en la URL es diferente a la recibida
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get("page")) || 1;
  if (pagination && pagination.page && pagination.page !== currentPage) {
    // Redirigir automáticamente a la página válida
    urlParams.set("page", pagination.page);
    window.location.search = urlParams.toString();
    return;
  }
  const list = document.getElementById("product-list");
  if (list) {
    list.innerHTML = "";
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "col-md-6 col-lg-4 mb-3";
      productCard.setAttribute("data-id", product._id);
      productCard.innerHTML = `
        <div class="card shadow-sm h-100 border-0">
          <div class="position-relative">
            ${
              product.thumbnail
                ? `<img src="/productos/${product.thumbnail}" class="card-img-top p-3" alt="Imagen del producto" style="height: 220px; object-fit: contain; background: #f5f5f5; border-radius: 1rem;" />`
                : `<div class="d-flex align-items-center justify-content-center card-img-top p-3" style="height: 220px; background: #f5f5f5; border-radius: 1rem;"><span class="text-muted">Sin imagen</span></div>`
            }
            <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">Nuevo</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1" style="font-weight: 600; color: #333;">${
              product.title
            }</h5>
            <p class="card-text mb-2" style="min-height: 48px; color: #555;">${
              product.description
            }</p>
            <ul class="list-unstyled mb-2">
              <li><span class="badge bg-info text-dark">Código: ${
                product.code
              }</span></li>
              <li><span class="badge bg-secondary">Stock: ${
                product.stock
              }</span></li>
              <li><span class="badge bg-light text-dark">Categoría: ${
                product.category
              }</span></li>
            </ul>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="fs-4 fw-bold text-success">${product.price}</span>
              <button class="btn btn-outline-danger btn-sm px-3" onclick="deleteProduct('${
                product._id
              }')">
                <i class="bi bi-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(productCard);
    });
    // Renderizar paginación
    const pagContainer = document.getElementById("pagination-container");
    if (pagContainer && pagination && products.length) {
      let pagHtml = `<nav aria-label='Paginación de productos'><ul class='pagination justify-content-center mt-4'>`;
      pagHtml += `<li class='page-item ${
        !pagination.hasPrevPage ? "disabled" : ""
      }'><a class='page-link' href='?page=${
        pagination.prevPage
      }' tabindex='-1'>Anterior</a></li>`;
      pagination.pageNumbers.forEach((p) => {
        pagHtml += `<li class='page-item ${
          p.active ? "active" : ""
        }'><a class='page-link' href='?page=${p.number}'>${p.number}</a></li>`;
      });
      pagHtml += `<li class='page-item ${
        !pagination.hasNextPage ? "disabled" : ""
      }'><a class='page-link' href='?page=${
        pagination.nextPage
      }'>Siguiente</a></li>`;
      pagHtml += `</ul></nav>`;
      pagContainer.innerHTML = pagHtml;
    } else if (pagContainer) {
      pagContainer.innerHTML = "";
    }
    // Ocultar mensaje de error
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
      errorDiv.classList.add("d-none");
      errorDiv.textContent = "";
    }
  }
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
  }).then(() => {
    window.location.reload();
  });
});

// Agregar producto

const addProductForm = document.getElementById("add-product-form");
function getPaginationParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    page: parseInt(urlParams.get("page")) || 1,
    limit: parseInt(urlParams.get("limit")) || 10,
  };
}

if (addProductForm) {
  addProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("[CLIENT] Formulario submit detectado");
    const formData = new FormData(e.target);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: result.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // Limpiar el input file manualmente
          const fileInput = addProductForm.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = "";
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al agregar producto",
          text: result.error || "Error desconocido",
          confirmButtonText: "Entendido",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: err.message,
        confirmButtonText: "Entendido",
      });
    }
  });
}

// Eliminar producto
window.deleteProduct = function (id) {
  const { page, limit } = getPaginationParams();
  socket.emit("deleteProduct", { id });
  // Recargar la página después de eliminar para actualizar la lista y paginación
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

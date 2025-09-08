window.verDetalleCarrito = function () {
  const select = document.getElementById("activeCartsSelect");
  const cartId = select && select.value ? select.value : "";
  if (!cartId) {
    Swal.fire({
      icon: "warning",
      title: "Carrito requerido",
      text: "Debes crear y seleccionar un carrito para ver el detalle.",
      confirmButtonText: "Entendido",
    });
    return;
  }
  window.location.href = `/cart/${cartId}`;
};

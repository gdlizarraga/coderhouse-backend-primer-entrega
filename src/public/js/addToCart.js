window.addToCart = async function (productId) {
  const select = document.getElementById("activeCartsSelect");
  const cartId = select && select.value ? select.value : "";
  if (!cartId) {
    Swal.fire({
      icon: "warning",
      title: "Carrito requerido",
      text: "Debes crear y seleccionar un carrito antes de agregar productos.",
      confirmButtonText: "Entendido",
    });
    return;
  }
  try {
    const res = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: data.message || "Producto agregado al carrito",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "No se pudo agregar el producto",
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
};

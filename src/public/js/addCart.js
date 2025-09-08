window.addCart = async function () {
  try {
    const res = await fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("No se pudo crear el carrito");
    const cart = await res.json();
    Swal.fire({
      icon: "success",
      title: "Carrito creado",
      text: `ID: ${cart._id || cart.id || cart._id}`,
      timer: 1500,
      showConfirmButton: false,
    });
    // Actualizar el select de carritos
    if (typeof refreshCart === "function") refreshCart();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error al crear carrito",
      text: err.message,
      confirmButtonText: "Entendido",
    });
  }
};

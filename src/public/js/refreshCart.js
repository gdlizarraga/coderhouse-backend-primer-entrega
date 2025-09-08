window.refreshCart = async function () {
  try {
    const res = await fetch("/api/carts?limit=100");
    const data = await res.json();
    const carts = data.payload || [];
    const select = document.getElementById("activeCartsSelect");
    if (select) {
      select.innerHTML = "";
      carts.forEach((cart) => {
        const option = document.createElement("option");
        option.value = cart._id;
        option.textContent = cart._id;
        select.appendChild(option);
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error al actualizar carritos",
      text: err.message,
      confirmButtonText: "Entendido",
    });
  }
};

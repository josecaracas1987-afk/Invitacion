document.addEventListener("DOMContentLoaded", () => {

    const popupOverlay = document.getElementById("popupOverlay");
    const popupContent = document.getElementById("popupContent");
    
    // Bloquear scroll mientras el popup está activo
    document.body.style.overflow = "hidden";

    // Cerrar popup al hacer clic dentro del contenido
    popupContent.addEventListener("click", () => closePopup());

    // Cerrar al hacer clic fuera
    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) closePopup();
    });

    function closePopup() {
        popupOverlay.classList.add("fadeOut");

        setTimeout(() => {
            popupOverlay.classList.add("hidden");
            document.body.style.overflow = "auto";// Restaurar scroll
        }, 600); // duración de fadeOut
    }

    document.getElementById("btn-agregar-fotos").addEventListener("click", () => {
    // 🔒 FECHA DE APERTURA (AJUSTA AQUÍ)
    const fechaHabilitada = new Date("2026-02-28T20:00:00"); 
    const ahora = new Date();

    if (ahora < fechaHabilitada) {
      alert("📸 La galería de fotos se habilitará el 28 de febrero. ¡Muy pronto!");
      return;
    }

    // ✅ Fecha válida → abrir Google Photos
    window.open("https://photos.app.goo.gl/vUAkTkoVznKgcje27", "_blank");
  });
});

// Abrir popup
document.getElementById("btn-ver-lista").addEventListener("click", async () => {
    const popup = document.getElementById("popup-lista");
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";// Bloquear scroll

    await cargarRegalos();
});

// Cerrar popup
document.querySelector(".cerrar-popup-lista").addEventListener("click", () => {
    document.getElementById("popup-lista").style.display = "none";
    document.body.style.overflow = "auto";// Restaurar scroll
});

// Cerrar haciendo click fuera
document.getElementById("popup-lista").addEventListener("click", e => {
    if (e.target.id === "popup-lista") {
        e.target.style.display = "none";
    }
});

// Consultar regalos desde backend
async function cargarRegalos() {
    const contenedor = document.getElementById("contenedor-regalos");
    const eventoId = document.getElementById("evento-id").dataset.id;
    

    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        const API_URL = "https://webiinvitefront.onrender.com/api";
        const res = await fetch(`${API_URL}/regalos/evento/${eventoId}`);
        const data = await res.json();

        contenedor.innerHTML = "";

        data.forEach(regalo => {
            const div = document.createElement("div");
            div.classList.add("tarjeta-regalo");

            // 👉 ruta absoluta al backend
            const imagenUrl = `${regalo.enlace}`;
            

            div.style.backgroundImage = `url('${imagenUrl}')`;
            
            div.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div class="contenido-regalo">
                            <h4 class="titulo">${regalo.titulo}</h4>

                            <p class="precio">$${Number(regalo.valor).toLocaleString("es-CL", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}</p>

                            <p class="estado">${regalo.reservado_por}</p>

                            <button class="btn-seleccionar" data-id="${regalo.id}">
                                Seleccionar
                            </button>
                        </div>
                    </div>
                    <div class="card-back">
                        <h5 class="cancelar-seleccion" title="Presionar aqui para volver">Datos Bancarios:</h5>
                        <p><span class="instruciones">
                        BCI - Cta. Cte. <br>Nro. 777927429492 <br>Juan Carrasquero <br>Rut 27.429.492-2 <br>jjcoviol@gmail.com
                        <br></span>Escribe en el asunto el regalo seleccionado.
                        </p>
                        <button class="btn-confirmar">Confirmar</button>
                    </div>
                </div>
            `;
            // Flip
            div.querySelector(".btn-seleccionar")
                .addEventListener("click", () => {
                    div.classList.add("flip");
                });

            // Confirmar
            div.querySelector(".btn-confirmar")
                .addEventListener("click", (e) => {
                    e.stopPropagation();
                    confirmarRegalo(eventoId, div,regalo.titulo);
                });
            /* 👉 Cancelar selección (click fuera del botón) */
            div.querySelector(".card-back").addEventListener("click", (e) => {
                if (!e.target.classList.contains("btn-confirmar")) {
                    div.classList.remove("flip");
                }
            });

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al cargar la lista.</p>";
    }
}

async function confirmarRegalo(Id, tarjeta,titulo) {
    const API_URL = "https://webiinvitefront.onrender.com/api";
    try {
        const res = await fetch(`${API_URL}/notificaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mensaje: "Un invitado ha confirmado el regalo: " + titulo,
                evento_id: Id

            })
        });

        if (!res.ok) throw new Error("Error al confirmar regalo");
        const popup = document.getElementById("popup-lista");
        popup.style.display = "none";
        document.getElementById("mensajeGracias").classList.remove("hidden");
        document.body.style.overflow = "auto";// Restaurar scroll

    } catch (err) {
        console.error("Error confirmando regalo:", err);
        alert("No se pudo confirmar el regalo, intenta nuevamente.");
    }

}

function cerrarMensaje() {
    document.getElementById("mensajeGracias").classList.add("hidden");
    document.body.style.overflow = "auto";// Restaurar scroll
}


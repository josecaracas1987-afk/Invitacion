const token = localStorage.getItem("token") || sessionStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipo_usuario") || sessionStorage.getItem("tipo_usuario");
const API_URL = "https://webiinvitefront.onrender.com/api"; // Cambia a tu URL real
const codigo = localStorage.getItem("codigo") ;
const cantPorPagina = 5;
const formRegalo = document.getElementById('registro-regalo-form');
const cerrarModalBtn = document.querySelector('.cerrar-modal');
const modal = document.getElementById("modal-regalo");
const imagenInput = document.getElementById('imagen');
const mensajeRegistro = document.getElementById('mensaje-registro');   
const listaRegalos = document.getElementById("lista-regalos");
const listaRegalosContainer = document.getElementById("lista-regalos-container");
const overlay = document.getElementById("loginOverlay");

let paginaActual = 1;
let invitadosTotales = [];
let listaTotales = []; // Variable para almacenar la lista de regalos



export async function iniciarAplicacion({ token, API_URL, codigo }) {
  if (!token) return;

  obtenerResumen(API_URL, token, codigo);
  obtenerInvitados(API_URL, token, codigo);
  obtenerNotificaciones(API_URL, token, codigo);
  obtenerListaRegalos(API_URL, token, codigo);

  // aquí puedes habilitar botones, menús, etc.
}



async function obtenerResumen(API_URL, token, codigo) {        
  try{
    const res = await fetch(`${API_URL}/invitados/estado/${codigo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const resumen = await res.json();
    document.getElementById("confirmados").textContent = `Confirmados: ${resumen.Confirmado || 0}`;
    document.getElementById("pendientes").textContent = `Pendientes: ${resumen.Pendiente || 0}`;
    document.getElementById("rechazados").textContent = `Rechazados: ${resumen.Rechazado || 0}`;
  }catch (err) {
    alert("Error al cargar resumen");
    console.error(err);
  }
}

async function obtenerInvitados(API_URL, token, codigo) {
  try {
    const res = await fetch(`${API_URL}/invitados/evento/${codigo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    });

    const invitadosTotales = await res.json();
    window.invitadosGlobal = invitadosTotales;

    mostrarPagina(1);        // Usa invitadosGlobal para paginación
    cargarMensajesChat();   // Usa invitadosGlobal para chat
  } catch (err) {
    console.error("Error al cargar datos:", err);
    alert("Error al cargar invitados y chat");
  }
}


async function obtenerNotificaciones(API_URL, token, codigo) {
  try {
    const res = await fetch(`${API_URL}/notificaciones/${codigo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log(data);
    const notificaciones = data.notificaciones
    const ul = document.getElementById("lista-notificaciones");
    ul.innerHTML = "";
    notificaciones.forEach(n => {
      const li = document.createElement("li");
      li.textContent = n;
      ul.appendChild(li);
    });
  } catch (err) {
    alert("Error al cargar notificaciones");
    console.error(err);
  } 
}

async function obtenerListaRegalos(API_URL, token, codigo) {
  try {
    const res = await fetch(`${API_URL}/regalos/evento/${codigo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    listaTotales = await res.json();
    paginarLista(1); // Mostrar la primera página
  } catch (err) {
    alert("Error al cargar lista de regalos");
    console.error(err);
  }
}

function getRandomBubbleClass(index) {
  const colors = ['chat-teal', 'chat-yellow', 'chat-purple', 'chat-red'];
  return colors[index % colors.length];
}

function cargarMensajesChat() {
  const mensajes = window.invitadosGlobal
    .filter(m => m.comentario?.trim())
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const container = document.getElementById("chat-container");
  container.innerHTML = "";

  mensajes.forEach((m, i) => {
    const div = document.createElement("div");
    const colorClass = getRandomBubbleClass(i);
    const fecha = new Date(m.createdAt);

    div.className = `chat-bubble ${colorClass}`;
    div.innerHTML = `
      <strong>${m.nombre || "Invitado"}</strong>
      <div class="mensaje">${m.comentario}</div>
      <div class="chat-meta">${!isNaN(fecha) ? fecha.toLocaleString() : "Sin fecha"}</div>
      <div class="chat-actions">
        <button class="btnLike" >
          <i class="fas fa-thumbs-up like"></i> ${m.likes || 0}
        </button>
        <button class="btnfav" >
        ${m.favorito 
            ? '<i class="fas fa-heart heart"></i>'
            : '<i class="far fa-heart heart"></i>'
        }</button>
      </div>
    `;
    div.querySelector(".btnLike").addEventListener("click", (e) => {
      toggleLike(m.id);
    });
    div.querySelector(".btnfav").addEventListener("click", (e) => {
      toggleFavorito(m.id);
    });

    container.appendChild(div);
  });

}

function mostrarPagina(pagina) {
    const cantPorPagina = 5;
    invitadosTotales = window.invitadosGlobal; // Asegúrate de que esta variable esté definida
    paginaActual = pagina;
    const inicio = (pagina - 1) * cantPorPagina;
    const fin = inicio + cantPorPagina;
    const invitadosPagina = invitadosTotales.slice(inicio, fin);
    
    const tbody = document.querySelector("#tabla-invitados tbody");
    tbody.innerHTML = "";
  
    invitadosPagina.forEach(inv => {
        const row = document.createElement('tr');
    
        const nombreCell = document.createElement('td');
        nombreCell.textContent = inv.nombre;
        row.appendChild(nombreCell);
    
        const acompanantesCell = document.createElement('td');
        acompanantesCell.textContent = inv.acompanantes;
        row.appendChild(acompanantesCell);
    
        const estadoCell = document.createElement('td');
        estadoCell.classList.add('centrado'); // Clase para aplicar estilos CSS (puedes definirla en tu CSS)
        const botonEstado = document.createElement('button');
        botonEstado.textContent = inv.estado_confirmacion;
        botonEstado.classList.add('btn'); // Clase para aplicar estilos CSS (puedes definirla en tu CSS)
        botonEstado.dataset.invitacionId = inv.id; // Asumiendo que cada invitado tiene un 'id' único
    
        botonEstado.addEventListener('click', () => {
            realizarAccionInvitacion(inv.id, inv.estado_confirmacion);
        });
    
        estadoCell.appendChild(botonEstado);
        row.appendChild(estadoCell);
    
        tbody.appendChild(row);
    });

    // Actualizar botones y texto
    document.getElementById("paginaActual").textContent = `Página ${pagina}`;
    document.getElementById("btnAnterior").disabled = pagina === 1;
    document.getElementById("btnSiguiente").disabled = fin >= invitadosTotales.length;
  
}

function realizarAccionInvitacion(invitacionId, estadoActual) {
  console.log(`Botón clickeado para la invitación con ID: ${invitacionId}, estado actual: ${estadoActual}`);
  // Aquí puedes implementar la lógica para la acción del botón
  // Por ejemplo, podrías cambiar el estado o mostrar un modal.
}

 // Función para hacer 'like' a un mensaje
 async function toggleLike(invitadoId) {
  try {
    const res = await fetch(`${API_URL}/likes/like/${invitadoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const { likesActualizados } = await res.json();

    // Buscar al invitado y actualizar el total de likes
    const index = window.invitadosGlobal.findIndex(i => i.id === invitadoId);
    if (index !== -1) {
      window.invitadosGlobal[index].likes = likesActualizados;
    }

    cargarMensajesChat(); // Renderiza de nuevo solo el chat
  } catch (error) {
    console.error("Error al dar like:", error);
  }
}

// Función para marcar como favorito
async function toggleFavorito(invitadoId) {
  try {
    const respon = await fetch(`${API_URL}/likes/favorito/${invitadoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await respon.json();

    // Actualizar solo el ícono del botón favorito
    const btn = document.querySelector(`.btnfav[onclick="toggleFavorito('${invitadoId}')"]`);
    if (btn) {
      btn.innerHTML = data.favorito 
        ? '<i class="fas fa-heart heart"></i>' 
        : '<i class="far fa-heart heart"></i>';
    }
    cargarMensajesChat(); // Renderiza de nuevo solo el chat
  } catch (err) {
    console.error("Error al marcar como favorito:", err);
  }
}

function paginarLista(pagina) {
  paginaActual = pagina;
  const inicio = (pagina - 1) * cantPorPagina;
  const fin = inicio + cantPorPagina;
  const regalosPagina = listaTotales.slice(inicio, fin);

  const tbody = document.querySelector("#regalos tbody");
  tbody.innerHTML = "";

  regalosPagina.forEach(inv => {
    const row = `<tr>
      <td>${inv.titulo}</td>
      <td class="ocultar">${inv.reservado_por}</td>
      <td class="centrado">${inv.valor}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
  /*/ Actualizar botones y texto
  document.getElementById("paginaActual").textContent = `Página ${pagina}`;
  document.getElementById("btnAnterior").disabled = pagina === 1;
  document.getElementById("btnSiguiente").disabled = fin >= invitadosTotales.length;*/

}

// Abrir modal de registro de regalo
document.getElementById("agregar-regalo").addEventListener("click", () => {
    modal.style.display = "flex";
});

// Cerrar modal de registro de regalo
cerrarModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Registrar nuevo regalo
formRegalo.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const titulo = document.getElementById('nombre').value.trim();
  const enlace = document.getElementById('link').value.trim();
  const valor = document.getElementById('valor').value.trim();
  const reservadopor = document.getElementById('reservadopor').value.trim();
  
  try {
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('enlace', enlace);
    formData.append('valor', valor);
    formData.append('reservado_por', reservadopor);
    formData.append('codigo', codigo); // Append el código del evento

    const response = await fetch(`${API_URL}/regalos`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // No necesitas 'Content-Type': 'application/json' cuando envías FormData
        },
        body: formData, // Enviar el FormData en el cuerpo de la petición
    });

    const data = await response.json();

    if (response.ok) {
      mensajeRegistro.classList.remove('hidden');
      mensajeRegistro.className = 'mensaje exito';
      mensajeRegistro.textContent = 'Regalo registrado exitosamente.';
      setTimeout(() => {
          mensajeRegistro.classList.add('hidden');
      }, 3000);
      formRegalo.reset();
      obtenerListaRegalos(); // Refrescar la lista de regalos
    } else {
      mensajeRegistro.className = 'mensaje error';
      mensajeRegistro.textContent = data.error || 'Error al registrar el regalo.';
    }

  } catch (error) {
      console.error('Error al enviar la petición:', error);
      mensajeRegistro.textContent = 'Error de conexión al servidor.';
      mensajeRegistro.className = 'mensaje error';
      mensajeRegistro.classList.remove('hidden');
      setTimeout(() => {
          mensajeRegistro.classList.add('hidden');
      }, 3000);
  }
});

// Enviar lista de invitados por correo
document.getElementById("btn-enviar-excel").addEventListener("click", async () => {
  if (!window.invitadosGlobal || window.invitadosGlobal.length === 0) {
        alert("No hay invitados para exportar.");
        return;
    }
  if (!codigo) {
      alert("Código de evento no disponible.");
      return;
  }
  const respuesta = await fetch(`${API_URL}/invitados/enviar-excel`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ codigo: codigo })
  });
  
  const data = await respuesta.json();
  alert(data.mensaje || "Error al enviar");
});

// Descargar lista de invitados como Excel
document.getElementById("btn-descargar-excel").addEventListener("click", () => {
    if (!window.invitadosGlobal || window.invitadosGlobal.length === 0) {
        alert("No hay invitados para exportar.");
        return;
    }

    // Campos que SÍ quieres exportar
    const camposDeseados = ["nombre", "email", "acompanantes", "estado_confirmacion","mesa"]; // Ajusta según tus necesidades
  
    // Crear una nueva lista con solo los campos deseados
    const datosFiltrados = window.invitadosGlobal.map(inv => {
        let nuevo = {};
        camposDeseados.forEach(campo => {
            nuevo[campo] = inv[campo];
        });
        return nuevo;
    });
    
    // 1. Crear hoja con los datos
    const ws = XLSX.utils.json_to_sheet(datosFiltrados);
    
    // 2. Crear el libro de Excel y agregar la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invitados");
    
    // 3. Exportar el archivo
    XLSX.writeFile(wb, "lista_invitados.xlsx");
});
      
// Asignar mesas automáticamente
document.getElementById("btn-asignar-mesas").addEventListener("click", async () => {
  if (!window.invitadosGlobal || window.invitadosGlobal.length === 0) {
    alert("No hay invitados para asignar.");
    return;
  }

  const confirmadosSinMesa = window.invitadosGlobal.filter(i =>
      i.estado_confirmacion === "Confirmado" && (i.mesa === null || i.mesa === undefined)
  );

  if (confirmadosSinMesa.length === 0) {
      alert("No hay invitados confirmados sin mesa.");
      return;
  }

  // Obtener el último número de mesa asignado
  const mesasUsadas = window.invitadosGlobal
      .filter(i => i.mesa !== null && i.mesa !== undefined)
      .map(i => i.mesa);
  let numeroMesa = mesasUsadas.length > 0 ? Math.max(...mesasUsadas) : 1;

  let capacidadMesa = 8;
  let personasEnMesa = 0;
  let asignaciones = [];

  for (let invitado of confirmadosSinMesa) {
    // Saltar si ya tiene mesa asignada
    if (invitado.mesa) continue;

    // Calcular total de personas de este grupo
    const acompanantes = invitado.acompanantes
        ? invitado.acompanantes.split(',').map(a => a.trim()).filter(a => a !== "")
        : [];
    const grupo = [invitado, ...acompanantes]; // grupo completo
    const cantidadGrupo = grupo.length;

    // Si excede la capacidad, partir en grupos de 8
    let grupoRestante = cantidadGrupo;
    let inicio = 0;

    while (grupoRestante > 0) {
        let capacidadRestante = capacidadMesa - personasEnMesa;

        if (cantidadGrupo > capacidadMesa) {
            // Si todo el grupo no cabe, usar una nueva mesa
            numeroMesa++;
            capacidadRestante = capacidadMesa;
            personasEnMesa = 0;
        } else if (grupoRestante > capacidadRestante) {
            // Si el grupo restante no cabe en la mesa actual
            numeroMesa++;
            capacidadRestante = capacidadMesa;
            personasEnMesa = 0;
        }

        // Asignar esta parte del grupo a la mesa actual
        asignaciones.push({
            id: invitado.id,
            mesa: numeroMesa
        });

        personasEnMesa += cantidadGrupo; // aunque en realidad ya fue contado arriba
        grupoRestante = 0;
    }
  }
  
  // Guardar en backend
  try {
      const res = await fetch(`${API_URL}/invitados/asignar-mesas`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }, 
          body: JSON.stringify(asignaciones)
      });

      if (!res.ok) throw new Error("Error al guardar la asignación en el servidor.");
      alert("Mesas asignadas correctamente.");
  } catch (error) {
      console.error(error);
      alert("Hubo un error al asignar las mesas.");
  }
});  


 
document.getElementById("btnAnterior").addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    mostrarPagina(paginaActual);
  }
});
    
document.getElementById("btnSiguiente").addEventListener("click", () => {
  if ((paginaActual * cantPorPagina) < invitadosTotales.length) {
    paginaActual++;
    mostrarPagina(paginaActual);
  }
});


document.addEventListener("DOMContentLoaded", () => {
  
    if (token) {
      iniciarAplicacion({ token, API_URL, codigo });
      return;
    }
    // ❌ No logueado → mostrar popup
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    console.log("❌ No hay sesión activa, mostrando login");




});

 

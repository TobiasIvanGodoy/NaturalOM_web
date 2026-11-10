
let productos = {};
let movimientos = {};
let gastos = {};
let distribuidores = {};

let saldoInicial = 0;

let btnProducto;
let btnMovStock;
let btnGastos;
let btnDistribuidores;
let btnStats;
let seccionActual;
let saldo;
let overlay;
let sumarSaldo;

function cargarDiccionario(clave, diccionarioInicial) {
    const datoGuardado = localStorage.getItem(clave);

    if (datoGuardado === null) {
        localStorage.setItem(clave, JSON.stringify(diccionarioInicial));
        return Object.assign(Object.create(null), diccionarioInicial);
    }

    try {
        const datos = JSON.parse(datoGuardado);

        if (datos !== null && typeof datos === "object" && !Array.isArray(datos)) {
            return Object.assign(Object.create(null), datos);
        }
    } catch (error) {
        console.error(`No se pudo leer el diccionario "${clave}". Se reiniciará.`, error);
    }

    const diccionarioVacio = Object.create(null);
    localStorage.setItem(clave, JSON.stringify(diccionarioVacio));
    return diccionarioVacio;
}

function cargarDatos() {
    productos = cargarDiccionario("productos", productos);
    movimientos = cargarDiccionario("movimientos", movimientos);
    gastos = cargarDiccionario("gastos", gastos);
    distribuidores = cargarDiccionario("distribuidores", distribuidores);

    const saldoGuardado = localStorage.getItem("saldoInicial");

    if (saldoGuardado === null) {
        localStorage.setItem("saldoInicial", JSON.stringify(saldoInicial));
    } else {
        try {
            const valor = JSON.parse(saldoGuardado);
            if (Number.isFinite(Number(valor))) {
                saldoInicial = Number(valor);
            }
        } catch (error) {
            console.error("No se pudo leer el saldo inicial guardado.", error);
        }
    }
}

function guardarDatos() {
    try {
        localStorage.setItem("productos", JSON.stringify(productos));
        localStorage.setItem("movimientos", JSON.stringify(movimientos));
        localStorage.setItem("gastos", JSON.stringify(gastos));
        localStorage.setItem("distribuidores", JSON.stringify(distribuidores));
        localStorage.setItem("saldoInicial", JSON.stringify(saldoInicial));
    } catch (error) {
        console.error("No se pudieron guardar los datos en localStorage.", error);
    }
}

function obtenerDiccionario(titulo) {
    const diccionarios = {
        productos: productos,
        movimientos: movimientos,
        gastos: gastos,
        distribuidores: distribuidores
    };

    return diccionarios[titulo];
}

function generarIdRegistro(fecha, hora, diccionario) {
    const idBase = `${fecha}_${hora}`;
    let id = idBase;
    let numero = 1;

    while (Object.prototype.hasOwnProperty.call(diccionario, id)) {
        id = `${idBase}_${numero}`;
        numero++;
    }

    return id;
}

function iniciarAplicacion() {
    cargarDatos();

    btnProducto = document.getElementById("btnProducto");
    btnMovStock = document.getElementById("btnMovStock");
    btnGastos = document.getElementById("btnGastos");
    btnDistribuidores = document.getElementById("btnDistribuidores");
    btnStats = document.getElementById("btnStats");

    seccionActual = document.getElementById("seccionActual");
    saldo = document.getElementById("saldo");
    overlay = document.getElementById("overlay");
    sumarSaldo = document.getElementById("sumarSaldo");

    if (!btnProducto || !btnMovStock || !btnGastos || !btnDistribuidores ||
        !seccionActual || !saldo || !overlay || !sumarSaldo) {
        console.error("Faltan elementos HTML necesarios para iniciar la aplicación.");
        return;
    }

    saldo.style.fontSize = "2vh";

    configurarBotones();
    configurarSaldoInicial();
    mostrarbalance();
}

function configurarSaldoInicial() {
    sumarSaldo.addEventListener("click", function () {
        overlay.classList.remove("oculto");
        overlay.innerHTML = "";

        const contenedor = document.createElement("div");
        contenedor.classList.add("contenedorMenu");
        overlay.appendChild(contenedor);

        crearBtnCerrar(contenedor);

        crearCampo({
            id: "inicial",
            tipo: "number",
            placeholder: `saldo inicial actual = ${saldoInicial}`
        }, contenedor);

        const btnConfirmar = document.createElement("button");
        btnConfirmar.classList.add("btnAgregar");
        btnConfirmar.textContent = "Confirmar";
        contenedor.appendChild(btnConfirmar);

        btnConfirmar.addEventListener("click", function () {
            const valorIngresado = document.getElementById("inicial").value;

            if (valorIngresado.trim() === "" || !Number.isFinite(Number(valorIngresado))) {
                mostrarMensaje(contenedor, "Ingrese un saldo válido");
                return;
            }

            saldoInicial = Number(valorIngresado);
            guardarDatos();
            overlay.classList.add("oculto");
            mostrarbalance();
        });
    });
}

function configurarBotones() {
    const botonesAgregados = [
        {
            boton: btnProducto,
            atributos: ["producto", "precio", "cantidad", "distribuidor"],
            agregar: "Nuevo producto",
            id: "tablaProductos",
            modificarOverlay: nuevoProducto,
            titulo: "productos",
            ruta: "diseño/productos.png"
        },
        {
            boton: btnMovStock,
            atributos: ["fecha", "hora", "categoria", "producto", "cantidad", "monto"],
            agregar: "Reponer stock",
            id: "tablaMovStock",
            modificarOverlay: nuevoMovimiento,
            titulo: "movimientos",
            ruta: "diseño/mov_stock.png"
        },
        {
            boton: btnGastos,
            atributos: ["fecha", "hora", "categoria", "monto"],
            agregar: "Añadir gasto",
            id: "tablaGastos",
            modificarOverlay: nuevoGasto,
            titulo: "gastos",
            ruta: "diseño/gastos.png"
        },
        {
            boton: btnDistribuidores,
            atributos: ["distribuidor", "direccion", "pagina"],
            agregar: "Agregar distribuidor",
            id: "tablaDistribuidores",
            modificarOverlay: nuevoDistribuidor,
            titulo: "distribuidores",
            ruta: "diseño/distribuidores.png"
        }
    ];

    if (btnStats) {
        botonesAgregados.push({
            boton: btnStats,
            agregar: "Seleccionar gráfico",
            id: "tablaEstadisticas",
            modificarOverlay: nuevoGraficos,
            titulo: "graficos",
            ruta: "diseño/estadisticas.png"
        });
    }

    for (const configuracion of botonesAgregados) {
        configuracion.boton.addEventListener("click", function () {
            configuracion.boton.innerHTML = "";

            for (const otraConfiguracion of botonesAgregados) {
                if (configuracion.boton !== otraConfiguracion.boton) {
                    otraConfiguracion.boton.innerHTML = "";
                    otraConfiguracion.boton.style.backgroundColor = "white";
                    otraConfiguracion.boton.style.borderRadius = "0";

                    const img = document.createElement("img");
                    img.alt = otraConfiguracion.titulo;
                    img.src = otraConfiguracion.ruta;
                    otraConfiguracion.boton.appendChild(img);
                } else {
                    configuracion.boton.textContent = configuracion.titulo;
                    configuracion.boton.style.backgroundColor = "rgba(144, 238, 144, 0.6)";
                    configuracion.boton.style.borderRadius = "1vh";
                }
            }

            const tablaActual = document.createElement("div");
            tablaActual.id = "tablaActual";
            tablaActual.classList.add("contenedorTabla");

            const tabla = document.createElement("table");
            tabla.id = configuracion.id;

            if (configuracion.titulo !== "graficos") {
                recargarTabla(configuracion.atributos, tabla, configuracion.titulo);
            }

            tablaActual.appendChild(tabla);
            seccionActual.innerHTML = "";
            seccionActual.appendChild(tablaActual);

            const boton = document.createElement("button");
            boton.textContent = configuracion.agregar;
            boton.classList.add("btnAgregar");

            boton.addEventListener("click", function () {
                overlay.innerHTML = "";
                overlay.classList.remove("oculto");
                configuracion.modificarOverlay(
                    configuracion.atributos,
                    tabla,
                    configuracion.titulo
                );
            });

            seccionActual.appendChild(boton);

            if (configuracion.titulo === "graficos") {
                overlay.innerHTML = "";
                overlay.classList.remove("oculto");
                configuracion.modificarOverlay();
            }
        });
    }
}

function mostrarbalance() {
    let totalMovimientos = 0;
    let totalGastos = 0;

    for (const movimiento of Object.values(movimientos)) {
        totalMovimientos += Number(movimiento.monto);
    }

    for (const gasto of Object.values(gastos)) {
        totalGastos += Number(gasto.monto);
    }

    const balance = saldoInicial + totalMovimientos + totalGastos;
    saldo.textContent = `$${balance}`;
}

function recargarTabla(atributos, tabla, titulo) {
    tabla.innerHTML = "";

    const encabezado = document.createElement("tr");

    for (const atributo of atributos) {
        const columna = document.createElement("th");
        columna.textContent = atributo;
        encabezado.appendChild(columna);
    }

    tabla.appendChild(encabezado);

    const diccionario = obtenerDiccionario(titulo);

    if (!diccionario) return;

    const registros = Object.entries(diccionario);

    const ordenes = {
        productos: (a, b) => a[1].producto.localeCompare(b[1].producto),
        movimientos: (a, b) => fechaOrdenable(b[1].fecha + b[1].hora)
            .localeCompare(fechaOrdenable(a[1].fecha + a[1].hora)),
        gastos: (a, b) => fechaOrdenable(b[1].fecha + b[1].hora)
            .localeCompare(fechaOrdenable(a[1].fecha + a[1].hora)),
        distribuidores: (a, b) => a[1].distribuidor.localeCompare(b[1].distribuidor)
    };

    registros.sort(ordenes[titulo]);

    for (const [clave, registro] of registros) {
        mostrar(registro, tabla, titulo, atributos, clave);
    }

    mostrarbalance();
}

function fechaOrdenable(fecha) {
    const partes = fecha.split("-");
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

function mostrar(registro, tabla, titulo, atributos, claveRegistro) {
    const fila = document.createElement("tr");

    for (const atributo of atributos) {
        const valor = document.createElement("td");

        if (atributo === "cantidad" && titulo === "productos") {
            const div = document.createElement("div");
            div.classList.add("celda");

            const btnMenos = construirBtn(
                "restar",
                registro.producto,
                "diseño/btnMenos.png",
                "Cantidad que se vendió..."
            );

            const p = document.createElement("p");
            p.textContent = registro[atributo];

            const btnMas = construirBtn(
                "sumar",
                registro.producto,
                "diseño/btnMas.png",
                "Cantidad que entra..."
            );

            div.append(btnMenos, p, btnMas);
            valor.append(div);

        } else if (atributo === "precio") {
            const div = document.createElement("div");
            div.classList.add("celda");

            const p = document.createElement("p");
            p.textContent = registro[atributo];

            const vacio = document.createElement("p");

            const btnEditar = construirBtn(
                "precio",
                registro.producto,
                "diseño/btnEditar.png",
                "Nuevo precio..."
            );

            div.append(vacio, p, btnEditar);
            valor.append(div);

        } else if (atributo === "monto") {
            let dinero = Number(registro[atributo]);

            if (dinero >= 0) {
                valor.classList.add("ganancia");
                valor.textContent = dinero;
            } else {
                dinero = dinero * (-1);
                valor.textContent = dinero;
                valor.classList.add("gasto");
            }

        } else if (atributo === "pagina") {
            const a = document.createElement("a");
            a.href = registro[atributo];
            a.textContent = registro[atributo];
            valor.append(a);

        } else if (atributo === "hora") {
            valor.textContent = registro[atributo].slice(0, 5);

        } else {
            valor.textContent = registro[atributo];
        }

        fila.append(valor);
    }

    eliminar(fila, claveRegistro, titulo, atributos, tabla);

    tabla.appendChild(fila);
}

function crearBtnCerrar(contenedor) {
    const cerrar = document.createElement("div");
    cerrar.classList.add("contenedorRow");
    cerrar.style.justifyContent = "flex-end";
    cerrar.style.width = "100%";
    cerrar.style.height = "4vh";
    contenedor.appendChild(cerrar);

    const btnCerrar = document.createElement("button");
    btnCerrar.id = "btnCerrar";
    cerrar.appendChild(btnCerrar);

    const img = document.createElement("img");
    img.alt = "cerrar ventana";
    img.src = "diseño/btnCerrar.png";
    btnCerrar.appendChild(img);

    btnCerrar.addEventListener("click", function () {
        overlay.classList.add("oculto");
    });
}

function crearCampo(entrada, contenedor) {
    const campo = document.createElement("div");
    campo.className = "campo";

    const label = document.createElement("label");
    label.htmlFor = entrada.id;
    label.textContent = entrada.id;

    const input = document.createElement("input");
    input.id = entrada.id;
    input.type = entrada.tipo;
    input.placeholder = entrada.placeholder;

    campo.append(label, input);
    contenedor.appendChild(campo);
}

function mostrarMensaje(contenedor, texto) {
    const mensaje = document.createElement("p");
    mensaje.classList.add("info");
    mensaje.textContent = texto;
    contenedor.appendChild(mensaje);

    setTimeout(function () {
        mensaje.remove();
    }, 2000);
}

function crearSelect(id, textoPlaceholder, opciones) {
    const campo = document.createElement("div");
    campo.className = "campo";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = id;

    const select = document.createElement("select");
    select.name = id;
    select.id = id;
    select.style.width = "100%";

    const placeholder = document.createElement("option");
    placeholder.textContent = textoPlaceholder;
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);

    for (const opcion of opciones) {
        const option = document.createElement("option");
        option.textContent = opcion;
        option.value = opcion;
        select.append(option);
    }

    campo.append(label, select);
    return campo;
}

function construirBtn(tipo, producto, imagen, placeholder) {
    const boton = document.createElement("button");
    const img = document.createElement("img");

    boton.style.backgroundColor = "rgba(0, 0, 0, 0)";
    boton.style.border = "none";

    img.alt = tipo;
    img.src = imagen;
    img.style.height = "3vh";
    img.style.opacity = "80%";
    boton.append(img);

    boton.addEventListener("click", function () {
        overlay.innerHTML = "";
        overlay.classList.remove("oculto");

        const contenedor = document.createElement("div");
        contenedor.classList.add("contenedorMenu");
        overlay.appendChild(contenedor);

        crearBtnCerrar(contenedor);
        crearCampo({
            id: tipo,
            tipo: "number",
            placeholder: placeholder
        }, contenedor);

        let seleccionado = false;

        if (tipo === "restar") {
            const espacio = document.createElement("div");
            espacio.style.display = "flex";
            espacio.style.flexDirection = "row";
            espacio.style.alignItems = "center";
            espacio.style.width = "100%";
            espacio.style.gap = "1vw";

            const venta = document.createElement("button");
            venta.style.borderStyle = "solid";
            venta.style.width = "3vh";
            venta.style.aspectRatio = "1/1";
            venta.textContent = " ";

            venta.addEventListener("click", function () {
                seleccionado = !seleccionado;
                venta.style.backgroundColor = seleccionado
                    ? "rgba(144, 238, 144, 0.6)"
                    : "white";
            });

            const texto = document.createElement("p");
            texto.textContent = "Añadir venta";

            espacio.append(venta, texto);
            contenedor.append(espacio);
        }

        const btnConfirmar = document.createElement("button");
        btnConfirmar.classList.add("btnAgregar");
        btnConfirmar.textContent = "Confirmar";
        contenedor.appendChild(btnConfirmar);

        btnConfirmar.addEventListener("click", function () {
            const valorIngresado = document.getElementById(tipo).value;

            if (valorIngresado.trim() === "" || !Number.isFinite(Number(valorIngresado))) {
                mostrarMensaje(contenedor, "Ingrese un número válido");
                return;
            }

            let cantidad = Number(valorIngresado);

            if (tipo === "restar") {
                cantidad = -Math.abs(cantidad);
                operar(producto, cantidad, seleccionado);
            } else if (tipo === "sumar") {
                cantidad = Math.abs(cantidad);
                operar(producto, cantidad, false);
            } else if (tipo === "precio") {
                cambiarPrecio(producto, cantidad);
            }

            recargarTabla(
                ["producto", "precio", "cantidad", "distribuidor"],
                document.getElementById("tablaProductos"),
                "productos"
            );
        });
    });

    return boton;
}

function operar(producto, cantidad, registrarVenta) {
    const registroProducto = productos[producto];

    if (!registroProducto) {
        console.error(`No existe el producto: ${producto}`);
        overlay.classList.add("oculto");
        return;
    }

    registroProducto.cantidad = Number(registroProducto.cantidad) + cantidad;

    if (cantidad <= 0 && registrarVenta === true) {
        const fecha = obtenerFecha();
        const hora = obtenerHora();
        const cantidadVendida = Math.abs(cantidad);
        const montoTotal = Number(registroProducto.precio) * cantidadVendida;
        const id = generarIdRegistro(fecha, hora, movimientos);

        movimientos[id] = {
            fecha: fecha,
            hora: hora,
            categoria: "venta",
            producto: producto,
            cantidad: cantidadVendida,
            monto: montoTotal
        };
    }

    guardarDatos();
    overlay.classList.add("oculto");
    mostrarbalance();
}

function cambiarPrecio(producto, precioNuevo) {
    if (!productos[producto]) {
        console.error(`No existe el producto: ${producto}`);
        overlay.classList.add("oculto");
        return;
    }

    productos[producto].precio = precioNuevo;
    guardarDatos();
    overlay.classList.add("oculto");
}

function eliminar(fila, claveRegistro, titulo, atributos, tablaActual) {
    const td = document.createElement("td");
    const btnEliminar = document.createElement("button");

    btnEliminar.style.width = "100%";
    btnEliminar.style.height = "4vh";
    btnEliminar.classList.add("btnEliminar");
    td.style.backgroundColor = "rgb(255, 0, 0, 0.7)";

    const img = document.createElement("img");
    img.alt = "eliminar";
    img.src = "diseño/btnEliminar.png";
    img.style.height = "3vh";

    btnEliminar.append(img);
    td.append(btnEliminar);

    btnEliminar.addEventListener("click", function () {
        overlay.innerHTML = "";
        overlay.classList.remove("oculto");

        const contenedor = document.createElement("div");
        contenedor.classList.add("contenedorMenu");
        overlay.appendChild(contenedor);

        crearBtnCerrar(contenedor);

        const btnConfirmar = document.createElement("button");
        btnConfirmar.classList.add("btnAgregar");
        btnConfirmar.style.backgroundColor = "red";
        btnConfirmar.textContent = "Sí, eliminar";
        contenedor.appendChild(btnConfirmar);

        btnConfirmar.addEventListener("click", function () {
            eliminarElem(claveRegistro, titulo);
            overlay.classList.add("oculto");
            recargarTabla(atributos, tablaActual, titulo);
        });
    });

    fila.appendChild(td);
}

function eliminarElem(claveRegistro, titulo) {
    const diccionario = obtenerDiccionario(titulo);

    if (!diccionario || !Object.prototype.hasOwnProperty.call(diccionario, claveRegistro)) {
        return;
    }

    delete diccionario[claveRegistro];
    guardarDatos();
}

function buscarOpciones(tabla, atributo) {
    const diccionario = obtenerDiccionario(tabla);

    if (!diccionario) {
        return [];
    }

    const opciones = Object.values(diccionario).map(registro => registro[atributo]);
    return [...new Set(opciones)].sort((a, b) =>
        String(a).localeCompare(String(b), "es", { sensitivity: "base" })
    );
}

function obtenerFecha() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const anio = String(ahora.getFullYear()).slice(-2);

    return `${dia}-${mes}-${anio}`;
}

function obtenerHora() {
    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    return `${hora}:${minutos}:${segundos}`;
}

function enviarProductos(contenedor) {
    const inputProducto = document.getElementById("producto").value.trim();
    const inputCantidad = document.getElementById("cantidad").value;
    const inputPrecio = document.getElementById("precio").value;
    const inputDistribuidor = document.getElementById("distribuidores").value;

    if (!inputProducto || inputCantidad.trim() === "" || inputPrecio.trim() === "" || !inputDistribuidor) {
        mostrarMensaje(contenedor, "No se permiten campos vacíos");
        return false;
    }

    if (!Number.isFinite(Number(inputCantidad)) || !Number.isFinite(Number(inputPrecio))) {
        mostrarMensaje(contenedor, "El precio y la cantidad deben ser números válidos");
        return false;
    }

    if (Object.prototype.hasOwnProperty.call(productos, inputProducto)) {
        mostrarMensaje(contenedor, "Ya existe un producto con ese nombre");
        return false;
    }

    productos[inputProducto] = {
        producto: inputProducto,
        precio: Number(inputPrecio),
        cantidad: Number(inputCantidad),
        distribuidor: inputDistribuidor
    };

    guardarDatos();
    overlay.classList.add("oculto");
    return true;
}

function nuevoProducto(atributos, tabla, titulo) {
    const contenedor = document.createElement("div");
    contenedor.classList.add("contenedorMenu");
    overlay.appendChild(contenedor);

    crearBtnCerrar(contenedor);

    const inputs = [
        {
            id: "producto",
            tipo: "text",
            placeholder: "Ingrese el nombre del producto..."
        },
        {
            id: "precio",
            tipo: "number",
            placeholder: "Ingrese el precio..."
        },
        {
            id: "cantidad",
            tipo: "number",
            placeholder: "Ingrese el stock inicial..."
        }
    ];

    for (const entrada of inputs) {
        crearCampo(entrada, contenedor);
    }

    const campoDistribuidores = crearSelect(
        "distribuidores",
        "distribuidores agendados...",
        buscarOpciones("distribuidores", "distribuidor")
    );
    contenedor.appendChild(campoDistribuidores);

    const btnConfirmar = document.createElement("button");
    btnConfirmar.classList.add("btnAgregar");
    btnConfirmar.textContent = "Confirmar";
    contenedor.appendChild(btnConfirmar);

    btnConfirmar.addEventListener("click", function () {
        if (enviarProductos(contenedor)) {
            recargarTabla(atributos, tabla, titulo);
        }
    });
}

function enviarMovimiento(contenedor, sumarAlStock) {
    const inputProducto = document.getElementById("producto").value;
    const inputCantidad = document.getElementById("cantidad").value;
    const inputMonto = document.getElementById("monto").value;

    if (!inputProducto || inputCantidad.trim() === "" || inputMonto.trim() === "") {
        mostrarMensaje(contenedor, "No se permiten campos vacíos");
        return false;
    }

    const cantidad = Number(inputCantidad);
    const monto = Number(inputMonto);

    if (!Number.isFinite(cantidad) || !Number.isFinite(monto) || cantidad <= 0 || monto <= 0) {
        mostrarMensaje(contenedor, "La cantidad y el costo deben ser mayores que cero");
        return false;
    }

    if (!productos[inputProducto]) {
        mostrarMensaje(contenedor, "El producto seleccionado ya no existe");
        return false;
    }

    const fecha = obtenerFecha();
    const hora = obtenerHora();
    const id = generarIdRegistro(fecha, hora, movimientos);

    movimientos[id] = {
        fecha: fecha,
        hora: hora,
        categoria: "reponer",
        producto: inputProducto,
        cantidad: cantidad,
        monto: -monto
    };

    if (sumarAlStock) {
        productos[inputProducto].cantidad = Number(productos[inputProducto].cantidad) + cantidad;
    }

    guardarDatos();
    overlay.classList.add("oculto");
    mostrarbalance();
    return true;
}

function nuevoMovimiento(atributos, tabla, titulo) {
    const contenedor = document.createElement("div");
    contenedor.classList.add("contenedorMenu");
    overlay.appendChild(contenedor);

    crearBtnCerrar(contenedor);

    const campoProducto = crearSelect(
        "producto",
        "productos guardados...",
        buscarOpciones("productos", "producto")
    );
    contenedor.appendChild(campoProducto);

    const inputs = [
        {
            id: "cantidad",
            tipo: "number",
            placeholder: "Cantidad de stock repuesto..."
        },
        {
            id: "monto",
            tipo: "number",
            placeholder: "Costo de la reposición..."
        }
    ];

    for (const entrada of inputs) {
        crearCampo(entrada, contenedor);
    }

    let seleccionado = false;

    const espacio = document.createElement("div");
    espacio.style.display = "flex";
    espacio.style.flexDirection = "row";
    espacio.style.alignItems = "center";
    espacio.style.width = "100%";
    espacio.style.gap = "1vw";

    const sumar = document.createElement("button");
    sumar.style.borderStyle = "solid";
    sumar.style.width = "3vh";
    sumar.style.aspectRatio = "1/1";
    sumar.textContent = " ";

    sumar.addEventListener("click", function () {
        seleccionado = !seleccionado;
        sumar.style.backgroundColor = seleccionado
            ? "rgba(144, 238, 144, 0.6)"
            : "white";
    });

    const texto = document.createElement("p");
    texto.textContent = "Sumar en la tabla 'Productos'";

    espacio.append(sumar, texto);
    contenedor.append(espacio);

    const btnConfirmar = document.createElement("button");
    btnConfirmar.classList.add("btnAgregar");
    btnConfirmar.textContent = "Confirmar";
    contenedor.appendChild(btnConfirmar);

    btnConfirmar.addEventListener("click", function () {
        if (enviarMovimiento(contenedor, seleccionado)) {
            recargarTabla(atributos, tabla, titulo);
        }
    });
}

function enviarGasto(contenedor) {
    const inputMonto = document.getElementById("monto").value;
    const inputOtraCategoria = document.getElementById("otra").value.trim();
    const inputCategoria = document.getElementById("categoria").value;

    if (inputMonto.trim() === "" || !Number.isFinite(Number(inputMonto)) || Number(inputMonto) <= 0) {
        mostrarMensaje(contenedor, "Ingrese un monto válido mayor que cero");
        return false;
    }

    if (inputCategoria && inputOtraCategoria) {
        mostrarMensaje(contenedor, "Una categoría a la vez");
        return false;
    }

    const categoria = inputOtraCategoria || inputCategoria;

    if (!categoria) {
        mostrarMensaje(contenedor, "Seleccione o escriba una categoría");
        return false;
    }

    const fecha = obtenerFecha();
    const hora = obtenerHora();
    const id = generarIdRegistro(fecha, hora, gastos);

    gastos[id] = {
        fecha: fecha,
        hora: hora,
        categoria: categoria,
        monto: -Number(inputMonto)
    };

    guardarDatos();
    overlay.classList.add("oculto");
    mostrarbalance();
    return true;
}

function nuevoGasto(atributos, tabla, titulo) {
    const contenedor = document.createElement("div");
    contenedor.classList.add("contenedorMenu");
    overlay.appendChild(contenedor);

    crearBtnCerrar(contenedor);

    const campoCategoria = crearSelect(
        "categoria",
        "categorías registradas...",
        buscarOpciones("gastos", "categoria")
    );
    contenedor.appendChild(campoCategoria);

    const inputs = [
        {
            id: "otra",
            tipo: "text",
            placeholder: "Nueva categoría..."
        },
        {
            id: "monto",
            tipo: "number",
            placeholder: "Monto del gasto..."
        }
    ];

    for (const entrada of inputs) {
        crearCampo(entrada, contenedor);
    }

    const btnConfirmar = document.createElement("button");
    btnConfirmar.classList.add("btnAgregar");
    btnConfirmar.textContent = "Confirmar";
    contenedor.appendChild(btnConfirmar);

    btnConfirmar.addEventListener("click", function () {
        if (enviarGasto(contenedor)) {
            recargarTabla(atributos, tabla, titulo);
        }
    });
}

function enviarDistribuidor(contenedor) {
    const nombre = document.getElementById("distribuidor").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const pagina = document.getElementById("pagina").value.trim();

    if (!nombre || !direccion) {
        mostrarMensaje(contenedor, "No se permiten campos vacíos");
        return false;
    }

    if (Object.prototype.hasOwnProperty.call(distribuidores, nombre)) {
        mostrarMensaje(contenedor, "Ya existe un distribuidor con ese nombre");
        return false;
    }

    distribuidores[nombre] = {
        distribuidor: nombre,
        direccion: direccion,
        pagina: pagina
    };

    guardarDatos();
    overlay.classList.add("oculto");
    return true;
}

function nuevoDistribuidor(atributos, tabla, titulo) {
    const contenedor = document.createElement("div");
    contenedor.classList.add("contenedorMenu");
    overlay.appendChild(contenedor);

    crearBtnCerrar(contenedor);

    const inputs = [
        {
            id: "distribuidor",
            tipo: "text",
            placeholder: "Nombre del distribuidor..."
        },
        {
            id: "direccion",
            tipo: "text",
            placeholder: "Dirección del distribuidor..."
        },
        {
            id: "pagina",
            tipo: "text",
            placeholder: "Página web del distribuidor..."
        }
    ];

    for (const entrada of inputs) {
        crearCampo(entrada, contenedor);
    }

    const btnConfirmar = document.createElement("button");
    btnConfirmar.classList.add("btnAgregar");
    btnConfirmar.textContent = "Confirmar";
    contenedor.appendChild(btnConfirmar);

    btnConfirmar.addEventListener("click", function () {
        if (enviarDistribuidor(contenedor)) {
            recargarTabla(atributos, tabla, titulo);
        }
    });
}

const coloresGraficos = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
    "#FF9F40", "#C9CBCF", "#8AC926", "#1982C4", "#6A4C93"
];

function nuevoGraficos() {
    seccionActual.innerHTML = "";

    const tabla = document.createElement("div");
    tabla.id = "tablaEstadisticas";
    tabla.classList.add("contenedorTabla");
    seccionActual.appendChild(tabla);

    overlay.innerHTML = "";
    overlay.classList.remove("oculto");

    const contenedor = document.createElement("div");
    contenedor.classList.add("contenedorMenu");
    overlay.appendChild(contenedor);
    crearBtnCerrar(contenedor);

    crearGrafico(panelVentas, "Ventas", contenedor);
    crearGrafico(prodMasVendido, "Productos más vendidos", contenedor);
    crearGrafico(gastosCat, "Gastos por categoría", contenedor);
    crearGrafico(gastosHistorial, "Historial de gastos", contenedor);
}

function crearGrafico(funcion, nombre, contenedor) {
    const boton = document.createElement("button");
    boton.textContent = nombre;
    boton.classList.add("btnAgregar");

    boton.addEventListener("click", function () {
        overlay.classList.add("oculto");
        funcion();
    });

    contenedor.appendChild(boton);
}

function obtenerTablaEstadisticas() {
    let tabla = document.getElementById("tablaEstadisticas");

    if (!tabla) {
        tabla = document.createElement("div");
        tabla.id = "tablaEstadisticas";
        tabla.classList.add("contenedorTabla");
        seccionActual.appendChild(tabla);
    }

    return tabla;
}

function limpiarEstadisticas() {
    const tabla = obtenerTablaEstadisticas();
    tabla.innerHTML = "";
    return tabla;
}

function crearBotonPeriodo(tabla) {
    const boton = document.createElement("button");
    boton.classList.add("btnAgregar");
    boton.textContent = "Periodo";
    boton.style.width = "100%";

    boton.addEventListener("click", function () {
        overlay.innerHTML = "";
        overlay.classList.remove("oculto");
        panelVentas();
    });

    tabla.appendChild(boton);
}

function panelVentas() {
    overlay.innerHTML = "";
    overlay.classList.remove("oculto");

    const contenedor = document.createElement("div");
    contenedor.classList.add("contenedorMenu");
    overlay.appendChild(contenedor);
    crearBtnCerrar(contenedor);

    crearGrafico(ventas7dias, "Últimos 7 días", contenedor);
    crearGrafico(ventas5semanas, "Últimas 5 semanas", contenedor);
    crearGrafico(ventas12meses, "Últimos 12 meses", contenedor);
}

function parsearFechaRegistro(fecha) {
    if (typeof fecha !== "string") return null;

    const partes = fecha.split("-");
    if (partes.length !== 3) return null;

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    let anio = Number(partes[2]);

    if (anio < 100) anio += 2000;

    const resultado = new Date(anio, mes - 1, dia);

    if (
        !Number.isFinite(resultado.getTime()) ||
        resultado.getDate() !== dia ||
        resultado.getMonth() !== mes - 1 ||
        resultado.getFullYear() !== anio
    ) {
        return null;
    }

    resultado.setHours(0, 0, 0, 0);
    return resultado;
}

function fechaAClave(fecha) {
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = String(fecha.getFullYear()).slice(-2);

    return `${dia}-${mes}-${anio}`;
}

function fechaAEtiqueta(fecha) {
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    return `${dia}/${mes}`;
}

function obtenerHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
}

function obtenerVentas() {
    return Object.values(movimientos).filter(registro =>
        registro && registro.categoria === "venta"
    );
}

function obtenerVentasEnPeriodo(inicio, fin) {
    return obtenerVentas().filter(venta => {
        const fecha = parsearFechaRegistro(venta.fecha);
        return fecha && fecha >= inicio && fecha <= fin;
    });
}

function montoNumerico(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function formatearMoneda(valor) {
    return `$${montoNumerico(valor).toLocaleString("es-AR", {
        maximumFractionDigits: 0
    })}`;
}

function agregarTablaEstadistica(tabla, encabezados, filas) {
    const miniTabla = document.createElement("table");
    const encabezado = document.createElement("tr");

    for (const titulo of encabezados) {
        const th = document.createElement("th");
        th.textContent = titulo;
        encabezado.appendChild(th);
    }

    miniTabla.appendChild(encabezado);

    for (const valores of filas) {
        const fila = document.createElement("tr");

        for (const valor of valores) {
            const td = document.createElement("td");
            td.textContent = String(valor ?? "");
            fila.appendChild(td);
        }

        miniTabla.appendChild(fila);
    }

    tabla.appendChild(miniTabla);
    return miniTabla;
}

function crearCanvasEstadistica(tabla, altura = 360) {
    const canvas = document.createElement("canvas");

    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = `${altura}px`;
    canvas.style.margin = "1vh 0";

    tabla.appendChild(canvas);

    const anchoMedido =
        tabla.getBoundingClientRect().width ||
        tabla.clientWidth ||
        600;

    const ancho = Math.max(280, Math.floor(anchoMedido));
    const escala = window.devicePixelRatio || 1;

    canvas.width = Math.floor(ancho * escala);
    canvas.height = Math.floor(altura * escala);

    const ctx = canvas.getContext("2d");
    ctx.scale(escala, escala);

    return { canvas, ctx, ancho, alto: altura };
}

function truncarTexto(ctx, texto, anchoMaximo) {
    let resultado = String(texto);

    while (
        resultado.length > 0 &&
        ctx.measureText(resultado).width > anchoMaximo
    ) {
        resultado = resultado.slice(0, -1);
    }

    return resultado.length < String(texto).length
        ? `${resultado.slice(0, -1)}…`
        : resultado;
}

function dibujarGraficoLineal(tabla, etiquetas, valores, titulo) {
    const { ctx, ancho, alto } = crearCanvasEstadistica(tabla, 360);

    const margen = {
        arriba: 55,
        derecha: 24,
        abajo: 55,
        izquierda: 82
    };

    const anchoGrafico = ancho - margen.izquierda - margen.derecha;
    const altoGrafico = alto - margen.arriba - margen.abajo;
    const datos = valores.map(montoNumerico);

    ctx.clearRect(0, 0, ancho, alto);

    ctx.fillStyle = "#222";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(titulo, ancho / 2, 27);

    if (etiquetas.length === 0) {
        ctx.font = "14px Arial";
        ctx.fillText("Sin datos para mostrar", ancho / 2, alto / 2);
        return;
    }

    const maximo = Math.max(1, ...datos) * 1.15;

    for (let i = 0; i <= 4; i++) {
        const proporcion = i / 4;
        const y = margen.arriba + altoGrafico * proporcion;
        const valor = maximo * (1 - proporcion);

        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(margen.izquierda, y);
        ctx.lineTo(ancho - margen.derecha, y);
        ctx.stroke();

        ctx.fillStyle = "#555";
        ctx.font = "11px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        ctx.fillText(
            formatearMoneda(valor),
            margen.izquierda - 9,
            y
        );
    }

    const posiciones = datos.map((valor, indice) => ({
        x: etiquetas.length === 1
            ? margen.izquierda + anchoGrafico / 2
            : margen.izquierda +
              (indice / (etiquetas.length - 1)) * anchoGrafico,

        y: margen.arriba +
           altoGrafico -
           (valor / maximo) * altoGrafico
    }));

    if (posiciones.length > 1) {
        ctx.beginPath();

        ctx.moveTo(
            posiciones[0].x,
            margen.arriba + altoGrafico
        );

        for (const punto of posiciones) {
            ctx.lineTo(punto.x, punto.y);
        }

        ctx.lineTo(
            posiciones[posiciones.length - 1].x,
            margen.arriba + altoGrafico
        );

        ctx.closePath();
        ctx.fillStyle = "rgba(54, 162, 235, 0.12)";
        ctx.fill();
    }

    ctx.beginPath();

    posiciones.forEach((punto, indice) => {
        if (indice === 0) {
            ctx.moveTo(punto.x, punto.y);
        } else {
            ctx.lineTo(punto.x, punto.y);
        }
    });

    ctx.strokeStyle = "#36A2EB";
    ctx.lineWidth = 3;
    ctx.stroke();

    posiciones.forEach(punto => {
        ctx.beginPath();
        ctx.arc(punto.x, punto.y, 4, 0, Math.PI * 2);

        ctx.fillStyle = "#36A2EB";
        ctx.fill();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // Etiquetas del eje X.
    const salto = etiquetas.length > 10
        ? Math.ceil(etiquetas.length / 10)
        : 1;

    ctx.fillStyle = "#555";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    etiquetas.forEach((etiqueta, indice) => {
        if (
            indice % salto !== 0 &&
            indice !== etiquetas.length - 1
        ) {
            return;
        }

        ctx.fillText(
            String(etiqueta),
            posiciones[indice].x,
            alto - 20
        );
    });
}

function dibujarGraficoBarras(tabla, etiquetas, valores, titulo) {
    const altura = Math.max(320, etiquetas.length * 48 + 90);
    const { ctx, ancho, alto } = crearCanvasEstadistica(tabla, altura);

    const margen = {
        arriba: 58,
        derecha: 65,
        abajo: 22,
        izquierda: Math.min(190, ancho * 0.38)
    };

    const anchoGrafico = ancho - margen.izquierda - margen.derecha;

    const datos = valores.map(valor =>
        Math.max(0, montoNumerico(valor))
    );

    ctx.clearRect(0, 0, ancho, alto);

    ctx.fillStyle = "#222";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(titulo, ancho / 2, 27);

    if (etiquetas.length === 0) {
        ctx.font = "14px Arial";
        ctx.fillText("Sin datos para mostrar", ancho / 2, alto / 2);
        return;
    }

    const maximo = Math.max(1, ...datos) * 1.15;
    const altoFila = (alto - margen.arriba - margen.abajo) / etiquetas.length;

    for (let i = 0; i <= 4; i++) {
        const x = margen.izquierda + (anchoGrafico * i) / 4;

        ctx.strokeStyle = "#e0e0e0";
        ctx.beginPath();
        ctx.moveTo(x, margen.arriba - 8);
        ctx.lineTo(x, alto - margen.abajo);
        ctx.stroke();

        ctx.fillStyle = "#555";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            Math.round(maximo * i / 4).toLocaleString("es-AR"),
            x,
            alto - 5
        );
    }

    etiquetas.forEach((etiqueta, indice) => {
        const yCentro =
            margen.arriba +
            altoFila * indice +
            altoFila / 2;

        const anchoBarra = (datos[indice] / maximo) * anchoGrafico;

        ctx.fillStyle = "#444";
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        ctx.fillText(
            truncarTexto(ctx, etiqueta, margen.izquierda - 12),
            margen.izquierda - 10,
            yCentro
        );

        ctx.fillStyle = coloresGraficos[indice % coloresGraficos.length];

        ctx.fillRect(
            margen.izquierda,
            yCentro - Math.min(14, altoFila * 0.28),
            anchoBarra,
            Math.min(28, altoFila * 0.56)
        );

        ctx.fillStyle = "#222";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            datos[indice].toLocaleString("es-AR"),
            margen.izquierda + anchoBarra + 6,
            yCentro
        );
    });
}

function dibujarGraficoCircular(
    tabla,
    etiquetas,
    valores,
    titulo,
    formatoValores = true
) {
    const anchoMedido =
        tabla.getBoundingClientRect().width ||
        tabla.clientWidth ||
        600;

    const anchoEstimado = Math.max(280, Math.floor(anchoMedido));
    const compacto = anchoEstimado < 520;

    const altura = compacto
        ? Math.max(360, 270 + etiquetas.length * 25)
        : Math.max(360, 80 + etiquetas.length * 27);

    const { ctx, ancho, alto } = crearCanvasEstadistica(tabla, altura);

    ctx.clearRect(0, 0, ancho, alto);

    ctx.fillStyle = "#222";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(titulo, ancho / 2, 27);

    const datos = valores.map(valor =>
        Math.max(0, montoNumerico(valor))
    );

    const total = datos.reduce((suma, valor) => suma + valor, 0);

    if (total <= 0 || etiquetas.length === 0) {
        ctx.font = "14px Arial";
        ctx.fillText("Sin datos para mostrar", ancho / 2, alto / 2);
        return;
    }

    let centroX;
    let centroY;
    let radio;
    let leyendaX;
    let leyendaY;
    let anchoLeyenda;

    if (compacto) {
        centroX = ancho / 2;
        centroY = 145;
        radio = Math.min(105, ancho * 0.31);

        leyendaX = 18;
        leyendaY = 270;
        anchoLeyenda = ancho - 36;
    } else {
        centroX = ancho * 0.27;
        centroY = alto / 2 + 12;
        radio = Math.min(ancho * 0.21, (alto - 90) * 0.38);

        leyendaX = ancho * 0.53;
        leyendaY = 62;
        anchoLeyenda = ancho - leyendaX - 18;
    }

    let angulo = -Math.PI / 2;

    datos.forEach((valor, indice) => {
        if (valor <= 0) return;

        const siguiente = angulo + (valor / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centroX, centroY);
        ctx.arc(centroX, centroY, radio, angulo, siguiente);
        ctx.closePath();

        ctx.fillStyle = coloresGraficos[indice % coloresGraficos.length];
        ctx.fill();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        angulo = siguiente;
    });

    ctx.font = "11px Arial";
    ctx.textBaseline = "middle";

    etiquetas.forEach((etiqueta, indice) => {
        const y = leyendaY + indice * 25;

        if (y > alto - 12) return;

        ctx.fillStyle = coloresGraficos[indice % coloresGraficos.length];
        ctx.fillRect(leyendaX, y - 6, 12, 12);

        const porcentaje = total > 0
            ? (datos[indice] / total) * 100
            : 0;

        const valorTexto = formatoValores
            ? formatearMoneda(valores[indice])
            : montoNumerico(valores[indice]).toLocaleString("es-AR");

        const texto =
            `${etiqueta} · ${valorTexto} (${porcentaje.toFixed(1)}%)`;

        ctx.fillStyle = "#333";
        ctx.textAlign = "left";

        ctx.fillText(
            truncarTexto(ctx, texto, anchoLeyenda - 20),
            leyendaX + 19,
            y
        );
    });
}

function ventas7dias() {
    const tabla = limpiarEstadisticas();
    crearBotonPeriodo(tabla);

    const hoy = obtenerHoy();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - 6);

    const periodos = [];

    for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        periodos.push(fecha);
    }

    const ventasPeriodo = obtenerVentasEnPeriodo(inicio, hoy);
    const totales = Object.create(null);

    for (const venta of ventasPeriodo) {
        const fecha = parsearFechaRegistro(venta.fecha);
        const clave = fechaAClave(fecha);

        totales[clave] =
            (totales[clave] || 0) + montoNumerico(venta.monto);
    }

    dibujarGraficoLineal(
        tabla,
        periodos.map(fecha => fechaAEtiqueta(fecha)),
        periodos.map(fecha => totales[fechaAClave(fecha)] || 0),
        "Ventas - últimos 7 días"
    );

    const mejoresVentas = ventasPeriodo
        .slice()
        .sort((a, b) => montoNumerico(b.monto) - montoNumerico(a.monto))
        .slice(0, 10);

    agregarTablaEstadistica(
        tabla,
        ["Fecha", "Producto", "Cantidad", "Monto"],
        mejoresVentas.map(venta => [
            venta.fecha,
            venta.producto,
            venta.cantidad,
            formatearMoneda(venta.monto)
        ])
    );
}

function ventas5semanas() {
    const tabla = limpiarEstadisticas();
    crearBotonPeriodo(tabla);

    const hoy = obtenerHoy();

    const inicioPeriodo = new Date(hoy);
    inicioPeriodo.setDate(inicioPeriodo.getDate() - 34);

    const semanas = [];

    for (let i = 0; i < 5; i++) {
        const inicio = new Date(inicioPeriodo);
        inicio.setDate(inicio.getDate() + i * 7);

        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 6);

        semanas.push({
            inicio: inicio,
            fin: fin,
            total: 0
        });
    }

    const ventasPeriodo = obtenerVentasEnPeriodo(inicioPeriodo, hoy);

    for (const venta of ventasPeriodo) {
        const fecha = parsearFechaRegistro(venta.fecha);

        const semana = semanas.find(periodo =>
            fecha >= periodo.inicio && fecha <= periodo.fin
        );

        if (semana) {
            semana.total += montoNumerico(venta.monto);
        }
    }

    dibujarGraficoLineal(
        tabla,
        semanas.map(semana => fechaAEtiqueta(semana.inicio)),
        semanas.map(semana => semana.total),
        "Ventas - últimas 5 semanas"
    );

    const mejoresVentas = ventasPeriodo
        .slice()
        .sort((a, b) => montoNumerico(b.monto) - montoNumerico(a.monto))
        .slice(0, 10);

    agregarTablaEstadistica(
        tabla,
        ["Fecha", "Producto", "Cantidad", "Monto"],
        mejoresVentas.map(venta => [
            venta.fecha,
            venta.producto,
            venta.cantidad,
            formatearMoneda(venta.monto)
        ])
    );
}

function ventas12meses() {
    const tabla = limpiarEstadisticas();
    crearBotonPeriodo(tabla);

    const hoy = obtenerHoy();
    const meses = [];

    for (let i = 11; i >= 0; i--) {
        const inicio = new Date(
            hoy.getFullYear(),
            hoy.getMonth() - i,
            1
        );

        const fin = new Date(
            hoy.getFullYear(),
            hoy.getMonth() - i + 1,
            0
        );

        fin.setHours(0, 0, 0, 0);

        meses.push({
            anio: inicio.getFullYear(),
            mes: inicio.getMonth(),
            inicio: inicio,
            fin: fin,
            total: 0,
            etiqueta: `${String(inicio.getMonth() + 1).padStart(2, "0")}/${String(inicio.getFullYear()).slice(-2)}`
        });
    }

    const inicioPeriodo = meses[0].inicio;
    const ventasPeriodo = obtenerVentasEnPeriodo(inicioPeriodo, hoy);

    for (const venta of ventasPeriodo) {
        const fecha = parsearFechaRegistro(venta.fecha);

        const mes = meses.find(periodo =>
            fecha.getFullYear() === periodo.anio &&
            fecha.getMonth() === periodo.mes
        );

        if (mes) {
            mes.total += montoNumerico(venta.monto);
        }
    }

    dibujarGraficoLineal(
        tabla,
        meses.map(mes => mes.etiqueta),
        meses.map(mes => mes.total),
        "Ventas - últimos 12 meses"
    );

    const mejoresVentas = ventasPeriodo
        .slice()
        .sort((a, b) => montoNumerico(b.monto) - montoNumerico(a.monto))
        .slice(0, 10);

    agregarTablaEstadistica(
        tabla,
        ["Fecha", "Producto", "Cantidad", "Monto"],
        mejoresVentas.map(venta => [
            venta.fecha,
            venta.producto,
            venta.cantidad,
            formatearMoneda(venta.monto)
        ])
    );
}

function prodMasVendido() {
    const tabla = limpiarEstadisticas();
    const cantidades = Object.create(null);

    for (const venta of obtenerVentas()) {
        const nombre = venta.producto || "Sin nombre";

        cantidades[nombre] =
            (cantidades[nombre] || 0) + montoNumerico(venta.cantidad);
    }

    const mejores = Object.entries(cantidades)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    dibujarGraficoBarras(
        tabla,
        mejores.map(registro => registro[0]),
        mejores.map(registro => registro[1]),
        "Productos más vendidos"
    );

    const texto = document.createElement("p");
    texto.textContent = "Productos con poco stock";
    texto.style.backgroundColor = "lightcyan";
    texto.style.borderRadius = "2vh";
    texto.style.textAlign = "center";
    texto.style.paddingTop = "2vh";
    texto.style.paddingBottom = "2vh";
    tabla.appendChild(texto);

    const stock = Object.values(productos)
        .filter(producto => montoNumerico(producto.cantidad) <= 5)
        .sort((a, b) =>
            montoNumerico(a.cantidad) - montoNumerico(b.cantidad)
        );

    agregarTablaEstadistica(
        tabla,
        ["Producto", "Stock"],
        stock.map(producto => [
            producto.producto,
            producto.cantidad
        ])
    );

    valorTotalStock();
}

function valorTotalStock() {
    const tabla = obtenerTablaEstadisticas();

    const registros = Object.values(productos).map(producto => ({
        nombre: producto.producto,
        valor:
            montoNumerico(producto.precio) *
            montoNumerico(producto.cantidad)
    }));

    const valorTotal = registros.reduce(
        (total, registro) => total + registro.valor,
        0
    );

    dibujarGraficoCircular(
        tabla,
        registros.map(registro => registro.nombre),
        registros.map(registro => registro.valor),
        "Valor actual del stock por producto"
    );

    const textoTotal = document.createElement("p");
    textoTotal.textContent = `Valor total: ${formatearMoneda(valorTotal)}`;
    textoTotal.style.backgroundColor = "lightcyan";
    textoTotal.style.borderRadius = "2vh";
    textoTotal.style.textAlign = "center";
    textoTotal.style.paddingTop = "2vh";
    textoTotal.style.paddingBottom = "2vh";

    tabla.appendChild(textoTotal);
}

function gastosCat() {
    const tabla = limpiarEstadisticas();

    const hoy = obtenerHoy();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - 29);

    const categorias = Object.create(null);

    function acumular(registro) {
        const fecha = parsearFechaRegistro(registro.fecha);

        if (!fecha || fecha < inicio || fecha > hoy) {
            return;
        }

        const categoria = registro.categoria || "Sin categoría";

        categorias[categoria] =
            (categorias[categoria] || 0) +
            Math.abs(montoNumerico(registro.monto));
    }

    Object.values(gastos).forEach(acumular);

    Object.values(movimientos)
        .filter(registro =>
            registro && registro.categoria === "reponer"
        )
        .forEach(acumular);

    const nombres = Object.keys(categorias)
        .sort((a, b) => categorias[b] - categorias[a]);

    const valores = nombres.map(nombre => categorias[nombre]);

    dibujarGraficoCircular(
        tabla,
        nombres,
        valores,
        "Gastos por categoría - últimos 30 días"
    );

    agregarTablaEstadistica(
        tabla,
        ["Categoría", "Total"],
        nombres.map(nombre => [
            nombre,
            formatearMoneda(categorias[nombre])
        ])
    );
}

function gastosHistorial() {
    const tabla = limpiarEstadisticas();
    const totales = Object.create(null);

    function acumular(registro) {
        const fecha = parsearFechaRegistro(registro.fecha);

        if (!fecha) return;

        const clave =
            `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

        totales[clave] =
            (totales[clave] || 0) +
            Math.abs(montoNumerico(registro.monto));
    }

    Object.values(gastos).forEach(acumular);

    Object.values(movimientos)
        .filter(registro =>
            registro && registro.categoria === "reponer"
        )
        .forEach(acumular);

    const claves = Object.keys(totales).sort();

    const etiquetas = claves.map(clave => {
        const [anio, mes] = clave.split("-");
        return `${mes}/${anio.slice(-2)}`;
    });

    const valores = claves.map(clave => totales[clave]);

    dibujarGraficoLineal(
        tabla,
        etiquetas,
        valores,
        "Evolución mensual de gastos"
    );

    agregarTablaEstadistica(
        tabla,
        ["Mes", "Gasto"],
        etiquetas.map((etiqueta, indice) => [
            etiqueta,
            formatearMoneda(valores[indice])
        ])
    );
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarAplicacion);
} else {
    iniciarAplicacion();
}
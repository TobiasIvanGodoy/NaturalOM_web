# Aplicación web de gestión de inventario y gastos

## Sobre el proyecto

Este proyecto consiste en una versión web de una aplicación de gestión que desarrollé originalmente para Android, como una solución personalizada para una persona cercana. Por este motivo, la aplicación cuenta con funcionalidades y flujos de trabajo específicos, pensados para adaptarse a sus necesidades particulares.

A partir de esa primera versión, decidí trasladar sus funcionalidades principales al entorno web, adaptando su implementación para que pueda utilizarse directamente desde un navegador.

Además de continuar desarrollando una herramienta que ya había creado, esta adaptación tiene como objetivo hacer que el proyecto sea accesible y visible públicamente, de manera que pueda formar parte de mi portfolio y servir como muestra de mis conocimientos y habilidades de desarrollo.

La aplicación está orientada a la gestión de una actividad comercial y permite llevar un control de productos, stock, ventas, reposiciones y gastos desde un mismo lugar. Su diseño responde a necesidades prácticas concretas, en lugar de intentar abarcar todos los casos posibles de un sistema de gestión genérico.

## Funcionalidades

### Gestión de productos

Permite registrar productos indicando su nombre, precio, cantidad disponible y distribuidor asociado. Los productos se muestran en una tabla desde la cual se puede consultar el stock, modificar los precios y ajustar las cantidades disponibles.

También permite eliminar registros y seleccionar distribuidores previamente registrados.

### Control de stock y ventas

La aplicación permite incrementar o reducir las cantidades de stock de cada producto.

Al reducir el stock, se puede indicar si la operación corresponde a una venta. En ese caso, se registra automáticamente un movimiento con la fecha, la hora, el producto, la cantidad vendida y el importe calculado a partir del precio actual del producto.

También es posible registrar reposiciones de stock, indicando qué producto se repone, qué cantidad ingresa y cuál fue el costo de esa operación. Estas reposiciones pueden actualizar automáticamente el stock del producto correspondiente.

### Registro de gastos

Permite registrar gastos indicando su importe y categoría. Las categorías pueden seleccionarse entre las ya utilizadas o crearse al momento de cargar un nuevo registro.

Cada gasto queda asociado a una fecha y hora, y se incorpora al cálculo del balance general.

### Gestión de distribuidores

Incluye una sección para registrar distribuidores, con información como su nombre, dirección y página web.

Estos registros pueden asociarse posteriormente a los productos, facilitando la consulta de su procedencia.

### Balance general

La aplicación mantiene un balance que se actualiza a medida que se registran operaciones.

El cálculo parte de un saldo inicial configurable, al que se le suman los ingresos y se le restan los gastos y costos de reposición. De esta manera, permite obtener una referencia del dinero disponible según los movimientos registrados.

### Estadísticas y gráficos

La sección de estadísticas permite visualizar información sobre las operaciones mediante gráficos generados con Canvas nativo de JavaScript.

Entre las estadísticas disponibles se encuentran:

- **Ventas:** evolución de las ventas durante los últimos 7 días, las últimas 5 semanas y los últimos 12 meses. Cada período también incluye una tabla con las ventas de mayor importe.
- **Productos más vendidos:** muestra los cinco productos con mayor cantidad de unidades vendidas.
- **Productos con poco stock:** presenta los productos cuya cantidad disponible es igual o inferior a cinco unidades.
- **Valor del inventario:** muestra la distribución del valor económico del stock por producto y el valor total acumulado.
- **Gastos por categoría:** permite visualizar cómo se distribuyeron los gastos y los costos de reposición durante los últimos 30 días.
- **Historial de gastos:** muestra la evolución mensual de los gastos y las reposiciones registradas.

## Funcionamiento y almacenamiento de datos

Esta versión web está desarrollada utilizando HTML, CSS y JavaScript, sin depender de frameworks ni bibliotecas externas para la lógica principal.

La información se almacena localmente en el navegador mediante `localStorage`. Los registros se organizan en distintas estructuras de datos correspondientes a productos, movimientos, gastos y distribuidores. Para conservarlos entre sesiones, se utiliza la serialización de objetos mediante `JSON.stringify()` y su recuperación mediante `JSON.parse()`.

Esto permite que los datos sigan disponibles al cerrar o actualizar la página, sin necesidad de contar con un servidor o una base de datos externa. Como contrapartida, la información queda asociada al navegador y dispositivo utilizados, por lo que no se sincroniza automáticamente entre distintos equipos.

Los gráficos se construyen directamente sobre elementos `<canvas>`, utilizando las herramientas de dibujo que proporciona JavaScript, sin recurrir a bibliotecas como Chart.js.

## Copias de seguridad e importación de datos

La aplicación permite exportar e importar toda la información almacenada localmente mediante archivos JSON. Esta funcionalidad facilita la creación de copias de seguridad y la transferencia de datos entre distintos navegadores o dispositivos.

### Exportación de datos

Mediante el botón **Descargar backup**, se genera un archivo `.json` que contiene toda la información registrada en la aplicación:

- Productos y sus respectivos datos.
- Movimientos de stock y ventas.
- Gastos registrados y sus categorías.
- Distribuidores.
- Saldo inicial configurado.

El archivo incluye también información sobre la versión del formato y la fecha de exportación.

### Importación de datos

Mediante el botón **Cargar backup**, se puede seleccionar un archivo JSON previamente generado por la aplicación.

Antes de realizar la importación, se valida que el archivo tenga el formato y la estructura esperados. Luego se solicita una confirmación, ya que importar un backup reemplaza los datos actualmente almacenados por los contenidos en el archivo.

Una vez completada la operación, la aplicación se recarga para recuperar la información importada.

Esta funcionalidad permite mantener copias de seguridad independientes del navegador, recuperar información ante una pérdida de datos y trasladar los registros a otro dispositivo sin necesidad de utilizar un servidor o una base de datos externa.

ambos botones se encuentran en el menú de saldo inicial.

## Objetivo del desarrollo

El desarrollo de esta versión web representa una continuación de un proyecto anterior y una oportunidad para trabajar con tecnologías web sobre una aplicación con funcionalidades concretas.

El objetivo no es solamente trasladar una aplicación existente a otro entorno, sino también adaptar su estructura, resolver las particularidades del almacenamiento en navegador y construir una implementación que pueda ser utilizada y explorada directamente desde la web.

Al partir de una aplicación desarrollada para resolver necesidades reales de una persona cercana, el proyecto también permite mostrar cómo un desarrollo de software puede adaptarse a un contexto de uso específico, en lugar de limitarse a implementar funcionalidades genéricas.

El proyecto forma parte de mi proceso de aprendizaje y desarrollo personal, y busca mostrar tanto el resultado funcional de la aplicación como el trabajo realizado para llevarla desde Android hasta una versión web.

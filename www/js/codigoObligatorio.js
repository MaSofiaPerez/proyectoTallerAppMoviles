const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const NAV = document.querySelector("#nav");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGIN = document.querySelector("#pantalla-login");
const AGREGAR_PERSONA = document.querySelector("#patalla-agregar-persona");
const COMBO_DEPARTAMENTO = document.querySelector("#pantalla-agregar-persona-combo-departamento");
const COMBO_CIUDAD = document.querySelector("#pantalla-agregar-persona-combo-ciudades");
const FECHA_NAC_CENSADO = document.querySelector("#fechaNacCensado");
const COMBO_OCUPACION = document.querySelector("#pantalla-agregar-persona-combo-ocupacion");
const INPUT_FILTRO_CENSADOS = document.querySelector("#txtCensadosFiltro");
const LISTADO_CENSADOS = document.querySelector("#pantalla-listadoCensados");
const TOTAL_CENSADOS = document.querySelector("#pantalla-totalCensados");
const MAPA = document.querySelector("#pantalla-mapa");
const MAPA_INPUT_KM = document.querySelector("#map_input_km");

let departamentos = [];
let ciudades = [];
let ocupaciones = [];
let censados = [];
let censadosFiltrados = [];


let tokenUsuarioLogueado = '';
let idUsuarioLogueado = '';
let baseURL = 'https://censo.develotion.com/';

let mapita = null;
let posicionUsuario = [-34.903842, -56.1906122];

inicializar();

function inicializar() {
    actualizarMenu();
    mostrarLogin();
    suscripcionAEventos();
}

function suscripcionAEventos(){
    //Registro
    document.querySelector("#btnRegistroIngresar").addEventListener("click", btnRegistroIngresarHandler);
    //Login
    document.querySelector("#btnLoginIngresar").addEventListener("click", btnLoginIngresarHandler);
    //Ruteo
    ROUTER.addEventListener("ionRouteDidChange", navegar);
    //ionChange para que aparezcan las ciudades correspondientes
    COMBO_DEPARTAMENTO.addEventListener("ionChange", comboDepartamentoChangeHandler);
    //ionChange para que aparezcas las ocupaciones correspondientes
    FECHA_NAC_CENSADO.addEventListener("ionChange", comboOcupacionChangeHandler);
    //Agregar Personas
    document.querySelector("#btnAgregarPersona").addEventListener("click", btnAgregarPersonaHandler);
    //Productos Filtrados
    INPUT_FILTRO_CENSADOS.addEventListener("ionChange", inputFiltroCensadosHandler);

    MAPA_INPUT_KM.addEventListener("ionChange", mapaInputKmHandler);

    COMBO_OCUPACION.addEventListener("click", TituloSelectOcupaciones);
    COMBO_CIUDAD.addEventListener("click", TituloSelectCiudades);
}

function actualizarMenu(){
    //Oculto todos los botones para despues mostrar los que corresponda
    document.querySelector("#btnRegistro").style.display = "none";
    document.querySelector("#btnLogin").style.display = "none";
    document.querySelector("#btnLogout").style.display = "none";
    document.querySelector("#btnAgregarPersonaMenu").style.display = "none";
    document.querySelector("#btnListadoCensados").style.display = "none";
    document.querySelector("#btnTotalCensados").style.display = "none";
    document.querySelector("#btnMapa").style.display = "none";

    if(tokenUsuarioLogueado){
        document.querySelector("#btnAgregarPersonaMenu").style.display = "block";
        document.querySelector("#btnTotalCensados").style.display = "block";
        document.querySelector("#btnListadoCensados").style.display = "block";
        document.querySelector("#btnMapa").style.display = "block";
        document.querySelector("#btnLogout").style.display = "block";
    }else{
        document.querySelector("#btnLogin").style.display = "block";
        document.querySelector("#btnRegistro").style.display = "block";
    }
}

function ocultarPantallas(){
    //Oculto todas las pantallas
    REGISTRO.style.display = "none";
    LOGIN.style.display = "none";
    AGREGAR_PERSONA.style.display = "none";
    LISTADO_CENSADOS.style.display = "none";
    TOTAL_CENSADOS.style.display = "none";
    MAPA.style.display = "none";
}

function mostrarLogin(){
    ocultarPantallas();
    LOGIN.style.display = "block";
}

function mostrarRegistro(){
    ocultarPantallas();
    REGISTRO.style.display = "block";
}

function mostrarPantallaAgregarPersona(){
    ocultarPantallas();
    eliminarDatosPantallaAgregarPersona();
    AGREGAR_PERSONA.style.display = "block";

    fetch(baseURL + '/departamentos.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        }
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(data => {
        if(data && data.codigo == 401){
            mostrarToast('ERROR', 'Error', data.mensaje);      
        }else if(data && data.departamentos.length > 0){
            departamentos = data.departamentos;
            actualizarComboDepartamentos();
        }else{
            mostrarToast('ERROR', 'Error', 'No se han encontrado Departamentos')
        }
    }).catch(error => console.log(error));

}

function obtenerDptoXId(id){
    let dpto = null;
    let i = 0;
    while(!dpto && i< departamentos.length){

        const dptoActual = departamentos[i];
        if(dptoActual.id == id){
            dpto = dptoActual;
        }
        i++;
    }
    return dpto;
}

function actualizarComboDepartamentos(){
    let opcionesHTML = '';
    for (let i = 0; i < departamentos.length; i++){
        const departamentoActual = departamentos[i];
        opcionesHTML += `<ion-select-option value="${departamentoActual.id}">${departamentoActual.nombre}</ion-select-option>`;
    }
    COMBO_DEPARTAMENTO.innerHTML = opcionesHTML;
}

function comboDepartamentoChangeHandler(evt){
    const depto = obtenerDptoXId(evt.detail.value);
    const idDepto = depto.id;

    fetch(baseURL + `/ciudades.php?idDepartamento=${idDepto}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        }
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(data => {
        if(data && data.codigo == 401){
            mostrarToast('ERROR', 'Error', data.mensaje);      
        }else if(data && data.ciudades.length > 0){
            ciudades = data.ciudades;
            actualizarComboCiudades();
        }else{
            mostrarToast('ERROR', 'Error', 'No se han encontrado Ciudades')
        }
    }).catch(error => console.log(error));
}


function actualizarComboCiudades(){
    COMBO_CIUDAD.innerHTML = '';
    for (let i = 0; i < ciudades.length; i++){
        const ciudadActual = ciudades[i];
        COMBO_CIUDAD.innerHTML += `<ion-select-option value="${ciudadActual.id}">${ciudadActual.nombre}</ion-select-option>`;
    }

}


function mostrarPantallaListadoPersonas(){
    ocultarPantallas();
    LISTADO_CENSADOS.style.display = "block";

    fetch(baseURL + '/ocupaciones.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        }
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(data => {
        if(data && data.codigo == 401){
            mostrarToast('ERROR', 'Error', data.mensaje);      
        }else if(data && data.ocupaciones.length > 0){
            ocupaciones = data.ocupaciones;
        }else{
            mostrarToast('ERROR', 'Error', 'No se han encontrado Ocupaciones')
        }
    }).catch(error => console.log(error));
    
    fetch(baseURL + `/personas.php?idUsuario=${idUsuarioLogueado}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        },
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(data => {
        if(data && data.codigo == 401){
            mostrarToast('ERROR', 'Error', data.mensaje);     
        }else if(data && data.personas.length > 0){
            censados = data.personas;
            actualizarCensadosXOcupacion();
            mostrarListaCensados();     
        }else{
            censados = [];
            censadosFiltrados = [];
            mostrarListaCensados();
            mostrarToast('ERROR', 'Error', 'No se han encontrado censados')

        }
    }).catch(error => {console.log(error)});       
    
}


function inputFiltroCensadosHandler(){
    actualizarCensadosXOcupacion();
    mostrarListaCensados();   
}

function mostrarListaCensados(){
    console.log(censadosFiltrados.length);
    let listadoCensados = '<ion-list lines="none">';
    
        censadosFiltrados.forEach((c) => {
            listadoCensados += `
                <ion-item>
                    <ion-label><strong>Nombre:</strong> ${c.nombre}</ion-label>
                </ion-item>
                <ion-item>
                    <ion-label><strong>Fecha de Nacimiento:</strong> ${c.fechaNacimiento}</ion-label>
                    <ion-button idCenso=${c.id} id="btnEliminarDatosPersona" size="small" color="danger">Eliminar</ion-button>
                </ion-item>
                <ion-item>
                    <ion-label><strong>Ocupación:</strong> ${obtenerNombreOcupaciones(c.ocupacion)}</ion-label>
                </ion-item>
                <hr>`
        })
    
        listadoCensados += '</ion-list>'
        
        document.querySelector("#listaCensados").innerHTML = listadoCensados;
        
        const botonesEliminar = document.querySelectorAll("#btnEliminarDatosPersona");
        botonesEliminar.forEach((boton) => {
            boton.addEventListener("click", btnEliminarDatosPersonaHandler);
        })
   

}
function actualizarCensadosXOcupacion(){
    const filtradoXOcupacion = document.querySelector("#txtCensadosFiltro").value.trim().toUpperCase();
    censadosFiltrados = [];
    if(filtradoXOcupacion === ''){
        censadosFiltrados = censados;
    }else{
        for(let i = 0; i < censados.length; i++){
            const censadoActual = censados[i];  
            let ocupacionCensado = obtenerNombreOcupaciones(censadoActual.ocupacion);
            if(ocupacionCensado !== undefined && ocupacionCensado !== ''){
                if(ocupacionCensado.toUpperCase().includes(filtradoXOcupacion)){
                censadosFiltrados.push(censadoActual);
            }
        }
        }
    }
   
}

function obtenerNombreOcupaciones(id){
    let nombreOcupacion;
    for (let i = 0; i < ocupaciones.length; i++){
        const ocupacionActual = ocupaciones[i];
        if(ocupacionActual.id == id){
            nombreOcupacion = ocupacionActual.ocupacion;
            return nombreOcupacion
        }
    }
}
function btnEliminarDatosPersonaHandler(){

    btnIdCenso = this.getAttribute('idCenso');

    fetch(baseURL + `/personas.php?idCenso=${btnIdCenso}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        }      
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(datos => {
        if(datos && datos.codigo == 404){
            mostrarToast('ERROR', 'Error', datos.mensaje);
        }else if(datos && datos.codigo == 200){
            mostrarToast('SUCCESS','Proceso exitoso', datos.mensaje)
           // mostrarListaCensados();
            mostrarPantallaListadoPersonas();
          //  NAV.setRoot("page-listadoCensados");
         //   NAV.popToRoot();
        }

    })
    
}

function mostrarTotalCensados(){

    ocultarPantallas();
    TOTAL_CENSADOS.style.display = "block";

    fetch(baseURL + `/personas.php?idUsuario=${idUsuarioLogueado}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        },
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(data => {
        if(data && data.codigo == 401){
            mostrarToast('ERROR', 'Error', data.mensaje);     
        }else if(data && data.personas.length >= 0){
            censados = data.personas;
            mostrarDatosCensados();
        }
        }).catch(error => {console.log(error)});   

        }

function mostrarDatosCensados(){
    let totalCensadosMvd = 0;
    contenidoDivDatos = `
        <ion-card color="warning">
            <ion-card-header>
                <ion-card-title>${censados.length}</ion-card-title>
                <ion-card-subtitle>Tus censados hasta el momento </ion-card-subtitle>
            </ion-card-header>
          </ion-card>
          <br>
          `
    for (let i = 0; i < censados.length; i++){
        if(censados[i].ciudad == 129833){
            totalCensadosMvd++;
        }
    }
    let totalCensadosInterior = censados.length - totalCensadosMvd;

    contenidoDivDatos += `
        <ion-card color="warning">
            <ion-card-header>
                <ion-card-title>${totalCensadosMvd}</ion-card-title>
                <ion-card-subtitle>Total de censados en Montevideo</ion-card-subtitle>
            </ion-card-header>
        </ion-card>
        <br>
        <ion-card color="warning">
            <ion-card-header>
                <ion-card-title>${totalCensadosInterior}</ion-card-title>
                <ion-card-subtitle>Total censados en el Interior</ion-card-subtitle>
            </ion-card-header>
        </ion-card>
        <br>   
    `

    document.querySelector("#censadosTotales").innerHTML = contenidoDivDatos;
}

function mostrarMapa(){
    ocultarPantallas();
    MAPA.style.display = "block";
    document.querySelector("#map_input_km").value = ""; 
    inicializarMapa();

}

function verificarInicio(){
    if(tokenUsuarioLogueado){
        NAV.setRoot("page-agregar-persona");
        NAV.popToRoot();
    }else{
        NAV.setRoot("page-login")
        NAV.popToRoot();
    }
}

function cerrarMenu(){
    MENU.close();
}

function navegar(evt){
    tokenUsuarioLogueado = localStorage.getItem('APPCensoKey');
    idUsuarioLogueado = localStorage.getItem('APPCensoId');
    actualizarMenu();

    const ruta = evt.detail.to;
    if(ruta == "/"){
        verificarInicio();
    }else if(ruta == "/login"){
        mostrarLogin();
    }else if(ruta == "/registro"){
        mostrarRegistro();
    }else if (ruta == "/agregarPersona"){
        mostrarPantallaAgregarPersona();
    }else if (ruta == "/listadoCensados"){
        mostrarPantallaListadoPersonas();
    }else if (ruta == "/totalCensados"){
        mostrarTotalCensados();
    }else if (ruta == "/mapa"){
        mostrarMapa();
    }
}

function cerrarSesion(){
    cerrarMenu();
    localStorage.clear();
    tokenUsuarioLogueado = '';
    actualizarMenu();
    document.querySelector("#txtLoginUsuario").value ="";
    document.querySelector("#txtLoginPassword").value = "";
    NAV.setRoot("page-login");
    NAV.popToRoot();
}


function btnRegistroIngresarHandler(){

    const usuarioIngresado = document.querySelector("#txtRegistroUsuario").value;
    const pswIngresada = document.querySelector("#txtRegistroPassword").value;

    if(usuarioIngresado.trim().length > 0 && pswIngresada.trim().length > 0){
        let datos = {
            usuario: usuarioIngresado,
            password: pswIngresada,
        };

    fetch(baseURL + '/usuarios.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos),
    }).then(response => {
        if (response.status == 200){
            mostrarToast('SUCCESS', 'Registro exitoso', 'Ya puede iniciar sesión');
            NAV.push("page-login")
        }
        return response.json();
    }).then(data =>{
        if (data && data.codigo == 409)
        {
            mostrarToast('ERROR', 'Error', data.mensaje);
        }

            
        
    }).catch(error => console.log(error));
}else{
    mostrarToast('ERROR', 'Datos incompletos', 'Debe ingresar usuario y contraseña');
}

}





function btnAgregarPersonaHandler(){
    
    const nombreIngresado = document.querySelector("#txtNombreCensado").value;
    const dptoIngresado = document.querySelector("#pantalla-agregar-persona-combo-departamento").value;
    const ciudadIngresada = document.querySelector("#pantalla-agregar-persona-combo-ciudades").value;
    const fechaNacIngresada = document.querySelector("#fechaNacCensado").value;
    const ocupacionIngresada = document.querySelector("#pantalla-agregar-persona-combo-ocupacion").value;

    if(
        nombreIngresado.trim().length > 0 &&
        dptoIngresado.length > 0 &&
        ciudadIngresada.length > 0 &&
        fechaNacIngresada.length > 0 &&
        ocupacionIngresada != null
    ){
        let datos = {
            idUsuario: idUsuarioLogueado,
            nombre: nombreIngresado,
            departamento: dptoIngresado,
            ciudad: ciudadIngresada,
            fechaNacimiento: fechaNacIngresada,
            ocupacion: ocupacionIngresada
        }
        fetch(baseURL + '/personas.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apiKey': tokenUsuarioLogueado,
                'iduser': idUsuarioLogueado, 
            },
            body: JSON.stringify(datos),
        }).then(response => {
            if(response.status == 401){
                cerrarSesionPorFaltaDeKey();
            }else{
                return response.json();
            }
        }).then(data =>{
            if(data && data.codigo == 401){
                mostrarToast('ERROR', 'Error', data.mensaje);
            }else if(data && data.codigo == 200){
                mostrarToast('SUCCESS', 'Ingreso aprobado', data.mensaje);
                eliminarDatosPantallaAgregarPersona();
            }
            }).catch(error => console.log(error));
    }else{
        mostrarToast('ERROR', 'Error de ingreso', 'Debe completar todos los campos');
    }
}

function eliminarDatosPantallaAgregarPersona(){
    nombreIngresado = document.querySelector("#txtNombreCensado").value = "";
    dptoIngresado = document.querySelector("#pantalla-agregar-persona-combo-departamento").value = "";
    ciudadIngresada = document.querySelector("#pantalla-agregar-persona-combo-ciudades").value = "";
    fechaNacIngresada = document.querySelector("#fechaNacCensado").value = "";
    ocupacionIngresada = document.querySelector("#pantalla-agregar-persona-combo-ocupacion").value = "";
}

async function mostrarToast(tipo, titulo, mensaje){
    const toast = document.createElement('ion-toast');
    toast.header = titulo;
    toast.message = mensaje;
    toast.position = 'bottom';
    toast.duration = 2000;
    if (tipo === "ERROR") {
        toast.color = "danger";
    } else if (tipo === "SUCCESS") {
        toast.color = "success";
    } else if (tipo === "WARNING") {
        toast.color = "warning";
    }

    document.body.appendChild(toast);
    return toast.present();

}

function cerrarSesionPorFaltaDeKey(){
    mostrarToast('ERROR', 'No autorizado', 'Se ha cerrado sesión por seguridad');
    cerrarSesion();
}





























//---------------------------------------------CARGAR OCUPACIONES AL INGRESAR--------------------------------------

function btnLoginIngresarHandler(){
    const usuarioIngresado = document.querySelector("#txtLoginUsuario").value;
    const pswIngresada = document.querySelector("#txtLoginPassword").value;

    if(usuarioIngresado.trim().length > 0 && pswIngresada.trim().length > 0)
    {
        let datos = {
            usuario: usuarioIngresado,
            password: pswIngresada,
        };

        fetch(baseURL + '/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos),
        }).then(response => {
                return response.json();        
        }).then(data => {
            if(data.codigo == 409){
                mostrarToast('ERROR', 'Error', data.mensaje);
            }else if(data.codigo == 200){
                mostrarToast('SUCCESS', 'Login exitoso', '')

                tokenUsuarioLogueado = data.apiKey;
                idUsuarioLogueado = data.id;
                localStorage.setItem('APPCensoKey', tokenUsuarioLogueado);
                localStorage.setItem('APPCensoId', idUsuarioLogueado);
                CargarOcupaciones();
                CargarTodasLasCiudades();
                CargarCensados();
                actualizarMenu();
                document.querySelector("#txtLoginUsuario").value ="";
                document.querySelector("#txtLoginPassword").value = "";
                NAV.setRoot("page-agregar-persona");
                NAV.popToRoot();
            }
        }).catch(error => console.log(error));
    }else{
        mostrarToast('ERROR', 'Datos incompletos', 'Debe ingresar usuario y contraseña')
    }
}

function CargarOcupaciones()
{
    fetch(baseURL + '/ocupaciones.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        }
    }).then(response => {
        return response.json();
    }).then(data => {
            ocupaciones = data.ocupaciones;
    }).catch(error => console.log(error));
}

function CargarCensados()
{
    fetch(baseURL + `/personas.php?idUsuario=${idUsuarioLogueado}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        },
    }).then(response => {
        if(response.status == 401){
            cerrarSesionPorFaltaDeKey();
        }else{
            return response.json();
        }
    }).then(data => {   
        if(data && data.personas.length > 0){
            censados = data.personas;
        }
        }).catch(error => {console.log(error)}); 
}





let todasLasCiudades = [];
function CargarTodasLasCiudades()
{
    fetch(baseURL + '/ciudades.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apiKey': tokenUsuarioLogueado,
            'iduser': idUsuarioLogueado, 
        }
    }).then(response => {
        return response.json();
    }).then(data => {
            todasLasCiudades = data.ciudades;
            console.log(todasLasCiudades)
    }).catch(error => console.log(error));
}






function comboOcupacionChangeHandler (){
    const fechaNac = new Date(FECHA_NAC_CENSADO.value);
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNac.getFullYear(); 
    actualizarComboOcupaciones(edad);
}

function actualizarComboOcupaciones(edad){
    COMBO_OCUPACION.innerHTML = '';
    if (edad >=18){
        for (let i = 0; i < ocupaciones.length; i++){
            const ocupacionActual = ocupaciones[i];
            COMBO_OCUPACION.innerHTML += `<ion-select-option value="${ocupacionActual.id}">${ocupacionActual.ocupacion}</ion-select-option>`;
        }
    }else if(edad<18){
        for (let i = 0; i < ocupaciones.length; i++){
            const ocupacionActual = ocupaciones[i];
            if(ocupacionActual.ocupacion == 'Estudiante'){
                COMBO_OCUPACION.innerHTML += `<ion-select-option value="${ocupacionActual.id}">${ocupacionActual.ocupacion}</ion-select-option>`;
            }
        }
    } 
}


//---------------------------------------------TITULO SI NO SELECIONO DEPARTAMENTO/ FECHA --------------------------------------
function TituloSelectOcupaciones()
{
    //ingreso una fecha
    if(FECHA_NAC_CENSADO.value != "")
    {
        const customAlertOptions= {

            header: 'Elige una opcion',
           // subHeader: 'Select your favorite topping',
           // message: 'Choose only one',
            translucent: true,
          };
          COMBO_OCUPACION.interfaceOptions = customAlertOptions;
    }else{
        const customAlertOptions= {

            header: 'Ingresa una fecha antes',
          };
          COMBO_OCUPACION.interfaceOptions = customAlertOptions;
    }
}

function TituloSelectCiudades()
{
    if(COMBO_DEPARTAMENTO.value !== undefined)
    {
        const customAlertOptions= {

            header: 'Elige una opcion',
           // subHeader: 'Select your favorite topping',
           // message: 'Choose only one',
            translucent: true,
          };
          COMBO_CIUDAD.interfaceOptions = customAlertOptions;
    }else{
        const customAlertOptions= {

            header: 'Elige un departamento antes',
          };
          COMBO_CIUDAD.interfaceOptions = customAlertOptions;
    }
}

//---------------------------------------------MAPA --------------------------------------
let markers = []
function inicializarMapa() {
    if(!mapita) {
        mapita = L.map('mapa-sucursales').setView(posicionUsuario, 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(mapita);

        L.marker(posicionUsuario).addTo(mapita).bindPopup("Acá está el usuario.");
    }
    LimpiarMapa();
}
function mapaInputKmHandler()
{
    LimpiarMapa();
    const km = document.querySelector("#map_input_km").value; 
    CargarCensados();
    CiudadesEnRadio(posicionUsuario,km * 1000);
}

function LimpiarMapa()
{
    for(var i = 0; i < markers.length; i++){
        mapita.removeLayer(markers[i]);
    }
}



function CiudadesEnRadio(posUsuario, _radio)
{
    let ciudadesAdevolver =[]
    console.log(censados.length);
    for (let i = 0; i < todasLasCiudades.length; i++) {
        const element = todasLasCiudades[i];
        
        const LatLog = [element.latitud,element.longitud];
        const distancia = mapita.distance(posUsuario,LatLog);
        
        if(distancia<_radio && CensastePersonaEnCiudad(element.id))
        {
            ciudadesAdevolver.push(element);
           
        }
    }

    for (let i = 0; i < ciudadesAdevolver.length; i++) {
        const element = ciudadesAdevolver[i];
        const LatLog = [element.latitud,element.longitud];
        marker=L.marker(LatLog).addTo(mapita).bindPopup(`${element.nombre}`);
        markers.push(marker);
    }

    console.log("a devolver" + ciudadesAdevolver);
}

function CensastePersonaEnCiudad(ciudadID)
{
    console.log(censados.length);
    for (let i = 0; i < censados.length; i++) {
        const element = censados[i];
        
        if(element.ciudad === ciudadID)
            return true;
    }
   // return false;
}
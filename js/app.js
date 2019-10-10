let DB;
const form = document.querySelector('form'),
      nombreMascota = document.querySelector('#mascota'),
      nombreCliente = document.querySelector('#cliente'),
      telefono = document.querySelector('#telefono'),
      fecha = document.querySelector('#fecha'),
      hora = document.querySelector('#hora'),
      sintomas = document.querySelector('#sintomas'),
      citas = document.querySelector('#citas'),
      administra = document.querySelector('#administra');

document.addEventListener('DOMContentLoaded', ()=>{

  //Creamos base de datos
  let crearDB = window.indexedDB.open('citas', 1)
  //Ponemos uno porque es la version. Han de numerarse
  //Si ponemos más bases de datos las numeramos
  crearDB.onerror = () => {
  }
  crearDB.onsuccess = () => {
    DB = crearDB.result;

    mostrarCitas();
  }
//Metodo para crear el Schema de la base de datos
  crearDB.onupgradeneeded = function(event) {
    //el event es la propia base de datos
    let db = event.target.result;
    //definir el objecStore
    //keyPath es el indide de la base de datos
    let objectStore = db.createObjectStore('citas', { keyPath: 'key', 
    autoIncrement: true })
    //Creamos los campos

    objectStore.createIndex('mascota', 'mascota', { unique: false })
    objectStore.createIndex('cliente', 'cliente', { unique: false })
    objectStore.createIndex('telefono', 'telefono', { unique: false })
    objectStore.createIndex('fecha', 'fecha', { unique: false })
    objectStore.createIndex('hora', 'hora', { unique: false })
    objectStore.createIndex('sintomas', 'sintomas', { unique: false })
  }

  form.addEventListener('submit', agregarDatos);

  function agregarDatos(event){
    event.preventDefault();
      const nuevaCita = {
        mascota: nombreMascota.value,
        cliente: nombreCliente.value,
        telefono: telefono.value,
        fecha: fecha.value,
        hora: hora.value,
        sintomas: sintomas.value
    }

    let transaction = DB.transaction(['citas'], 'readwrite')
    let objectStore = transaction.objectStore('citas')
    let peticion = objectStore.add(nuevaCita)
    console.log(peticion)

    peticion.onsuccess = () => {
      form.reset()
    }
    transaction.oncomplete = () => {
      console.log('cita agregada')
      mostrarCitas()
    }
    transaction.onerror = () => {
      console.log('error')
    }
  }

  function mostrarCitas(){
    while(citas.firstChild){
      citas.removeChild(citas.firstChild)
    }
    let objectStore = DB.transaction('citas').objectStore('citas');
    
    objectStore.openCursor().onsuccess = function(event){
     let cursor = event.target.result; 
     console.log(cursor)
     if(cursor){
        let citaHTML = document.createElement('li')
        //Al crear el 'data-cita-id', creamos un numero de id a cada li
        citaHTML.setAttribute('data-cita-id', cursor.value.key)
        citaHTML.classList.add('list-group-item')

        citaHTML.innerHTML =
        `
        <p class='font-weight-bold'>Mascota: 
        <span class='font-weight-normail'>${cursor.value.mascota}</span></p>
        <p class='font-weight-bold'>Propietario: 
        <span class='font-weight-normail'>${cursor.value.cliente}</span></p>
        <p class='font-weight-bold'>Nº de telefono: 
        <span class='font-weight-normail'>${cursor.value.telefono}</span></p>
        <p class='font-weight-bold'>Fecha de cita: 
        <span class='font-weight-normail'>${cursor.value.fecha}</span></p>
        <p class='font-weight-bold'>Hora de cita: 
        <span class='font-weight-normail'>${cursor.value.hora}</span></p>
        <p class='font-weight-bold'>Motivo de la cita: 
        <span class='font-weight-normail'>${cursor.value.sintomas}</span></p>
        `
        const botonBorrar = document.createElement('button');
        botonBorrar.classList.add('borrar', 'btn', 'btn-danger')
        botonBorrar.innerHTML = '<span aria-hidden = "true">X</span>'
        botonBorrar.onclick = borrarCita;
        citaHTML.appendChild(botonBorrar)

        citas.appendChild(citaHTML);
        cursor.continue();
     }else{
       if(!citas.firstChild){
         administra.textContent = 'Agregar citas:'
         let listado = document.createElement('p')
         listado.classList.add('text-center');
         listado.textContent = 'No hay registros';
         citas.appendChild(listado)
       }else{
         administra.textContent = 'Administra tus citas'
       }
     }
    }
  }
  function borrarCita(event){
    //obtenemos el Id
    let citaId = Number(event.target.parentElement.getAttribute('data-cita-id'))
    let transaction = DB.transaction(['citas'], 'readwrite')
    let objectStore = transaction.objectStore('citas')
    let peticion = objectStore.delete(citaId)

    transaction.oncomplete = () => {
      event.target.parentElement.parentElement.removeChild(event.target.parentElement)

      if(!citas.firstChild){
        administra.textContent = 'Agregar citas:'
        let listado = document.createElement('p')
        listado.classList.add('text-center');
        listado.textContent = 'No hay registros';
        citas.appendChild(listado)
      }else{
        administra.textContent = 'Administra tus citas'
      }
    }
  }
})


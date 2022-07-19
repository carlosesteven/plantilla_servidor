if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask SI esta instalado.');
}else{
  console.log('MetaMask NO esta instalado.');
}

const datosActuales = document.querySelector('.datosActuales');
const mostrarCuenta = document.querySelector('.mostrarCuenta');
const actualizarDatos = document.querySelector('.actualizarDatos');
const buscarContacto = document.querySelector('.buscarContacto');

var cuenta;
var direccion, direccionAgenda;
var contrato, contratoAgenda;
var web3;


// LIBROS - BOTON: BUSCAR LIBRO
const buscarLibro = document.querySelector('.buscarLibro');

// LIBROS - VARIABLES DONDE ESTARA EL CONTRATO Y LA DIRECCIÓN DEL CONTRATO DESPLEGADA
var direccionBiblioteca, contratoBiblioteca;

// LIBROS - EVENTO QUE DETECTA CUANDO EL USUARIO HACE CLIC SOBRE EL BOTON: BUSCAR LIBRO
buscarLibro.addEventListener('click', () => {
    obtenerInformacionBiblioteca();
});


datosActuales.addEventListener('click', () => {
    obtenerInformacionActual();
});

actualizarDatos.addEventListener('click', () => {
    actualizarInformacion();
});

buscarContacto.addEventListener('click', () => {
    obtenerInformacionContacto();
});

initCuentaMetamask();

async function initCuentaMetamask()
{
  if( cuenta == undefined )
  {
    var accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    cuenta = accounts[0];
    mostrarCuenta.innerHTML = cuenta;
  }
}

async function initContratoWeb3()
{
  if( contrato == undefined || web3 == undefined )
  {
    web3 = new Web3(new Web3.providers.HttpProvider(
      "https://kovan.infura.io/v3/356c75198fd545f382789993a6784632"
    ));

    web3.eth.defaultAccount = cuenta;

    var abi = [{"inputs":[{"internalType":"string","name":"_nombre","type":"string"},{"internalType":"uint256","name":"_edad","type":"uint256"}],"name":"cambiarInformacion","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verInformacion","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

    direccion = "0x9a7d0cE1eb4d82c6b3436a60FaDbf10078546a62";
              
    contrato = new web3.eth.Contract(abi, direccion);
  }
}

async function initAgendaWeb3()
{
  if( contratoAgenda == undefined || web3 == undefined )
  {
    web3 = new Web3(new Web3.providers.HttpProvider(
      "https://kovan.infura.io/v3/356c75198fd545f382789993a6784632"
    ));

    web3.eth.defaultAccount = cuenta;

    var abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"telefono","type":"uint256"},{"indexed":false,"internalType":"string","name":"nombre","type":"string"}],"name":"nuevoContacto","type":"event"},{"inputs":[{"internalType":"string","name":"_nombre","type":"string"},{"internalType":"uint256","name":"_telefono","type":"uint256"},{"internalType":"string","name":"_email","type":"string"},{"internalType":"uint256","name":"_edad","type":"uint256"}],"name":"anadirContacto","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"mappingContactos","outputs":[{"internalType":"string","name":"nombre","type":"string"},{"internalType":"uint256","name":"telefono","type":"uint256"},{"internalType":"string","name":"email","type":"string"},{"internalType":"uint256","name":"edad","type":"uint256"},{"internalType":"bool","name":"valido","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_telefono","type":"uint256"}],"name":"obtenerContacto","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

    direccionAgenda = "0x065a7277d460384eBf4B83eF3dab55BC80024DDE";
              
    contratoAgenda = new web3.eth.Contract(abi, direccionAgenda);
  }
}

async function obtenerInformacionActual() 
{
  await initCuentaMetamask();
  
  await initContratoWeb3();
  
  var datosUsuario = await contrato.methods.verInformacion().call();
  
  $("#info").html(datosUsuario[0]+' ('+datosUsuario[1]+' años)');
}        

async function actualizarInformacion() 
{
  await initCuentaMetamask();
  
  await initContratoWeb3();

  var nombreNuevo =  $("#nombre").val();
  var edadNueva = $("#edad").val();

  if( nombreNuevo == "" || edadNueva == "" )
  {
    alert("Hay parametros en blanco");
  }else{

    $("#info").html("Autoriza la transacción en MetaMask");
    
    var parametros = {
      to: direccion, 
      from: ethereum.selectedAddress,
      data: contrato.methods.cambiarInformacion(
        nombreNuevo,
        edadNueva
      ).encodeABI(),
    };
    
    ethereum.request({
        method: "eth_sendTransaction",
        params: [parametros],
      })
        .then((result) => {
          $("#nombre").val("");
          $("#edad").val("");
          $("#info").html("Datos actualizados en el contrato.<br><br>Hash: " + result);
          console.log(result);
        })
        .catch((error) => {
          $("#info").html(error["message"]);
          console.log(error);
        }); 
  }
}

async function obtenerInformacionContacto() 
{
  await initCuentaMetamask();
  
  await initAgendaWeb3();

  try {
      var telefono = $("#telefono").val();
    
      var datosAgenda = await contratoAgenda.methods.obtenerContacto(telefono).call();
  
      $("#info2").html("- Nombre: " + datosAgenda[ 0 ] 
          + "<br>- Telefono: " + datosAgenda[ 1 ]
          + "<br>- Email: " + datosAgenda[ 2 ]
          + "<br>- Edad: " + datosAgenda[ 3 ]
      );
  } catch (error) {
      $("#info2").html( error);
      console.error(error);
  }

} 

// LIBRO - FUNCIÓN QUE INSTANCIA EL CONTRATO DE LA BIBLIOTECA
async function initBibliotecaWeb3()
{
  if( contratoBiblioteca == undefined || web3 == undefined )
  {
    // URL DEL API DE KOBAN [ BLOCKCHAIN DE PRUEBAS DE KOBAN ][ NO CAMBIAR ]
    web3 = new Web3(new Web3.providers.HttpProvider(
      "https://kovan.infura.io/v3/356c75198fd545f382789993a6784632"
    ));

    // INSTANCIA DE LA CUENTA METAMASK [ NO CAMBIAR ]
    web3.eth.defaultAccount = cuenta;

    // CODIGO ABI [ SE DEBE CAMBIAR POR DE USTEDES MISMOS ]
    var abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"_ISBN","type":"string"},{"indexed":false,"internalType":"string","name":"_titulo","type":"string"}],"name":"nuevoLibroRegistrado","type":"event"},{"inputs":[{"internalType":"string","name":"_ISBN","type":"string"},{"internalType":"string","name":"_titulo","type":"string"},{"internalType":"string","name":"_autor","type":"string"},{"internalType":"uint256","name":"_fecha","type":"uint256"}],"name":"anadirLibro","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_ISBN","type":"string"}],"name":"buscarLibro","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

    // DIRECCIÓN DEL CONTRATO DESPLEGADO  [ SE DEBE CAMBIAR POR DE USTEDES MISMOS ]
    direccionBiblioteca = "0x45f84e1aFDcA7dDa342485a1e3f42175D7a19be8";

    // OBTIENE EL CONTRATO DESPLEGADO
    contratoBiblioteca = new web3.eth.Contract(abi, direccionBiblioteca);
  }
}

// LIBRO - FUNCIÓN ENCARGADA DE CONSULTAR EL LIBRO EN EL CONTRATO
async function obtenerInformacionBiblioteca() 
{
  // VERIFICA LA CUENTA ACTUAL EN METAMASK
  await initCuentaMetamask();

  // INSTANCIA EL CONTRATO DE LOS LIBROS
  await initBibliotecaWeb3();

  try {
      // OBTIENE EL VALOR ACTUAL DE LA CAJA DE TEXTO DE LA INTERFAZ GRAFICA
      var isbn = $("#isbn").val();

      // ENVIA LA PETICIÓN AL CONTRATO Y OBTIENE EL RESULTADO
      var datosLibro = await contratoBiblioteca.methods.buscarLibro(isbn).call();

      // MUESTRA LOS DATOS OBTENIDOS EN LA INTERFAZ GRAFICA
      $("#info3").html("- ISBN: " + datosLibro[ 0 ] 
          + "<br>- Libro: " + datosLibro[ 1 ]
          + "<br>- Autor: " + datosLibro[ 2 ]
          + "<br>- Fecha: " + datosLibro[ 3 ]
      );
  } catch (error) {
      // SI OCURRRE UN ERROR, SE MUESTRA EN LA INTERFAZ GRAFICA EL PROBLEMA
      $("#info3").html( error);
      console.error(error);
  }

} 
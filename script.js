if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask SI esta instalado.');
}else{
  console.log('MetaMask NO esta instalado.');
}

const activarMetamask = document.querySelector('.activarMetamask');
const mostrarCuenta = document.querySelector('.mostrarCuenta');
const actualizarDatos = document.querySelector('.actualizarDatos');

var cuenta;
var direccion;
var contrato;
var web3;
        
activarMetamask.addEventListener('click', () => {
    obtenerCuentaMetamask();
});

actualizarDatos.addEventListener('click', () => {
    actualizarContrato();
});

initCuentaMetamask();

async function initCuentaMetamask()
{
  if( cuenta == undefined )
  {
    var accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    cuenta = accounts[0];
    mostrarCuenta.innerHTML = cuenta;
  }else{
    console.log("Ya se instancio previamente la cuenta metamask.");
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

    // CODIGO ABI DEL CONTRATO
    var abi = [{"inputs":[{"internalType":"string","name":"_nombre","type":"string"},{"internalType":"uint256","name":"_edad","type":"uint256"}],"name":"cambiarInformacion","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verInformacion","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

    // DIRECCIÓN DEL CONTRATO DESPLEGADO
    direccion = "0x9a7d0cE1eb4d82c6b3436a60FaDbf10078546a62";
              
    contrato = new web3.eth.Contract(abi, direccion);
  }else{
    console.log("Ya se instancio previamente el contrato.");
  }
}

async function obtenerCuentaMetamask() 
{
  await initCuentaMetamask();
  
  await initContratoWeb3();
  
  var datosUsuario = await contrato.methods.verInformacion().call();
  
  $("#info").html(datosUsuario[0]+' ('+datosUsuario[1]+' años)');
}        

async function actualizarContrato() 
{
  await initCuentaMetamask();
  
  await initContratoWeb3();

  web3.eth.accounts.wallet.add("811d9c41bff98f93859df0c275f0f2ec7fc36f86a717be930a1532450e8c3498");

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
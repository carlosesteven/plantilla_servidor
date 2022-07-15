if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask SI esta instalado.');
}else{
  console.log('MetaMask NO esta instalado.');
}

const activarMetamask = document.querySelector('.activarMetamask');
const mostrarCuenta = document.querySelector('.mostrarCuenta');
const actualizarDatos = document.querySelector('.actualizarDatos');

        
activarMetamask.addEventListener('click', () => {
    obtenerCuentaMetamask();
});

actualizarDatos.addEventListener('click', () => {
    alert("dddd");
});
        
async function obtenerCuentaMetamask() 
{
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  mostrarCuenta.innerHTML = account;
  
  var web3 = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/356c75198fd545f382789993a6784632"));
  
  web3.eth.defaultAccount = account;
  
  var abi = [{"inputs":[{"internalType":"string","name":"_nombre","type":"string"},{"internalType":"uint256","name":"_edad","type":"uint256"}],"name":"cambiarInformacion","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"verInformacion","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
  var direccion = "0x9a7d0cE1eb4d82c6b3436a60FaDbf10078546a62";
            
  var contrato = new web3.eth.Contract(abi, direccion);
  
  var datosUsuario = await contrato.methods.verInformacion().call();
  
  $("#info").html(datosUsuario[0]+' ('+datosUsuario[1]+' años)');
  
}        
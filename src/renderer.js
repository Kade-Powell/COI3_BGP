const { ipcRenderer } = require('electron');
//send version number to screen
const appVersion = 'Version' + require('../package.json').version;
document.getElementById('version-number').innerText = appVersion;

// create send dialog function
async function sendDialog(str) {
  await ipcRenderer.invoke('send-dialog', str);
}

//functions for copying config
function getSelectionText() {
  let selectedText = '';
  if (window.getSelection) {
    // all modern browsers and IE9+
    selectedText = window.getSelection().toString();
  }
  return selectedText;
}

function selectElementText(el) {
  let range = document.createRange(); // create new range object
  range.selectNodeContents(el); // set range to encompass desired element text
  let selection = window.getSelection(); // get Selection object from currently user selected text
  selection.removeAllRanges(); // unselect any user selected text (if any)
  selection.addRange(range); // add range to Selection object to select it
}

function copyToClipboard(elm) {
  let configDiv = document.getElementById(elm);
  selectElementText(configDiv); // select the element's text we wish to read
  let config = getSelectionText(); // read the user selection
  sendDialog('😁 The config is copied to your clipboard 😁');
  document.execCommand('copy');
}
//event listener for button click
document
  .querySelector('#copy-entire-config')
  .addEventListener('click', () => copyToClipboard('config-container'));

//emulate php word wrap function.. cant believe we like php now
function wordwrap(str, width, brk, cut) {
  brk = brk || 'n';
  width = width || 75;
  cut = cut || false;

  if (!str) {
    return str;
  }

  var regex =
    '.{1,' + width + '}(s|$)' + (cut ? '|.{' + width + '}|.+$' : '|S+?(s|$)');

  return str.match(RegExp(regex, 'g')).join(brk);
}
// show and hide input for bgp form
document
  .querySelector('#bgpFamilyV4')
  .addEventListener('click', function (event) {
    if (document.getElementById('bgpFamilyV4').checked) {
      document.getElementById('v4PeerCol').removeAttribute('hidden');
      document.getElementById('v4RouteCol').removeAttribute('hidden');
      //require
      document.getElementById('v4PeerIp').setAttribute('required', true);
      document.getElementById('v4PrefixList').setAttribute('required', true);
    } else {
      document.getElementById('v4PeerCol').setAttribute('hidden', true);
      document.getElementById('v4RouteCol').setAttribute('hidden', true);
      //remove require
      document.getElementById('v4PeerIp').removeAttribute('required');
      document.getElementById('v4PrefixList').removeAttribute('required');
    }
  });

document
  .querySelector('#bgpFamilyV6')
  .addEventListener('click', function (event) {
    if (document.getElementById('bgpFamilyV6').checked) {
      document.getElementById('v6PeerCol').removeAttribute('hidden');
      document.getElementById('v6RouteCol').removeAttribute('hidden');
      //require
      document.getElementById('v6PeerIp').setAttribute('required', true);
      document.getElementById('v6PrefixList').setAttribute('required', true);
      //require v6 gw
      document.getElementById('v6InterfaceIp').setAttribute('required', true);
    } else {
      document.getElementById('v6PeerCol').setAttribute('hidden', true);
      document.getElementById('v6RouteCol').setAttribute('hidden', true);
      //remove require
      document.getElementById('v6PeerIp').removeAttribute('required');
      document.getElementById('v6PrefixList').removeAttribute('required');
      //remove require v6 gw
      document.getElementById('v6InterfaceIp').removeAttribute('required');
    }
  });

//Clear vars to do new config
document
  .querySelector('#clearInputs')
  .addEventListener('click', function (event) {
    document.getElementById('configuratorForm').reset();
  });

//GET VARS ON SUBMIT
document
  .querySelector('#configuratorForm')
  .addEventListener('submit', function (event) {
    //service vars from form
    const SERVICE_TYPE = document.getElementById('serviceType').value;
    const IP_MTU = document.getElementById('mtu').value;
    const CIRCUIT_ID = document.getElementById('circuitId').value;
    const SERVICE_ID = document.getElementById('serviceId').value;
    const CUSTOMER_NAME = document.getElementById('customerName').value;
    const CUSTOMER_ID = document.getElementById('customerId').value;
    const SAP_LAG = document.getElementById('sapLag').value;
    const VLAN_INNER = document.getElementById('innerVlan').value;
    const COIN_SAP_EGRESS_QOS = document.getElementById('coiQos').value;

    //generate some CONSTs

    const CIRCUIT_MAC = wordwrap(`020${SERVICE_ID}`, 2, ':', true);

    let v4InterfaceIp = document.getElementById('v4InterfaceIp').value;
    const [COI_INT_IP, COI_PREFIX_LEN] = v4InterfaceIp.split('/');

    let v6InterfaceIp = document.getElementById('v6InterfaceIp').value;
    const [COI_INT_IPV6, COI_PREFIX_LENV6] = v6InterfaceIp.split('/');

    //BGP Specific from form
    const BGP_PEER_AS = document.getElementById('peerAs').value;
    const BGP_FLAVOR = document.getElementById('bgpFlavor').value;
    const BGP_KEY = document.getElementById('bgpKey').value;
    const IP_FILTER_ID = document.getElementById('filterId').value;
    const CUST_BFD = document.getElementById('custBfd').value;
    const BGP_EXPORT_FILTER = document.getElementById('exportFilter').value;
    const BGP_PEER_IP = document.getElementById('v4PeerIp').value;
    const BGP_PEER_IPV6 = document.getElementById('v6PeerIp').value;

    //GENERATE SOME VARS
    let stringV4List = document.getElementById('v4PrefixList').value;
    let stringV6List = document.getElementById('v6PrefixList').value;

    const CUSTV4_PREFIX_LIST = stringV4List.split(',').map(function (cidr) {
      return cidr.trim();
    });
    const CUSTV6_PREFIX_LIST = stringV6List.split(',').map(function (cidr) {
      return cidr.trim();
    });

    //stop execution if qod is not selected
    if (COIN_SAP_EGRESS_QOS == '') {
      sendDialog('🤬 ⚠️ You must select a QOS setting ⚠️ 🤬');
      return;
    }

    let bgpFamilyV4 = document.getElementById('bgpFamilyV4').checked;
    let bgpFamilyV6 = document.getElementById('bgpFamilyV6').checked;

    let BGP_FAMILY;
    if (bgpFamilyV4 && bgpFamilyV6) {
      BGP_FAMILY = 'BOTH';
    } else if (bgpFamilyV4) {
      BGP_FAMILY = 'V4';
    } else if (bgpFamilyV6) {
      BGP_FAMILY = 'V6';
    } else {
      //if both are false stop execution
      sendDialog('🤬⚠️ You must include either v4 or v6 routes⚠️ 🤬');
      return;
    }

    //NOW DO WORK display new window with config prob
    //build the arguement variable
    let args = {
      SERVICE_TYPE,
      IP_MTU,
      CIRCUIT_ID,
      SERVICE_ID,
      CUSTOMER_NAME,
      CUSTOMER_ID,
      SAP_LAG,
      VLAN_INNER,
      COIN_SAP_EGRESS_QOS,
      CIRCUIT_MAC,
      COI_INT_IP,
      COI_PREFIX_LEN,
      COI_INT_IPV6,
      COI_PREFIX_LENV6,
      BGP_PEER_AS,
      BGP_FLAVOR,
      BGP_KEY,
      IP_FILTER_ID,
      CUST_BFD,
      BGP_EXPORT_FILTER,
      BGP_PEER_IP,
      BGP_PEER_IPV6,
      CUSTV4_PREFIX_LIST,
      CUSTV6_PREFIX_LIST,
      BGP_FAMILY,
    };
    //Send variables to index.js and wait for the templated return

    ipcRenderer.invoke('build-config', args).then((result) => {
      document.getElementById('config-container').innerText = result;
    });

    //after recieving the data into the modal click the modal toggle button to display config
    let launchModal = document.getElementById('modalToggle');
    launchModal.click();
    //show the modal and clear input button
    document.getElementById('modalToggle').removeAttribute('hidden');
    document.getElementById('clearInputs').removeAttribute('hidden');
  });

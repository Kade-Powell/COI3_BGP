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
    const BGP_DEFAULT = document.getElementById('bgpDefault').value;
    const BGP_EXPORT_FILTER = document.getElementById('exportFilter').value;
    const BGP_PEER_IP = document.getElementById('v4PeerIp').value;
    const BGP_PEER_IPV6 = document.getElementById('v6PeerIp').value;
    const CUSTV4_PREFIX_LIST = document.getElementById('v4PrefixList').value;
    const CUSTV6_PREFIX_LIST = document.getElementById('v6PrefixList').value;

    //GENERATE SOME BOOLEAN CONST
    let bgpFamilyV4 = document.getElementById('bgpFamilyV4').checked;
    let bgpFamilyV6 = document.getElementById('bgpFamilyV6').checked;

    let BGP_FAMILY;
    if (bgpFamilyV4 && bgpFamilyV6) {
      BGP_FAMILY = 'BOTH';
    } else if (bgpFamilyV4) {
      BGP_FAMILY = 'V4';
    } else {
      //V6 only
      BGP_FAMILY = 'V6';
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
      BGP_DEFAULT,
      BGP_EXPORT_FILTER,
      BGP_PEER_IP,
      BGP_PEER_IPV6,
      CUSTV4_PREFIX_LIST,
      CUSTV6_PREFIX_LIST,
      BGP_FAMILY,
    };
    //Send variables to index.js and wait for the templated return
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('build-config', args).then((result) => {
      document.getElementById('modal-body').innerText = result;
    });

    //after recieving the data into the modal click the modal toggle button to display config
    let launchModal = document.getElementById('modalToggle');
    launchModal.click();
    //show the modal and clear input button
    document.getElementById('modalToggle').removeAttribute('hidden');
    document.getElementById('clearInputs').removeAttribute('hidden');
  });

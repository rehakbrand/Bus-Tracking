mapboxgl.accessToken = 'pk.eyJ1IjoiZXZrYXNzIiwiYSI6ImNrcHJkbjlmaDBzanUycXM0NmZiMDFuYWQifQ.cg4BTy_l8rfx-7le_VmG9Q';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.104081, 42.365554],
  zoom: 14,
});

async function fetchBuses(){
  const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
  const response = await fetch(url);
  const json     = await response.json();
  return json.data;
}

const displayedBuses = {};

async function start(){
  const busesUl = document.getElementById('buses');
  const data = await fetchBuses();
  for (let i in data) {
    const bus = data[i];
    const busLi = document.createElement('li');
      const busLabel = document.createElement('span');
      busLabel.innerHTML = 'Bus: ' + bus.attributes.label;
      busLi.appendChild(busLabel);


      const busButton = document.createElement('button');
      busButton.innerText =  'Show Route';
    
      busButton.onclick = () => {
        if (!displayedBuses[bus.attributes.label]) {
          busButton.innerText = 'Hide Route';
          busButton.className = 'hide';
          displayBus(bus.attributes.label);
        } else {
          busButton.innerText = 'Show Route';
          busButton.className = '';
          hideBus(bus.attributes.label);
        }
      }
      busLi.appendChild(busButton);
    busesUl.appendChild(busLi);
  }
}

async function updateMarker(marker, label) {
  const route = await fetchBusRoute(label);

  marker.setLngLat({ lng: route.attributes.longitude, lat: route.attributes.latitude });
}

const markerEl = document.createElement('img');
markerEl.src = 'bus.jpg';
markerEl.width = 40;

async function displayBus(label) {
  if (!displayedBuses[label]) {
    const route = await fetchBusRoute(label);  

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(label);

    const marker = new mapboxgl.Marker(markerEl)
      .setPopup(popup)  
      .setLngLat({ lng: route.attributes.longitude, lat: route.attributes.latitude })
      .addTo(map);

    displayedBuses[label] = {
      marker: marker,
      interval: setInterval(() => {
        updateMarker(marker, label);
      }, 15000)
    }
  }
  
}

function hideBus(label) {
  if (displayedBuses[label]) {
    displayedBuses[label].marker.remove();
    clearInterval(displayedBuses[label].interval);
    displayedBuses[label] = false;
  }
}

async function fetchBusRoute(label) {
  const url = 'https://api-v3.mbta.com/vehicles/y' + label;
  const response = await fetch(url);
  const json     = await response.json();
  return json.data;
}

start();

var map = L.map('map').setView([-4.376902183242502, 15.261079574189854], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
fetch('/attractions')
.then(response => {
    if (response.ok) return response.json()
})
.then(data => {
    for (let i = 0; i < data.length; i++) {
        let marker = L.marker([data[i].location.latitude,data[i].location.longitude ]).addTo(map);
        console.log(i,data[i].name)
    }
   
    
})

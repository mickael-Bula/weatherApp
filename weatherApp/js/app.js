const app = {
    
    init: function()
    {
        app.form.addEventListener("submit", app.handleSubmit);
        app.city.addEventListener("click", app.handleClick);        
        app.main();
    },
    
    form: document.querySelector(".form"),

    city: document.querySelector("#ville"),
    
    fetchOptions: {
        method: 'GET',
        mode:   'cors',
        cache:  'no-cache'
    },

    // je déclare la fonction main() comme asynchrone. Va permettre aux briques qui la compose d'utiliser await pour ne stocker dans la variable que la réponse finale de la requête
    main: async function(city=null) 
    {
        let latitude, longitude, cityData;

        if( !city) {        // si aucune ville n'est renseignée on utilise l'adresse IP
            const ip = await app.getIp();
                
            // on récupère les coordonnées géographique en fonction de l'adresse IP
            cityData = await app.getCity(ip);

            // j'entoure le destructuring de parenthèses pour que la partie gauche ne soit pas considérée comme un bloc
            ({ city, latitude, longitude } = cityData);
        } else {
            cityData = await app.getCoordinates(city);
            
            // je renomme les variables reçues par destructuration ({ancien_nom: nouveau_nom})
            ({ name: city, lat: latitude, lon: longitude } = cityData[0]);
        }
        console.log(city, longitude, latitude);
            
        // on récupère ensuite les données météo sur l'API openweathermap
        const meteo_response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${config.APIKey}&lang=fr&units=metric`, app.fetchOptions);
        const meteo = await meteo_response.json();
        console.log(meteo);
        
        // on affiche les données
        this.displayWeatherInfos(meteo);
    },
    
    getIp: async function() {
        // récupération de l'adresse IP de l'utilisateur par l'intermédiaire de l'API ipify
        const response = await fetch('https://api.ipify.org?format=json', app.fetchOptions);
        const response_json = await response.json();
        return response_json.ip;
    },
    
    getCity: async function(ip) {
        const myHeaders = new Headers();
        myHeaders.append("apikey", config.ip_APIKey);

        const requestOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: myHeaders
          };
          
        // on récupère les coordonnées géographique en fonction de l'adresse IP grâce à l'API apilayer (https://apilayer.com/marketplace/ip_to_location-api)
        const city_response = await fetch(`https://api.apilayer.com/ip_to_location/${ip}`, requestOptions);
        return await city_response.json();
    },

    getCoordinates: async function(city) {
        // récupération des coordonnées d'une ville à partir de son nom
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${config.APIKey}`);
        return await response.json();
    },
    
    displayWeatherInfos: function(data)
    {
        const name = data.name;
        const country = data.sys.country;
        const temperature = data.main.temp;
        const description = data.weather[0].description;
        const weather = data.weather;
        const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;
        
        document.querySelector(".city-name").dataset.name = `${name}, ${country}`;
        document.querySelector(".city-name__name").textContent = name;
        document.querySelector(".city-name__country").textContent = country;
        document.querySelector(".city-temp").textContent = Math.round(temperature) + "";
        document.querySelector(".city-icon").src = icon;
        document.querySelector(".city-icon").alt = description;
        document.querySelector(".city-icon__description").textContent = description;
    },

    handleSubmit: function(event) {
        event.preventDefault();
        // On exécute la méthode main() en lui transmettant la ville saisie en paramètre
        app.main(app.city.value);
        app.form.reset();
        app.city.focus();
    },
    
    // bonus UX : au clic on vide le champ de l'input en vue d'une nouvelle saisie
    handleClick: function()
    {
        app.form.reset();
        app.city.focus();        
    },
    
    capitalize: function(str)
    {
        // émulation de la fonction Capitalize() de Python avec gestion des éventuels espaces. Remplace la 1ere lettre à l'aide d'une callback c => c.toUpperCase()
        // str.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
        return str[0].toUpperCase() + str.slice(1);
    }
};

document.addEventListener('DOMContentLoaded', app.init);

// TODO : utiliser les données de géolocalisation plutôt que l'ip : c'est non seulement une bonne pratique mais cela prend aussi en compte l'éventuelle utilisation d'un VPN
// compléter les conditions météo
// créer des thèmes pour les photos (mangas par exemple)
// compléter les infos météo (taux d'humidité...)
// créer des animations sur les icones (voir doc)
// ajouter des villes en favoris
// ajouter une carte du pays, cliquable et qui zoome sur la région et affiche dynamiquement les conditions (utiliser openweathermap et géoloc)
// ajouter Bootstrap pour ajouter le responsive facilement

// TODO : adapter ce code - une fois fonctionnel - à un design plus moderne, avec le tuto tutsplus (https://webdesign.tutsplus.com/tutorials/build-a-simple-weather-app-with-vanilla-javascript--cms-33893)
// TODO : ajouter les prévisions à 5 jours (https://openweathermap.org/forecast5)
(function () {
    var storesData = [
        {
            id: "c4ca4238a0b923820dcc509a6f75849b",
            name: "VIP Billiards on College",
            telephone: "4161234567",
            // googleMapUrl: "https://goo.gl/maps/rva2rSACQR8347pE9",
            googleMapUrl: "https://www.bbc.com/",
            address: "842 College St, Toronto, ON M6H 1A2",
            coordinates: {
                latitude: 43.65444014568791,
                longitude: -79.42329143466088,
            },
        },
        {
            id: "c81e728d9d4c2f636f067f89cc14862c",
            name: "VIP Billiards and Lounge",
            telephone: "4169283820",
            address: "3030 Don Mills Rd E, North York, ON M2J 3C1",
            // googleMapUrl: "https://goo.gl/maps/5zLEN8NBy6QbxujU9",
            googleMapUrl: "https://outlook.live.com/owa/",
            coordinates: {
                latitude: 43.785660243798894,
                longitude: -79.35176307265208,
            },
        },
        {
            id: "eccbc87e4b5ce2fe28308fd9f2a7baf3",
            name: "Long & McQuade Musical Instruments",
            telephone: "4169280394",
            address: "925 Bloor St W, Toronto, ON M6H 1L5, Canada",
            // googleMapUrl: "https://goo.gl/maps/QW4bPQYWp4RUpCpY9",
            googleMapUrl: "https://www.yahoo.com",
            coordinates: {
                latitude: 43.661497110634144,
                longitude: -79.42714916620164,
            },
        },
    ];

    var locationList = storesData.map((store) => store.coordinates);
    var eleStoreLocationDisplayText = document.querySelector("#store-location-display-text");
    var eleStoreLocationSelection = document.querySelector("#store-location-selection");
    var eleCallBtn = document.querySelector("#call-btn");
    var eleAddressBtn = document.querySelector("#address-btn");

    // Methods are in below
    var utils = {
        getCookie: function (name) {
            let matches = document.cookie.match(
                new RegExp(
                    "(?:^|; )" +
                        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
                        "=([^;]*)"
                )
            );
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        setCookie: function (name, value, options = {}) {
            options = {
                path: "/",
                // add other defaults here if necessary
                ...options,
            };

            if (options.expires instanceof Date) {
                options.expires = options.expires.toUTCString();
            }

            let updatedCookie =
                encodeURIComponent(name) + "=" + encodeURIComponent(value);

            for (let optionKey in options) {
                updatedCookie += "; " + optionKey;
                let optionValue = options[optionKey];
                if (optionValue !== true) {
                    updatedCookie += "=" + optionValue;
                }
            }

            document.cookie = updatedCookie;
        },
        deleteCookie: function (name) {
            setCookie(name, "", {
                "max-age": -1,
            });
        },
    };

    function getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
            console.log("getCurrentLocation in progress...");
        } else {
            selectOption(storesData[1].id);
            console.log("Your browser does not support geolocation API");
        }
    }

    function successHandler(position) {
        if (!position) {
            return;
        }
        var currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            // lat: 43.77845682255775,
            // lng: -79.25761757554793,
        };
        console.log("successHandler - currentPosition:", currentPosition);
        getNearestStore(currentPosition.lat, currentPosition.lng);
    }

    function errorHandler() {
        selectOption(storesData[1].id);
        console.log("getCurrentLocation failed or no location allowed.");
    }

    function getNearestStore(lat, lng) {
        var nearestStore = geolib.findNearest({ latitude: lat, longitude: lng }, locationList);
        console.log("nearestStore: ", nearestStore);

        var thisDistance = geolib.getPreciseDistance({ latitude: lat, longitude: lng }, nearestStore);
        console.log("How Far by KM: ", geolib.convertDistance(thisDistance, "km"));

        var result = storesData.find((item) => {
            return (item.coordinates.latitude === nearestStore.latitude && item.coordinates.longitude === nearestStore.longitude);
        });
        selectOption(result.id);
        console.log("result: ", result);
        console.log("Option: ", result.name + " - " + result.address);
    };

    function generateStoreOptions() {
        storesData.map((store) => {
            var newOption = document.createElement("option");
            newOption.value = store.id;
            newOption.innerText = store.name + " - " + store.address;
            eleStoreLocationSelection.appendChild(newOption);
        });
    }

    function dataPopulate(id) {
        var result = storesData.find((item) => item.id === id);
        eleStoreLocationDisplayText.innerText = result.name + " - " + result.address;
        eleCallBtn.setAttribute("data-url", "tel:" + result.telephone);
        eleAddressBtn.setAttribute("data-url", result.googleMapUrl);
        utils.setCookie("hasLocationSelected", result.id, {
            secure: true,
            "max-age": 3600*24*365.2425,
        });
        console.log("Object: ", result);
        console.log("hasLocationSelected:", result.id);
    }

    function selectionEventHandler() {
        eleStoreLocationSelection.addEventListener("change", function (event) {
            dataPopulate(event.target.value);
        }, false);
    }

    function selectOption(id) {
        var eleOptions = eleStoreLocationSelection.querySelectorAll("option");
        eleOptions.forEach(function (option) {
            if (option.value === id) {
                option.selected = true;
            }
        });
        console.log("selectOption: ", id);

        // Trigger an event on targeted element
        var event = new Event("change");
        eleStoreLocationSelection.dispatchEvent(event);
    }

    function actionBtnsEventHandler() {
        var btns = [eleCallBtn, eleAddressBtn];
        btns.forEach(function (btn) {
            btn.addEventListener("click", function (event) {
                open(event.target.getAttribute("data-url"), "_blank");
            }, false);
        });
    }

    function scriptInjection() {
        var script = document.createElement("script");
        script.setAttribute("src", "https://unpkg.com/geolib@3.3.3/lib/index.js");
        script.setAttribute("async", "");
        script.onload = function () {
            console.log("script has loaded");
            console.log("geolib: ", geolib);
            getCurrentLocation();
        };
        document.head.appendChild(script);
    }

    function initialize() {
        generateStoreOptions();
        selectionEventHandler();
        actionBtnsEventHandler();

        if (utils.getCookie("hasLocationSelected")) {
            selectOption(utils.getCookie("hasLocationSelected"));
            return;
        }

        scriptInjection();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(function () {
            initialize();
        }, 1000);
    }, false);

})();

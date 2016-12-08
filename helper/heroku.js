const http = require("http");

function keepAlive() {
    
    console.log(`starting loop ${Date.now()} ${process.env.redirectUri}`);
    setInterval(function () {
        console.log(`sending ping ${Date.now()} ${process.env.redirectUri}`);
        http.get(process.env.redirectUri);
    }, 300000); // every 5 minutes (300000)
}


module.exports = {
    keepAlive: keepAlive
}
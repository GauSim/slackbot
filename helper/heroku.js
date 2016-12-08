const http = require("http");

function keepAlive() {

    console.log(`starting loop ${Date.now()} ${process.env.pingURL}`);
    setInterval(function () {
        console.log(`sending ping ${Date.now()} ${process.env.pingURL}`);

        try {
            if (process.env.pingURL) {
                http.get(process.env.pingURL);
            } else {
                console.error('process.env.pingURL missing');
            }
        } catch (ex) {
            console.error(er);
        }

    }, 300000); // every 5 minutes (300000)
}


module.exports = {
    keepAlive: keepAlive
}
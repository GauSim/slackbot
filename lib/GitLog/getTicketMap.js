const exec = require('child_process').exec;

const runCommandAsync = (cmd) => new Promise((ok, fail) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            fail(`[exec] error: ${error}`);
            return;
        }
        ok(stdout);
    });
});

function formatLine(ticket, date, msg) {
    msg = msg.replace('[', '').replace(']', '').replace(ticket, '').trim();
    return `${date} | ` + (msg.length > 50 ? msg.substr(0, 47) + '...' : msg);
}

function getTicketMap(upToHash) {
    const since = '--since="2016-01-01"'; // random date for limit
    const take = 1250; // limit
    const propDelimiter = '|§|';

    const cmd = `git pull && git log ${upToHash} ${since} -n ${take} --no-merges --grep="CPB-" --pretty=format:'%cr${propDelimiter}%s${propDelimiter}%H' | grep -v "Merge"`;


    // todo make this work with streams => Emitter, Rx?
    return runCommandAsync(cmd)
        .then(commitLogs => {

            const ticketCommitMap = {};

            commitLogs.split('\n')
                .filter(it => !!it && it.indexOf(propDelimiter) > -1)
                .forEach(commitLine => {
                    const [date, msg, hash] = commitLine.split(propDelimiter);

                    let matches = msg.match(/CPB.[0-9][0-9][0-9][0-9][0-9]/i); // find 5 diget CPBs
                    matches = matches ? matches : msg.match(/CPB.[0-9][0-9][0-9][0-9]/i); // find 4 diget CPBs

                    const ticket = matches ? matches[0].toUpperCase().replace(' ', '-') : 'UNKNOWN';

                    // flatten & uniqe by ticket & hashes
                    if (ticketCommitMap[ticket]) {
                        ticketCommitMap[ticket][hash] = formatLine(ticket, date, msg);
                    } else {
                        ticketCommitMap[ticket] = { [hash]: formatLine(ticket, date, msg) };
                    }

                });

            return ticketCommitMap;
        });
}

const currentHash = 'd105ae67bac68f318cc594d7ce1df3dc70458ccd';
// test
// qt 3cf85c90679d0e6f58977c9f1d79b63ba964fd19 => 596
// prod d105ae67bac68f318cc594d7ce1df3dc70458ccd => 553
// master 74ebcdd55abb16ce1fc44461149c49bd2da7946b => 599

getTicketMap(currentHash)
    .then(ticketMap => {

        // console.log(mapOfTicketsToItems['UNKNOWN']);
        // const tickets = Object.keys(ticketMap).filter(e => e != 'UNKNOWN');

        console.log(tickets);
        console.log(`ticket count: ${tickets.length}`);
    })
    .catch(error => console.error(error + '<<< error'))
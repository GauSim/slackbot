import _ = require('lodash');
import request = require('request-promise-native');
import cheerio = require('cheerio');

const YES = [
    "drop it like it's hot!",
    "kein ding für'n king",
    'Alter vollkrass!',
    'yo, yo, yo!',
    '...Läuft bei dir!',
    'si',
    'was labers du?',
    'Ahoi!',
    'woop woop,',
    'ja, freilich Digga!',
    'yes homie!',
    'yo, hab bock!',
    'auf jeden',
    'I bims'
]

const FUNNY_STUFF = [
    `print('Hello world!')`,
    `\n010000100110010100100000011100110111010101110010011001
010010000001110100011011110010000001100100011100100110
100101101110011010110010000001111001011011110111010101
110010001000000100111101110110011000010110110001110100
01101001011011100110010100101110\n\n`,
    `\nLoading Infinite Monkeys....\n
Monkey 1....................Loaded\n
Monkey 2....................Loaded\n
Monkey 3....................Loaded\n
Monkey 4....................Loaded\n
Monkey 5....................Loaded\n
Monkey 6....................Loaded\n
Monkey 7....................Loaded\n
Monkey 8........`,
    `\nA fatal exception 0E has occurred at 0028:C0011E in VXD VMM(01) +00010E36...

No, let me think. 00010F24...

Wait a minute. 

Where the hell was that? 

Yeah, found: 00020EFF.

Damn it, ... lost it again. Searching......

Wanna play chess?`,
    `INITIALIZING UNIX COMMANDS:
unzip...
strip...
touch...
finger...
mount...
fsck...
more...
yes...
unmount...
sleep...
...READY.`,
    '... thinking',
    '... kernel panic',
    '... knock knock?',
    '... 640K ought to be enough for anybody',
    '... would you prefer chicken, steak, or tofu?',
    '... pay no attention to the man behind the curtain',
    '... and enjoy the elevator music',
    '... while the little elves draw your map',
    `... a few bits tried to escape, but i'll caught them`,
    '... and dream of faster computers',
    '... would you like fries with that?',
    '... checking the gravitational constant in your locale',
    '... go ahead -- hold your breath',
    '... the server is powered by a lemon and two electrodes',
    '... while a larger software vendor in Seattle takes over the world',
    `... testing your patience`,
    `... don't think of purple hippos`,
    `... I'm follow the white rabbit`,
    '... while the satellite moves into position',
    '... the bits are flowing slowly today',
    `... dig on the 'X' for buried treasure... ARRR!`,
    `... it's still faster than you could do it`,
    '... waiting for the system admin to hit enter.',
    '... warming up the processors',
    '... reconfiguring the office coffee machine',
    '... working on it - no, just kidding.',
    '... prepare for awesomeness!',
    '... searching for WiFi',
    '... waiting for approval from Bill Gates',
    '... adding random changes to your data',
    '... caching internet locally 64% done',
    '... creating universe (this may take some time)',
    '... waking up the AI... [Error: COFFEE_BIT not set]',
    '... loading loading messages',
    '... centralizing the processing units',
    '... randomizing memory access',
    '... going to DEFCON 1',
    '... waiting for magic to happen',
    '... accommodating poor back-end SQL query. Please wait...',
    '... computing 6 x 9',
    '... time is relative',
    '... buying the world a Coke'
];

export function getSomethingSmart(input: string, reply: (msg: string) => void) {
    const url = 'http://webknox.com/' + encodeURIComponent(input);
    console.log('GET', url)
    request.get(url)
        .then((response: string) => {
            const $ = cheerio.load(response)
            const elm = $('.answerBox');

            const answer = (elm ? elm.text() : '' as string || '').trim();
            const crap = "I understand the question but I don't know the answer."
            reply(
                answer != crap
                    ? answer
                    : (_(FUNNY_STUFF).sample() || '')
            );
        })
        .catch(e => {
            console.error(`ERROR [getRandomJoke] ${JSON.stringify(e, null, 2)}`);
        });
}


export function getRandomMsg(reply: (msg: string) => void) {

    reply(
        (Math.floor((Math.random() * 2) + 1) ? _(YES).sample() + '   ' : '')
        + _(FUNNY_STUFF).sample()
    );
}


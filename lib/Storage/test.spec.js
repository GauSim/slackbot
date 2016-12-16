/*
Tests for storage modules.
This file currently test simple_storage.js, redis_storage, and firebase_storage.

If you build a new storage module,
you must add it to this test file before your PR will be considered.
How to add it to this test file:

Add the following to the bottom of this file:

// Test <your_storage_module>
<your_storage_module> = require('./<your_storage_module>.js')(<appropriate config object for your storage module>);
check(<your_storage_module>.users);
check(<your_storage_module>.channels);
check(<your_storage_module>.teams);
*/

const Storage = require('./index');
const test = require('unit.js');


describe('Storage', () => {


    const testStorageMethod = function (storageMethod) {

        testObj0 = { id: 'TEST0', foo: 'bar0' };
        testObj1 = { id: 'TEST1', foo: 'bar1' };

        return new Promise((ok, fail) => {
            storageMethod.save(testObj0, function (err) {

                test.assert(!err);

                storageMethod.save(testObj1, function (err) {

                    test.assert(!err);

                    storageMethod.get(testObj0.id, function (err, data) {

                        test.assert(!err);
                        console.log(data);

                        test.assert(data.foo === testObj0.foo);
                    });

                    storageMethod.get('shouldnt-be-here', function (err, data) {

                        test.assert(err.displayName === 'NotFound');
                        test.assert(!data);
                    });

                    storageMethod.all(function (err, data) {

                        test.assert(!err);
                        console.log(data);
                        test.assert(
                            data[0].foo === testObj0.foo && data[1].foo === testObj1.foo ||
                            data[0].foo === testObj1.foo && data[1].foo === testObj0.foo
                        );

                        ok(true);

                    });

                });
            });
        });
    };

    xit('[integration] should pass integration spec of botkit https://github.com/howdyai/botkit#writing-your-own-storage-module', (done) => {

        /// check out => http://redis4you.com/
        const uri = 'redis://simon:61037bdf0be4e6c50c0b60c47cd52a42@50.30.35.9:3328/';
        const storage = Storage(uri);

        Promise.resolve()
            .then(_ => testStorageMethod(storage.users))
            .then(_ => testStorageMethod(storage.channels))
            .then(_ => testStorageMethod(storage.teams))
            .then(r => assert(r))
            .then(_ => done())
            .catch(done)

    });

});


// Load modules

var Squeeze = require('good-squeeze').Squeeze;
var Hoek = require('hoek');
var Moment = require('moment');
var SafeStringify = require('json-stringify-safe');
var Through = require('through2');

// Declare internals

var internals = {
    defaults: {
        format: 'YYMMDD/HHmmss.SSS',
        utc: true
    }
};

module.exports = internals.GoodConsole = function (events, options) {

    if (!(this instanceof internals.GoodConsole)) {
        return new internals.GoodConsole(events, options);
    }
    options = options || {};
    this._settings = Hoek.applyToDefaults(internals.defaults, options);
    this._filter = new Squeeze(events);
};


internals.GoodConsole.prototype.init = function (stream, emitter, callback) {

    var self = this;

    if (!stream._readableState.objectMode) {
        return callback(new Error('stream must be in object mode'));
    }

    stream.pipe(this._filter).pipe(Through.obj(function goodConsoleTransform (data, enc, next) {

        var eventName = data.event;
        var tags = [];

        /*eslint-disable */
        if (Array.isArray(data.tags)) {
            tags = data.tags.concat([]);
        } else if (data.tags != null) {
            tags = [data.tags];
        }
        /*eslint-enable */

        tags.unshift(eventName);

        if (eventName === 'response') {
            this.push(self._formatResponse(data, tags));
            return next();
        }

        var eventPrintData = {
            timestamp: data.timestamp || Date.now(),
            tags: tags,
            data: undefined
        };

        if (eventName === 'ops') {
            eventPrintData.data = {
                memory: Math.round(data.proc.mem.rss / (1024 * 1024)) + 'Mb',
                uptime: data.proc.uptime + 's',
                load: data.os.load
            };

            this.push(self._printEvent(eventPrintData));
            return next();
        }

        if (eventName === 'error') {
            eventPrintData.data = {
                message: data.error.message,
                stack: data.error.stack
            };

            this.push(self._printEvent(eventPrintData));
            return next();
        }

        if (eventName === 'request' || eventName === 'log') {
            eventPrintData.data = data.data;

            this.push(self._printEvent(eventPrintData));
            return next();
        }

        // Event that is unknown to good-console, try a defualt.
        if (data.data) {
            eventPrintData.data = data.data;
        }

        this.push(self._printEvent(eventPrintData));
        return next();
    })).pipe(process.stdout);

    callback();
};


internals.GoodConsole.prototype._printEvent = function (event) {

    var m = Moment.utc(event.timestamp);
    if (!this._settings.utc) { m.local(); }
    event.timestamp = m.format(this._settings.format);

    var output = SafeStringify(event);

    return output + '\n';
};


internals.GoodConsole.prototype._formatResponse = function (event, tags) {

    var ev = {
        timestamp: event.timestamp,
        tags: tags,
        data: {
            instance: event.instance,
            method: event.method,
            path: event.path,
            statusCode: event.statusCode,
            responseTime: event.responseTime
        }
    };

    if (event.query) {
        ev.data.query = JSON.stringify(event.query);
    }

    if (typeof event.responsePayload === 'object' && event.responsePayload) {
        ev.data.responsePayload = SafeStringify(event.responsePayload);
    }

    return this._printEvent(ev);
};

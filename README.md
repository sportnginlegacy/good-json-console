# good-json-console

JSON based console broadcasting for Good process monitor

[![Build Status](https://travis-ci.org/sportngin/good-json-console.svg?branch=master)](http://travis-ci.org/sportngin/good-json-console)![Current Version](https://img.shields.io/npm/v/good-json-console.svg)

## Usage

`good-json-console` is a [good](https://github.com/hapijs/good) reporter implementation to write [hapi](http://hapijs.com/) server events to the console.

## `GoodJsonConsole(events, [options])`
Creates a new GoodJsonConsole object with the following arguments:

- `events` - an object of key value pairs.
	- `key` - one of the supported [good events](https://github.com/hapijs/good) indicating the hapi event to subscribe to
	- `value` - a single string or an array of strings to filter incoming events. "\*" indicates no filtering. `null` and `undefined` are assumed to be "\*"
- `[options]` - optional object with the following available keys
	- `format` - [MomentJS](http://momentjs.com/docs/#/displaying/format/) format string. Defaults to 'YYMMDD/HHmmss.SSS'.
	- `utc` - boolean controlling Moment using [utc mode](http://momentjs.com/docs/#/parsing/utc/) or not. Defaults to `true`.

## Good JSON Console Methods
### `goodjsonconsole.init(stream, emitter, callback)`
Initializes the reporter with the following arguments:

- `stream` - a Node readable stream that will be the source of data for this reporter. It is assumed that `stream` is in `objectMode`.
- `emitter` - an event emitter object.
- `callback` - a callback to execute when the start function has complete all the necessary set up steps and is ready to receive data.

## Output Formats

Below are example outputs for the designated event type:

- "ops" - `{"timestamp":"150520/201400.273","tags":["ops"],"data":{"memory":"29Mb","uptime":"6s","load":[1.650390625,1.6162109375,1.65234375]}}`
- "error" - `{"timestamp":"150520/201446.771","tags":["error"],"data":{"message":"there was an error","stack":"--stack trace--"}}`
- "request" - `{"timestamp":"150520/201739.879","tags":["request"],"data":"you made a request to a resource"}`
- "log" - `{"timestamp":"150520/201739.879","tags":["log"],"data":"you logged a message"}`
- "response" - `{"timestamp":"150520/202020.863","tags":["response"],"data":{"instance":"localhost","method":"post","path":"/data","statusCode":200,"responseTime":150,"query":"{\"name\":\"adam\"}","responsePayload":"{\"foo\":\"bar\",\"value\":1}"}}`

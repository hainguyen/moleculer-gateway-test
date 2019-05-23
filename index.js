"use strict";

/**
 * This example demonstrates how to upload files to API Gateway
 *
 * Example:
 *
 *  - File upload:
 * 		Open https://localhost:4000/upload.html in the browser and upload a file. The file will be placed to the "examples/__uploads" folder.
 *
 *  - or upload file with cURL
 * 		curl -X PUT -H "Content-Type: image/png" --data-binary @test.png http://localhost:3000/upload
 */

const { ServiceBroker } = require("moleculer");
const _ = require('lodash');
// ----

const ApiGatewayService = require('moleculer-web');
const broker = new ServiceBroker({});

broker.loadService("./file.service.js");

// Load API Gateway
broker.createService({
	mixins: ApiGatewayService,
	settings: {
		path: "/upload",

		routes: [
			{
				path: "",

				// You should disable body parsers
				bodyParsers: {
					json: false,
					urlencoded: false
				},

				aliases: {
					// File upload from HTML form
					"POST /": "multipart:file.save",
				},

				// https://github.com/mscdex/busboy#busboy-methods
				busboyConfig: {
					limits: {
						files: 1
					}
				},

				callOptions: {
					meta: {
						a: 5
					}
				},

				mappingPolicy: "restrict"
			},

		],
		onError(req, res, err) {
			// Return with the error as JSON object
			res.setHeader('Content-type', 'application/json; charset=utf-8');
			res.writeHead(err.code || 500);
	  
			if (err.code === 422) {
			  const o = {};
			  err.data.forEach((e) => {
				const field = e.field.split('.').pop();
				o[field] = e.message;
			  });
	  
			  res.end(JSON.stringify({ errors: o }, null, 2));
			} else {
			  const errObj = _.pick(err, ['name', 'message', 'code', 'type', 'data']);
			  res.end(JSON.stringify(errObj, null, 2));
			}
			this.logResponse(req, res, err ? err.ctx : null);
		  },
	}
});

// Start server
broker.start();

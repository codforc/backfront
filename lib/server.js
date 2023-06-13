const { DEFAULTS } = require('./defaults');
const { render } = require('./render');

const http = require('http');
const path = require('path');

const { createReadStream } = require('fs');

const mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript',
    json: 'application/json'
};


module.exports.server = new class {
    httpServer
    config

    initializeConfig = (config) => { this.config = config; };
    
    run() {
        if(!this.httpServer) {
            this.httpServer = http.createServer(this.#listener.bind(this));
            this.httpServer.listen(this.config.port, this.config.host);
            console.log(`backfront listening on http://${this.config.host}:${this.config.port}`);
        }
    }

    #listener(req, res) {
        const route = this.config?.routes?.[req.url];
        const returnRoute = this.config?.routes?.return?.[req.url];

        if (req.url.startsWith(this.config.static)) {
            this.#sendStaticFile(req, res);
            return;
        }
        
        if(route) {
            this.#makeResponse(res, route);
        } else if(returnRoute) {
            this.#makeResponse(res, returnRoute, true);
        } else {
            res.writeHead(404, {'Content-Type': mime.txt});
            res.write(`${req.url} not found in server`);
            res.end();
        }
    }

    #makeResponse(res, routeData, returnData=false) {

        if(returnData) {
            // object with status code
            if(Array.isArray(routeData) && routeData.length == 2) {
                res.statusCode = routeData[0];
                res.setHeader('Content-Type', mime.json);
                res.write(JSON.stringify(routeData[1]));
            }else if(typeof routeData == 'object') {
                res.setHeader('Content-Type', mime.json);
                res.write(JSON.stringify(routeData));
            }else if(http.STATUS_CODES[routeData]) {
                res.statusCode = routeData;
            }

            res.end();
            return;
        }
        
        // template with context data
        if(Array.isArray(routeData) && routeData.length == 2) {
            // check data is valid file string
            if(typeof routeData[0] == 'string' && Number(routeData[0].lastIndexOf('.')) > 0) {
                if(typeof routeData[1] == 'object') {
                    let _path = path.join(this.config.workdir,
                        this.config.templates,
                        routeData[0])
    
                    let rendered = render(_path, this.config.template_engine, routeData[1]);
                    
                    res.setHeader('Content-Type', mime.html);
                    res.write(rendered);
                    res.end();
                }else {
                    console.error('context data must be an object', routeData)
                }
            }
        }

        // template without context data
        else if(typeof routeData == 'string' && Number(routeData.lastIndexOf('.')) > 0 ) {
            let ext = path.extname(routeData).slice(1);
            let _path = path.join(
                this.config.workdir,
                this.config.templates,
                routeData
            )

            let rendered = render(_path, this.config.template_engine);
                    
            res.setHeader('Content-Type', mime[ext] ?? mime.html);
            res.write(rendered);
            res.end();
        }   
    }


    #sendStaticFile(req, res) {
        const _mime = mime[path.extname(req.url).slice(1)] ?? mime.txt; 
        const _path = path.join(this.config.workdir, req.url);

        let rs = createReadStream(_path).on('open', () => {
            res.writeHead(200, {'Content-Type': _mime});
            rs.pipe(res); 
        }).on('error', () => {
            res.statusCode = 404;
            res.end();
        });
    }
}
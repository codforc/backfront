const { existsSync, readFileSync, watchFile } = require('fs');
const { parse } = require('yaml');
const { server } = require('./server');

const ngrok = require('ngrok');
const localtunnel = require('localtunnel');

const { DEFAULTS } = require('./defaults');
const { render_template } = require('./render');

module.exports.Start = class {
    configObject

    constructor(configPath) {
        this.configPath = configPath;
    }

    start() {
        if(!existsSync(this.configPath)) {
            console.error('config file is not found:', this.configPath);
            return;
        }

        watchFile(this.configPath, { interval: 2000 }, () => {
            console.log('change detected in', this.configPath);
            this.#parseConfig();
            this.#startServer();
        });

        this.#parseConfig();
        this.#startServer();
        render_template.configureNj(this.configObject);

        if(this.configObject.expose) {
            this.#expose();
        }
    }

    #startServer() {
        server.initializeConfig(this.configObject);
        server.run();        
    }

    #parseConfig() {
        var config = parse(readFileSync(this.configPath, 'utf-8'));
        this.configObject = {...DEFAULTS, ...config}; 
    }


    async #expose() {
        const provider = this.configObject.expose;
        var url;

        console.log('\nWaiting url from', provider);
        
        if(provider != 'ngrok' && provider != 'localtunnel') {
            console.error('Unknown provider:', provider);
            return;
        } else if(provider == 'ngrok') {

            if(!this.configObject.ngrok.authtoken) {
                console.error('Need authtoken for expose via ngrok');
                return;
            }

            url = await ngrok.connect({
                proto: 'http',
                addr: this.configObject.port,
                authtoken: this.configObject.ngrok.authtoken,
                region: this.configObject.ngrok.region
            });

        } else if (provider == 'localtunnel') {
            url = (await localtunnel({port: this.configObject.port})).url;
        }

        console.log(`${provider} url: ${url}`);
    }
}

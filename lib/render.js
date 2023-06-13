const { readFileSync } = require('fs');
const { join } = require('path');

const pug = require('pug');
const ejs = require('ejs');
const nj = require('nunjucks');

module.exports.render = function(path, template_engine=null, context=null) {
    if(!template_engine) {
        try {
            var html = readFileSync(path, 'utf-8');
            return html;
        }catch(e) {
            console.error(e);
            return e.toString();
        }
    }

    if (template_engine == 'ejs') return render_template.ejs(path, context);
    else if (template_engine == 'nunjucks') return render_template.nunjucks(path, context);
    else if (template_engine == 'pug') return render_template.pug(path, context);
}

const render_template = new class {
    
    configureNj(config) {
        nj.configure(join(config.workdir, config.templates), {watch: true});
    }

    ejs(path, ctx) {
        try {
            return ejs.render(readFileSync(path, 'utf-8'), ctx);
        }catch(e) {
            return e.toString();
        }
    }

    nunjucks(path, ctx) {
        try {
            return nj.render(path, ctx);
        }catch(e) {
            return e.toString();
        }
    }

    pug(path, ctx) {
        try {
            return pug.renderFile(path, ctx);
        }catch(e) {
            return e.toString();
        }
    }
}

module.exports.render_template = render_template;
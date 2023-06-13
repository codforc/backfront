
# Backfront

Backfront is easy configurable backend server for frontend developers.

## Installation
```
  npm i -g @codforc/backfront
```





## Features

- Template routing & Context data support
- Static serving
- JSON, Direct HTTP Response
- Template engine
    - Ejs
    - Pug
    - Nunjucks (Jinja2 equivalent)
- Expose via localtunnel, ngrok



## Quickstart

Create yaml config file in your project root. If you don't want to use template engine, just remove `template_engine` key in config.

### Quickstart configuration sample

```yaml
routes:
  /: 'index.pug'
  /login: 'login.pug'
  /profile: ['/profile', {'name': 'deniz'}]

  return:
    /json_profile: {'name': 'john doe', 'profile_img': 'src_to_image'}
    /login_success: [200, {'msg': 'ok', 'redirect_uri': '/'}]
    /login_error: [401, {'msg': 'wrong_credentials'}]
    /return_200: 200

template_engine: pug
```

Then,  ```backfront <config-file>.yml```, done!
## Configuration Options

`workdir`: Working directory, default path is current directory.

`templates`: Templates folder, default `/templates/`

`static`: Static folder, default `/static/`

`template_engine`: Template engine, accepts `ejs`, `pug` or `nunjucks`

`host`: Server host, `port`: Server port

`expose`: expose provider, `ngrok` or  `localtunnel`
 - If you select expose provider as ngrok.
 - ```
    expose: ngrok
    ngrok:
      authtoken: <your-authtoken>
      region: en, #default us
   ```
- Copy `alexa-remote-control/env/variables.env.template` to `alexa-remote-control/env/variables.env` and set your credentials
- Run `npm start`

## alexa-remote-control
`alexa-remote-control/alexa_remote_control.sh` is copied from https://github.com/thorsten-gehrig/alexa-remote-control  
See this repository for more information.

### Updating shell script
To use your private credentials from `alexa-remote-control/env/variables.env`, the following lines were changed compared to the original script.  
This means, they need to be changed again, if the shell script will be updated in the future.

Replace
```
SET_EMAIL='amazon_account@email.address'
SET_PASSWORD='Very_Secret_Amazon_Account_Password'
SET_MFA_SECRET=''
```
with
```
DIRECTORY=$(cd `dirname $0` && pwd)
SET_EMAIL=$(grep AMAZON_EMAIL ${DIRECTORY}/env/variables.env | cut -d '=' -f2)
SET_PASSWORD=$(grep AMAZON_PASSWORD ${DIRECTORY}/env/variables.env | cut -d '=' -f2)
SET_MFA_SECRET=$(grep AMAZON_MFA_SECRET ${DIRECTORY}/env/variables.env | cut -d '=' -f2)
```
  
## Using Docker
- `docker build -t alexa-connector .`
- `docker run -d -p 9072:9072 alexa-connector`

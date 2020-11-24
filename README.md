# Register for teacher training (prototype)

This prototype is based on the [GOV.UK prototype kit](https://github.com/alphagov/govuk-prototype-kit)

## Requirements

- node.js - version 12.x.x

## Install dependencies

`npm install`

## Start the app

`npm start`

Go to [http://localhost:3000]() in your browser.

## Deploying the developer reference version

The dev team use the prototype as a reference implementation for UI/UX. To pin 
a version and still allow development of the prototype for user research we 
deploy two versions.

### UR & UX design iteration

URL: https://register-prototype.herokuapp.com/

This version deploys automatically from merges to master and is the 'latest' version for UR and UX iteration.

### Developer Reference

URL: https://register-prototype-dev-ref.herokuapp.com/

This version deploys automatically when the `dev-ref` branch is updated and is used as the more stable 
version for developer reference. Updating this should be accompanied by planned work to update 
the production codebase.

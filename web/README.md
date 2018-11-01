# SacredCalendar

## Setup
  run `yarn install` to install all the node packages that are needed.

## Development server

Run `yarn run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Make sure your server is running on localhost:8080.

## Production Build

Run `yarn run prod` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `yarn run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `yarn run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Deploying to Firebase (only applies to those that have access to the firebase instance)

Make sure to have the firebase-tools installed.

Run `firebase login` followed by `firebase deploy`

## Technologies used in the Web Client
* Angular V7
* Angular Material
* Flex-Layout
* RXJS

# Krack Backend App

Stack:
- Node.js
- GraphQL
- Mongo
- AMQP
- Dynamsoft.BarcodeReader

Services:
- GraphQL API for admin
- AMQP Queue Consuming service
- Stream handler

Requires PYTHON_API to be running

## API Local Deploy

- Install mongo
- Create DB called 'krack'
- Run `npm start`
- Go to http://localhost:4000/
You can use Schema and Docs to check API possibilities

## AMQP Queue Consuming

- Run `npm start`
- Queues consumes in index.js

## Stream Script

To run single preloaded image run:
`node stream.js --position 2 --test`

Image should be loaded to /images/input.jpg

To pipe image stream to stream.js run:
`ffmpeg -f avfoundation  -framerate 30 -i "0" -update 1 -r 1 -f image2 - | node stream.js --position 2`
where:
- -r - output framerate
- -f - output format

For more details use
`ffmpeg -h`
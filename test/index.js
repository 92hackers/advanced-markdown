const Jasmine = require('jasmine')

const jasmine = new Jasmine()
const path = require('path')

jasmine.loadConfigFile(path.join(__dirname, '../jasmine.json'))

jasmine.execute()

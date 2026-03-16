const en = require('./src/app/i18n/locales/en.json')
const fr = require('./src/app/i18n/locales/fr.json')
const fi = require('./src/app/i18n/locales/fi.json')
const sv = require('./src/app/i18n/locales/sv.json')

function getKeys(obj, prefix) {
  prefix = prefix || ''
  return Object.entries(obj).flatMap(function([k, v]) {
    var full = prefix ? prefix + '.' + k : k
    return (typeof v === 'object' && v !== null) ? getKeys(v, full) : [full]
  })
}

var enKeys = getKeys(en)
var frKeys = new Set(getKeys(fr))
var fiKeys = new Set(getKeys(fi))
var svKeys = new Set(getKeys(sv))

var missingFr = enKeys.filter(function(k) { return !frKeys.has(k) })
var missingFi = enKeys.filter(function(k) { return !fiKeys.has(k) })
var missingSv = enKeys.filter(function(k) { return !svKeys.has(k) })
var extraFr = getKeys(fr).filter(function(k) { return !new Set(enKeys).has(k) })

console.log('=== Missing in FR (' + missingFr.length + ') ===')
missingFr.forEach(function(k) { console.log('  ' + k) })
console.log('=== Missing in FI (' + missingFi.length + ') ===')
missingFi.forEach(function(k) { console.log('  ' + k) })
console.log('=== Missing in SV (' + missingSv.length + ') ===')
missingSv.forEach(function(k) { console.log('  ' + k) })
console.log('=== Extra in FR not in EN (' + extraFr.length + ') ===')
extraFr.forEach(function(k) { console.log('  ' + k) })

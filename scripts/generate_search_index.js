const fs = require('fs');
const lunr = require('lunr')

module.exports = function buildIndex () {
  console.log('Building lunr index...');

  const filePath = require('path').resolve(__dirname, '../app/data/gis-schools.js')

  let documents = require(filePath)

  // Store postcode with and without space so we can easily search on both.
  documents.forEach((doc, index) =>  {
    if (doc.postcode) doc.postcodeCombined = doc.postcode.replace(/\s/g, "")
  })

  // The search index only contains what's needed to match and identify a
  // document, but won't give us back anything other than the document's
  // identifier (`ref`).
  //
  // This store then allows us to lookup the information about the document
  // that we can use to present the result.
  let store = {}

  const index = lunr(function () {
    this.ref('uuid')
    this.field('schoolName')
    this.field('urn')
    this.field('postcode')
    this.field('postcodeCombined')

    // Disable stemming of documents when generating the index
    this.pipeline.remove(lunr.stemmer)
    // Disable stemming of search terms run against this index
    this.searchPipeline.remove(lunr.stemmer)
    // Stop lunar from disregarding stop words like "the"
    this.pipeline.remove(lunr.stopWordFilter)

    documents.forEach(doc => {
      store[doc.uuid] = {
        uuid: doc.uuid,
        name: doc.schoolName,
        urn: doc.urn,
        town: doc.town,
        postcode: doc.postcode,
        postcodeCombined: doc.postcodeCombined
      }
      this.add(doc)
    })
  })

  fs.writeFileSync(__dirname + '/../app/lib/search-index.json', JSON.stringify({ index, store }))

  console.log('...done!');
}

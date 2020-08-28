const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.get('/record/:uuid', function (req, res) {
  // If the link already has .md on the end (for GitHub docs)
  // remove this when we render the page

  // console.log(req.)

  const records = req.session.data.records
  const record = records.find(record => record.id == req.params.uuid)

  res.render('record', { record })
})


module.exports = router

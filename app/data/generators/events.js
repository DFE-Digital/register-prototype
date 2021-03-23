const faker             = require('faker')

module.exports = (application) => {
  const events = { items: [] }

  const date = faker.helpers.randomize([
    '2019-08-12',
    '2019-08-11',
    faker.date.past(),
    faker.date.past(),
    faker.date.past(),
    faker.date.past(),
    faker.date.past()
  ])

  const addEvent = (content) => {
    events.items.push({
      title: content,
      user: 'Provider',
      date: date
    })
  }

if (application.source == 'Apply'){
  addEvent("Record imported from Apply")
}
else {
  addEvent("Record created")
}

if (application.status == 'Pending TRN'){
  addEvent("Trainee submitted for TRN")
}

if (application.status == 'TRN received'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
}

if (application.status == 'EYTS recommended'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for EYTS")
}

if (application.status == 'EYTS awarded'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for EYTS")
  addEvent("EYTS awarded")
}

if (application.status == 'QTS recommended'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for QTS")
}

if (application.status == 'QTS awarded'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for QTS")
  addEvent("QTS awarded")
}

if (application.status == 'Deferred'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee deferred")
}

if (application.status == 'Withdrawn'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee withdrawn")
}


  return events
}

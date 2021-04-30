// From https://api2.publish-teacher-training-courses.service.gov.uk/api/v3/subjects?sort=subject_name

discontinuedSubjects = [
  "Humanities",
  "Balanced Science"
]

modernLanguagesSubjects = [
  "French language",
  "English as a second or other language",
  "German language",
  "Italian language",
  "Japanese language",
  "Mandarin language",
  "Russian language",
  "Spanish language"
  // "Modern languages (other)"
]

// primarySubjects = [
//   "Primary",
//   "Primary with English",
//   "Primary with geography and history",
//   "Primary with mathematics",
//   "Primary with modern languages",
//   "Primary with physical education",
//   "Primary with science"
// ]

// Non exaustive list
// Just ones commonly seen - good enough for seeds
primarySubjects = [
  "Primary",
  "English studies",
  "Mathematics",
  "Modern languages",
  "Physical education",
  "Biology",
  "Specialist teaching",
  "Early years teaching",
  "Sport and exercise sciences",
  "Spanish language",
  "German language",
  "French language",
]

secondarySubjects = [
  "Art and design",
  "Science",
  "Biology",
  "Business studies",
  "Chemistry",
  "Citizenship",
  "Classics",
  "Communication and media studies",
  "Computing",
  "Dance",
  "Design and technology",
  "Drama",
  "Economics",
  "English studies",
  "Geography",
  "Health and social care",
  "History",
  "Mathematics",
  "Modern languages",
  "Music",
  "Philosophy",
  "Physical education",
  "Physics",
  "Psychology",
  "Religious education",
  "Social sciences"
]

coreSubjects = [
  "English studies",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology"
]

furtherEducationSubjects = []

let allSubjects = [...primarySubjects, ...secondarySubjects, ...modernLanguagesSubjects].sort()

allSubjects = [...new Set(allSubjects)]

module.exports = {
  allSubjects,
  coreSubjects,
  discontinuedSubjects,
  modernLanguagesSubjects,
  primarySubjects,
  secondarySubjects
}

let academicYears = [
  "2021 to 2022",
  "2020 to 2021",
  "2019 to 2020"
]

let defaultVisibleYears = [
  "2021 to 2022",
  "2020 to 2021"
]

let currentAcademicYear = "2020 to 2021"

let yearIndex = academicYears.findIndex(year => year == currentAcademicYear)
let nextAcademicYear = academicYears[yearIndex - 1]
let previousAcademicYear = academicYears[yearIndex + 1]

module.exports = {
    academicYears,
    defaultVisibleYears,
    currentAcademicYear,
    nextAcademicYear,
    previousAcademicYear
  }


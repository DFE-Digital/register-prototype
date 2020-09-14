module.exports = function () {
  const subjects = [
    'Accounting',
    'Additional Applied Science',
    'Additional Mathematics',
    'Additional Science',
    'Additional Science (Applied)',
    'Additional Science (General)',
    'Additional Science (Modular)',
    'Additional Science A',
    'Additional Science B',
    'Agriculture and Land Use',
    'Ancient History',
    'Ancient History (Short Course)',
    'Applications of Mathematics',
    'Applied Art and Design (Double Award)',
    'Applied Business',
    'Applied Business (Double Award)',
    'Applied Business A (Double Award)',
    'Applied Business B (Double Award)',
    'Applied French',
    'Applied French: Oral Communication (Short Course)',
    'Applied French: Written Communication (Short Course)',
    'Applied Information and Communication Technology (Double Award)',
    'Applied Information and Communication Technology A (Double Award)',
    'Applied Information and Communication Technology B (Double Award)',
    'Applied Media',
    'Applied Media (Double Award)',
    'Applied Performing Arts',
    'Applied Performing Arts (Double Award)',
    'Applied Physical Education',
    'Applied Physical Education (Double Award)',
    'Applied Science (Double Award)',
    'Arabic',
    'Arabic: Spoken Language (Short Course)',
    'Arabic: Written Language (Short Course)',
    'Archaeology',
    'Art and Design',
    'Art and Design (Short Course)',
    'Astronomy',
    'Bengali',
    'Bengali: Spoken Language (Short Course)',
    'Bengali: Written Language (Short Course)',
    'Biblical Hebrew',
    'Biology',
    'Biology (Human)',
    'Biology (Modular)',
    'Biology A',
    'Biology A (Gateway Science)',
    'Biology B',
    'Biology B (Twenty First Century Science)',
    'Business',
    'Business and Communications Systems',
    'Business and Communication Systems',
    'Business Communications',
    'Business Studies',
    'Business Studies (Short Course)',
    'Business Studies A',
    'Business Studies and Economics',
    'Business Studies B',
    'Business Studies B (Short Course)',
    'Catering',
    'Chemistry',
    'Chemistry (Modular)',
    'Chemistry A',
    'Chemistry A (Gateway Science)',
    'Chemistry B',
    'Chemistry B (Twenty First Century Science)',
    'Chinese',
    'Chinese (Mandarin)',
    'Chinese (Mandarin): Spoken Language (Short Course)',
    'Chinese (Mandarin): Written Language (Short Course)',
    'Chinese (Spoken Mandarin)',
    'Chinese (Spoken Mandarin/Spoken Cantonese)',
    'Chinese: Spoken Language (Short Course)',
    'Chinese: Written Language (Short Course)',
    'Citizenship Studies',
    'Citizenship Studies (Short Course)',
    'Classical Civilisation',
    'Classical Civilisation (Short Course)',
    'Classical Greek',
    'Classical Greek (Short Course)',
    'Combined Science',
    'Combined Science: Synergy',
    'Combined Science: Trilogy',
    'Combined Science A (Gateway Science)',
    'Combined Science B (Twenty First Century Science)',
    'Computer Science',
    'Computing',
    'Construction',
    'Construction and the Built Environment',
    'Construction and the Built Environment (Double Award)',
    'Contemporary Crafts',
    'Cymraeg',
    'Cymraeg (Peilot)',
    'Cymraeg Ail Iaith',
    'Cymraeg Ail Iaith (Short Course)',
    'Cymraeg Ail Iaith Cymhwysol',
    'Cymraeg Ail Iaith Cymhwysol (Short Course)',
    'Cymraeg Iaith',
    'Dance',
    'Design and Technology',
    'Design and Technology (Electronic Products)',
    'Design and Technology (Food Technology)',
    'Design and Technology (Graphic Products)',
    'Design and Technology (Product Design)',
    'Design and Technology (Product Design) (Short Course)',
    'Design and Technology (Resistant Materials Technology)',
    'Design and Technology (Short Course)',
    'Design and Technology (Systems and Control Technology)',
    'Design and Technology (Textiles Technology)',
    'Digital Communication',
    'Digital Technology',
    'Double Award Science',
    'Double Award Science (Double Award)',
    'Drama',
    'Dutch',
    'Dutch: Spoken Language (Short Course)',
    'Dutch: Written Language (Short Course)',
    'Economics',
    'Economics (Short Course)',
    'Electronics',
    'Electronics (Short Course)',
    'Engineering',
    'Engineering (Double Award)',
    'Engineering and Manufacturing',
    'English',
    'English (Double Award)',
    'English - Drama and Prose (Short Course)',
    'English - Spoken English Studies (Short Course)',
    'English - Communication (Short Course)',
    'English - The Language of Digital Communication (Short Course)',
    'English - The Moving Image (Short Course)',
    'English A',
    'English B',
    'English Language',
    'English Language A',
    'English Literature',
    'English Literature A',
    'English Literature B',
    'English Studies',
    'English Studies (Double Award)',
    'Environmental and Land-Based Science',
    'Environmental Science',
    'Expressive Arts',
    'Film Studies',
    'Financial Services',
    'Food and Nutrition',
    'Food Preparation and Nutrition',
    'French',
    'French (Short Course)',
    'French: Spoken Language (Short Course)',
    'French: Written Language (Short Course)',
    'French A',
    'French A (Short Course)',
    'French B',
    'Further Additional Science',
    'Further Additional Science A',
    'Further Additional Science B',
    'Further Mathematics',
    'Gaeilge',
    'General Studies',
    'Geography',
    'Geography (Short Course)',
    'Geography A',
    'Geography A (Geographical Themes)',
    'Geography A (Short Course)',
    'Geography A (Modular)',
    'Geography B',
    'Geography B (Geography for Enquiring Minds)',
    'Geography B (Short Course)',
    'Geography C',
    'Geography C (Short Course)',
    'Geology',
    'German',
    'German (Short Course)',
    'German: Spoken Language (Short Course)',
    'German: Written Language (Short Course)',
    'German A',
    'German A (Short Course)',
    'German B',
    'Government and Politics',
    'Greek',
    'Greek: Spoken Language (Short Course)',
    'Greek: Written Language (Short Course)',
    'Gujarati',
    'Gujarati: Spoken Language (Short Course)',
    'Gujarati: Written Language (Short Course)',
    'Health and Social Care',
    'Health and Social Care (Double Award)',
    'History',
    'History (Short Course)',
    'History A',
    'History A (Explaining the Modern World)',
    'History A (Short Course)',
    'History B',
    'History B (Schools History Project)',
    'History B (Short Course)',
    'History C',
    'History C (Short Course)',
    'Home Economics',
    'Home Economics (Child Development)',
    'Home Economics (Food and Nutrition)',
    'Home Economics (Textiles)',
    'Hospitality',
    'Hospitality and Catering',
    'Hospitality and Catering (Double Award)',
    'Human Health and Physiology',
    'Humanities',
    'Human Physiology and Health',
    'Information and Communication Technology',
    'Information and Communication Technology (Double Award)',
    'Information and Communication Technology (Full Course)',
    'Information and Communication Technology (Short Course)',
    'Information and Communication Technology A',
    'Information and Communication Technology A (Short Course)',
    'Information and Communication Technology B',
    'Information and Communication Technology B (Short Course)',
    'Irish',
    'Irish: Spoken Language (Short Course)',
    'Irish: Written Language (Short Course)',
    'Italian',
    'Italian: Spoken Language (Short Course)',
    'Italian: Written Language (Short Course)',
    'Japanese',
    'Japanese: Spoken Language (Short Course)',
    'Japanese: Written Language (Short Course)',
    'Journalism',
    'Journalism in the Media and Communications Industry',
    'Latin',
    'Latin (Short Course)',
    'Law',
    'Learning for Life and Work',
    'Leisure',
    'Leisure and Tourism',
    'Leisure and Tourism (Double Award)',
    'Llenyddiaeth Gymraeg',
    'Manufacturing',
    'Manufacturing (Double Award)',
    'Mathematics',
    'Mathematics (Modular)',
    'Mathematics (Linear)',
    'Mathematics (Numeracy)',
    'Mathematics A',
    'Mathematics A (Linear)',
    'Mathematics B',
    'Mathematics B (Modular)',
    'Mathematics C',
    'Mathematics D',
    'Media Studies',
    'Media Studies (Double Award)',
    'Methods in Mathematics',
    'Modern Greek',
    'Modern Hebrew',
    'Modern Hebrew: Spoken Language (Short Course)',
    'Modern Hebrew: Written Language (Short Course)',
    'Motor Vehicle and Road User Studies',
    'Motor Vehicle and Road User Studies (NI)',
    'Moving Image Arts',
    'Music',
    'Panjabi',
    'Panjabi: Spoken Language (Short Course)',
    'Panjabi: Written Language (Short Course)',
    'Performing Arts',
    'Performing Arts (Double Award)',
    'Performing Arts: Dance',
    'Persian',
    'Persian: Spoken Language (Short Course)',
    'Persian: Written Language (Short Course)',
    'Personal and Social Education (Short Course)',
    'Physical Education',
    'Physical Education (Double Award)',
    'Physical Education (Games)',
    'Physical Education (Short Course)',
    'Physical Education (Short Course) (Games)',
    'Physical Education A',
    'Physical Education A (Short Course)',
    'Physical Education B',
    'Physical Education B (Short Course)',
    'Physics',
    'Physics (Modular)',
    'Physics A',
    'Physics A (Gateway Science)',
    'Physics B',
    'Physics B (Twenty First Century Science)',
    'Polish',
    'Polish: Spoken Language (Short Course)',
    'Polish: Written Language (Short Course)',
    'Portuguese',
    'Portuguese: Spoken Language (Short Course)',
    'Portuguese: Written Language (Short Course)',
    'Preparation for Working Life (Short Course)',
    'Psychology',
    'Psychology (Short Course)',
    'Religious Studies',
    'Religious Studies (Short Course)',
    'Religious Studies A',
    'Religious Studies A (Short Course)',
    'Religious Studies B',
    'Religious Studies B (Short Course)',
    'Religious Studies C',
    'Religious Studies C (Short Course)',
    'Rural and Agricultural Science',
    'Russian',
    'Russian: Spoken Language (Short Course)',
    'Russian: Written Language (Short Course)',
    'Science',
    'Science (Double Award)',
    'Science (Modular)',
    'Science A',
    'Science A (Double Award)',
    'Science B',
    'Science B (Double Award)',
    'Science B (Science in Context)',
    'Science C',
    'Science C (Double Award)',
    'Science D',
    'Social Science',
    'Sociology',
    'Sociology (Short Course)',
    'Spanish',
    'Spanish (Short Course)',
    'Spanish: Spoken Language (Short Course)',
    'Spanish: Written Language (Short Course)',
    'Spanish A',
    'Spanish A (Short Course)',
    'Spanish B',
    'Statistics',
    'Technology and Design',
    'Travel and Tourism',
    'Turkish',
    'Turkish: Spoken Language (Short Course)',
    'Turkish: Written Language (Short Course)',
    'Urdu',
    'Urdu: Spoken Language (Short Course)',
    'Urdu: Written Language (Short Course)',
    'Use of Mathematics',
    'Welsh: First Language',
    'Welsh: Second Language',
    'Welsh: Second Language (Short Course)',
    'Welsh Literature'
  ]

  // Single ‘good pass’ grades pre-2017
  const singleGrades = [
    'A*',
    'A',
    'B',
    'C*',
    'C'
  ]

  // Single ‘good pass’ grades post-2017
  const singleGrades2017 = [
    '9',
    '8',
    '7',
    '6',
    '5',
    '4'
  ]

  // Double ‘good pass’ grades pre-2017
  const doubleGrades = [
    'A*A',
    'A*A*',
    'AA',
    'AB',
    'BB',
    'BC',
    'CC',
    'CD'
  ]

  // Double ‘good pass’ grades post-2017
  const doubleGrades2017 = [
    '9-8',
    '9-9',
    '8-8',
    '8-7',
    '7-7',
    '7-6',
    '6-6',
    '6-5',
    '5-5',
    '5-4',
    '4-4'
  ]

  // Pass / fail for each
  const simpleGradeBoundaries = [
    '4 and above',
    '3 and below',
    'Not completed or not passed',
    'Not provided'
  ]

  return {
    subjects,
    singleGrades,
    singleGrades2017,
    doubleGrades,
    doubleGrades2017,
    simpleGradeBoundaries
  }
}

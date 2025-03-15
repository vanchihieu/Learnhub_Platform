import Link from 'next/link'
import React from 'react'

const CoursesPage = () => {
  return (
    <Link href={`/teacher/create`}>
      New Course
    </Link>
  )
}

export default CoursesPage
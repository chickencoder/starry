import React from 'react'
import { H1 } from '../components/typography'

export default ({ data: { files } }) => (
  <>
    <H1>Welcome to Starry! ✨</H1>
    <a href="/about">About</a>
    <p>This is just a demo. More exciting things to come!</p>
    <ul>
      {files.map((file) => {
        return <li>{file.name}</li>
      })}
    </ul>
  </>
)

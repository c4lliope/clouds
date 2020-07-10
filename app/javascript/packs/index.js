import React from 'react'
import ReactDOM from 'react-dom'

import Appeal from "./appeal"

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Appeal />,
    document.body.appendChild(document.createElement('div')),
  )
})

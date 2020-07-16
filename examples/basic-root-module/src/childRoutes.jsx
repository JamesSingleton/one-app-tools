import React from 'react'
import ModuleRoute from 'holocron-module-route'
import HelloWorld from './components/HelloWorld'

const childRoutes = () => [
  <ModuleRoute path="hello-world" component={HelloWorld} />,
]

export default childRoutes

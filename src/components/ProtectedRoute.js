import React from 'react'
import { useAppContext } from '../context/appContext'
import { Navigate } from 'react-router-dom'


const ProtectedRoute = ({children}) => {
  
    const {user} = useAppContext()
    
    if(!user){
        return <Navigate to="/sign-in"/>
    }

    return children 

} 

export default ProtectedRoute
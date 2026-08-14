"use client"

import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import { store } from "@/redux/store"
import { hydrateUserFromToken } from "@/redux/slices/authSlice"

/**
 * Runs once on app boot to re-derive the signed-in profile from the persisted
 * JWT (preferred_username / email / roles) for returning users.
 */
function SessionHydrator() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(hydrateUserFromToken())
  }, [dispatch])
  return null
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <SessionHydrator />
      {children}
    </Provider>
  )
}

import { useState } from 'react'
import { authApi } from '../api/client'
import type { User } from '../objecttypes'

export const useAuth = () => {
  const getUser = () => {
    console.log("getUser CALLED!!!")
    const saved = localStorage.getItem('user')

    if (saved) {
      return JSON.parse(saved);
    } else {
      return null;
    }
  }

  const login = async (email: string, password: string) => {
    const user = await authApi.login(email, password)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    localStorage.removeItem('user')
  }

  return { getUser, login, logout }
}
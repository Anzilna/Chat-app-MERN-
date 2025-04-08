import { create } from 'zustand'
import { axiosInstanace } from '../lib/axios'
import { data } from 'react-router-dom';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client'

const BASE_URL =import.meta.env.MODE === 'development'?'http://localhost:5001':'/'

export const useAuthStore = create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers:[],
    socket:null,
    checkAuth: async()=>{
        try {
            const res = await axiosInstanace.get('/auth/check');
            set({authUser:res.data})
            const {connectSocket} = get()
            connectSocket()
        } catch (error) {
            console.log("error in checkAuth:",error)
            set({authUser:null})
        } finally{
            set({isCheckingAuth:false})
        }
    },
    signup:async(data)=>{
        console.log("from sign up store");
        
        set({isSigningUp:true})
        try {
            const res = await axiosInstanace.post('/auth/signup',data);
            set({authUser:res.data})
            toast.success("Acount created successfully")
            const {connectSocket} = get()
            connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isSigningUp:true})

        }
    },
    logout: async () => {
        try {
          await axiosInstanace.get("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
             const {disconnectSocket} = get()
             disconnectSocket()
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },
    login: async(data)=>{
        set({isLoggingIn:true})
        try {
            const res = await axiosInstanace.post('/auth/login',data)
            set({authUser:res.data})
            const {connectSocket} = get()
            connectSocket()
            toast.success("Logged in successfully")
        } catch (error) {
            toast.error(error.response.data.message)

        }finally{
            set({isLoggingIn:false})

        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstanace.put("/auth/update-profile", data);
          set({ authUser: res.data.updatedUser });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
      connectSocket: () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return
    
        const socket = io(BASE_URL, {
            query: { userId: authUser._id }
        })
    
        socket.connect()
        set({ socket }) 
        socket.on('getOnlineUsers',(userIds)=>{
            set({onlineUsers:userIds})
        })
    },
    
    disconnectSocket: () => {
        const socket = get().socket
        if (socket) {
            socket.disconnect()
            set({ socket: null }) 
        }
    }
    


    
}))
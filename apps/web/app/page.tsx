'use client'
import { useEffect } from "react";
import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";

export default  function Home() {
  const {user, isLoading} = useUser()
  
  const router = useRouter()

  useEffect(()=>{
     if (isLoading) return
    if(user && user.id){
        router.replace('/dashboard')
    }else{
      router.replace('/login')
    }
  },[user,router,isLoading])


  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h2>HELLO</h2>
      </div>
    </main>
  );
}
